import { describe, it, expect, vi } from 'vitest';

// Mock next-auth server functions to test our serverAuth layer
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from 'next-auth/next';
import { requireAuth, requireRole, requirePermission } from '../src/lib/serverAuth';

describe('Server Authentication & Authorization (Phase 3)', () => {
  it('should throw UNAUTHORIZED when no session exists', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValueOnce(null);
    
    await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
  });

  it('should return user when valid session exists', async () => {
    const mockUser = { id: '1', role: 'admin', permissions: [] };
    // @ts-ignore
    getServerSession.mockResolvedValueOnce({ user: mockUser });
    
    const user = await requireAuth();
    expect(user.id).toBe('1');
    expect(user.role).toBe('admin');
  });

  it('should throw FORBIDDEN when user lacks required role', async () => {
    const mockUser = { id: '2', role: 'intendant', permissions: [] };
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: mockUser });
    
    await expect(requireRole(['admin', 'gestionnaire'])).rejects.toThrow("FORBIDDEN");
  });

  it('should allow access when user has required role', async () => {
    const mockUser = { id: '2', role: 'intendant', permissions: [] };
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: mockUser });
    
    const user = await requireRole(['intendant']);
    expect(user.id).toBe('2');
  });

  it('should allow admin to bypass permission checks', async () => {
    const mockUser = { id: '1', role: 'admin', permissions: [] };
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: mockUser });
    
    const user = await requirePermission('finance.validate');
    expect(user.id).toBe('1'); // Admin gets through without explicit permission
  });

  it('should throw FORBIDDEN if user lacks specific permission', async () => {
    const mockUser = { id: '5', role: 'intendant', permissions: ['projects.view'] };
    // @ts-ignore
    getServerSession.mockResolvedValue({ user: mockUser });
    
    await expect(requirePermission('expenses.approve')).rejects.toThrow("FORBIDDEN");
  });
});
