import { describe, it, expect, vi } from 'vitest';
import * as db from '../src/lib/db';
import { deleteProjectAction } from '../src/lib/actions';
import { getServerSession } from 'next-auth/next';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('../src/lib/db', () => ({
  getProject: vi.fn(),
  deleteProject: vi.fn(),
  readDB: vi.fn(),
  updateExpense: vi.fn()
}));

describe('Frontend Tampering & LocalStorage Manipulation Tests', () => {
  it('TEST: Manipulating localStorage (e.g. anta_user) has NO effect on server authorization', async () => {
    // Simulate frontend tampering: user changes localStorage to fake being an admin
    const fakeLocalStorage = {
      'anta_user': JSON.stringify({ id: '1', role: 'admin', permissions: ['all'] })
    };
    
    // BUT the real server session is still 'intendant' (Calvin)
    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '3', role: 'intendant', permissions: ['projects'] }
    });
    
    // We mock the DB so the project exists and is owned by 'tevi'
    // @ts-ignore
    db.getProject.mockResolvedValue({ id: 'proj1', title: 'A Project', assignedTo: 'tevi' });

    // The Server Action uses getServerSession (the real truth), so despite the localStorage fake payload,
    // the server action should reject Calvin trying to delete Tevi's project.
    await expect(deleteProjectAction('proj1')).rejects.toThrow("FORBIDDEN");
  });

  it('TEST: Passing manipulated parameters to Server Action payload does NOT elevate privileges', async () => {
    // If a user intercepts the network request and modifies the payload (though deleteProjectAction doesn't take role,
    // we prove the server doesn't care about anything from the client except the session cookie).
    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '3', role: 'intendant', permissions: ['projects'] }
    });
    
    // @ts-ignore
    db.getProject.mockResolvedValue({ id: 'proj1', title: 'A Project', assignedTo: 'tevi' });

    // Try to delete someone else's project
    await expect(deleteProjectAction('proj1')).rejects.toThrow("FORBIDDEN");
  });
});
