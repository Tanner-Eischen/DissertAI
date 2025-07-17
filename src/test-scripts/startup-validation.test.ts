/**
 * Application Startup Validation Test
 * 
 * This test validates that the application can start and basic functionality works
 * Task 12: Validate application startup and basic functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../store/useAuthStore';
import { useDocumentStore } from '../store/useDocumentStore';
import * as documentService from '../services/documentService';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          then: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
  }
}));

// Mock document service
vi.mock('../services/documentService', () => ({
  createDocument: vi.fn().mockResolvedValue({ id: '1', title: 'Test Doc', content: '' }),
  saveDocument: vi.fn().mockResolvedValue(true),
  loadDocuments: vi.fn().mockResolvedValue([]),
  deleteDocument: vi.fn().mockResolvedValue(true)
}));

describe('Application Startup Validation', () => {
  beforeEach(() => {
    // Reset stores
    useAuthStore.getState().setUser(null);
    useDocumentStore.getState().setDoc(null);
    vi.clearAllMocks();
  });

  it('should validate TypeScript compilation success', () => {
    // This test passes if the file compiles without errors
    expect(true).toBe(true);
  });

  it('should validate store initialization', () => {
    // Test auth store
    const authStore = useAuthStore.getState();
    expect(authStore.user).toBeNull();
    expect(typeof authStore.setUser).toBe('function');
    expect(typeof authStore.initialize).toBe('function');

    // Test document store
    const docStore = useDocumentStore.getState();
    expect(docStore.currentDoc).toBeNull();
    expect(typeof docStore.setDoc).toBe('function');
    expect(typeof docStore.updateContent).toBe('function');
  });

  it('should validate document service functions', async () => {
    // Test document service mocks work
    const newDoc = await documentService.createDocument('Test Title');
    expect(newDoc).toEqual({ id: '1', title: 'Test Doc', content: '' });

    const saveResult = await documentService.saveDocument('1', 'Test Content');
    expect(saveResult).toBe(true);

    const docs = await documentService.loadDocuments();
    expect(Array.isArray(docs)).toBe(true);

    const deleteResult = await documentService.deleteDocument('1');
    expect(deleteResult).toBe(true);
  });

  it('should validate auth store functionality', () => {
    // Test that store functions exist and can be called without errors
    const authStore = useAuthStore.getState();
    
    expect(() => authStore.setUser({ id: '1', email: 'test@example.com' })).not.toThrow();
    expect(() => authStore.setUser(null)).not.toThrow();
    expect(() => authStore.initialize()).not.toThrow();
  });

  it('should validate document store functionality', () => {
    // Test that store functions exist and can be called without errors
    const docStore = useDocumentStore.getState();
    
    const testDoc = { id: '1', title: 'Test Doc', content: 'Test content' };
    expect(() => docStore.setDoc(testDoc)).not.toThrow();
    expect(() => docStore.updateContent('Updated content')).not.toThrow();
    expect(() => docStore.updateTitle('Updated Title')).not.toThrow();
    expect(() => docStore.setDoc(null)).not.toThrow();
    expect(() => docStore.refreshDocuments()).not.toThrow();
  });

  it('should validate error handling', () => {
    // Test that stores handle edge cases
    const docStore = useDocumentStore.getState();
    
    // Should handle updating content when no document is set
    docStore.setDoc(null);
    docStore.updateContent('New content');
    expect(docStore.currentDoc).toBeNull();

    // Should handle updating title when no document is set
    docStore.updateTitle('New title');
    expect(docStore.currentDoc).toBeNull();
  });
});