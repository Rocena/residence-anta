import { describe, it, expect, vi } from 'vitest';

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
  updateExpense: vi.fn(),
  addActivityLog: vi.fn()
}));

import { getServerSession } from 'next-auth/next';
import { deleteProjectAction, updateExpenseAction } from '../src/lib/actions';
import * as db from '../src/lib/db';

describe('Advanced IDOR & Security Tests', () => {

  // Case 1: Non authentifié -> UNAUTHORIZED
  it('TEST AUTH: Non authentifié', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue(null);
    await expect(deleteProjectAction('test-project-1')).rejects.toThrow("UNAUTHORIZED");
  });

  // Case 2: Authentifié sans permission -> FORBIDDEN
  it('TEST AUTHZ: Authentifié mais sans permission (Locataire)', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: { id: '99', role: 'locataire', permissions: [] } });
    await expect(deleteProjectAction('test-project-1')).rejects.toThrow("FORBIDDEN");
  });

  // Case 3: Permission correcte mais objet non autorisé (Intendant -> Delete Project)
  it('TEST IDOR: Intendant ne peut pas supprimer un projet (réservé admin/propriétaire)', async () => {
    // Intendant has 'projects' permission to view/add, but NOT to delete
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: { id: '5', role: 'intendant', permissions: ['projects'] } });
    
    // We mock the DB to return a project so it doesn't throw NOT_FOUND
    vi.spyOn(db, 'getProject').mockReturnValue({ id: 'test-project-1', name: 'Test' });

    await expect(deleteProjectAction('test-project-1')).rejects.toThrow("FORBIDDEN: Seuls l'administrateur ou le propriétaire");
  });

  // Case 4: Permission correcte + objet autorisé (Admin -> Delete Project)
  it('TEST SUCCESS: Admin peut supprimer un projet', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: { id: '1', role: 'admin', permissions: ['projects'] } });
    vi.spyOn(db, 'getProject').mockReturnValue({ id: 'test-project-1', name: 'Test' });
    vi.spyOn(db, 'deleteProject').mockImplementation(() => {});

    const result = await deleteProjectAction('test-project-1');
    expect(result.success).toBe(true);
  });

  // Case 5 & 6: Manipulation du payload / État de l'objet (Intendant -> Valider une dépense)
  it('TEST PAYLOAD: Impossible de modifier le statut en Validé si on n\'est pas admin', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: { id: '5', role: 'intendant', permissions: ['expenses'] } });
    
    // Mock DB expense
    vi.spyOn(db, 'readDB').mockReturnValue({
      expenses: [{ id: 'exp-1', status: 'En attente' }]
    } as any);

    // Intendant tries to force status="Validé"
    const formData = new FormData();
    formData.append('id', 'exp-1');
    formData.append('status', 'Validé');

    await expect(updateExpenseAction(formData)).rejects.toThrow("FORBIDDEN");
  });

  it('TEST STATUS: Impossible de modifier une dépense déjà validée si on n\'est pas admin', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: { id: '5', role: 'intendant', permissions: ['expenses'] } });
    
    // Mock DB expense already validated
    vi.spyOn(db, 'readDB').mockReturnValue({
      expenses: [{ id: 'exp-1', status: 'Validé' }]
    } as any);

    // Intendant tries to change something
    const formData = new FormData();
    formData.append('id', 'exp-1');
    formData.append('status', 'En attente'); // Try to revert or change

    await expect(updateExpenseAction(formData)).rejects.toThrow("FORBIDDEN");
  });
  
});
