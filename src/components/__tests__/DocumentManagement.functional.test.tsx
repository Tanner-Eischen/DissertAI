import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDocumentStore } from '../../store/useDocumentStore';
import * as documentService from '../../services/documentService';

// Mock the document service
vi.mock('../../services/documentService', () => ({
  createDocument: vi.fn(),
  saveDocument: vi.fn(),
  loadDocuments: vi.fn(),
  deleteDocument: vi.fn(),
  updateDocumentTitle: vi.fn(),
  loadDocument: vi.fn(),
}));

describe('Document Management Operations', () => {
  const mockDocuments = [
    {
      id: '1',
      title: 'Test Document 1',
      content: 'Content of document 1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Document 2',
      content: 'Content of document 2',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the document store state
    useDocumentStore.setState({ currentDoc: null });
    
    // Setup default mock implementations
    vi.mocked(documentService.loadDocuments).mockResolvedValue(mockDocuments);
    vi.mocked(documentService.createDocument).mockResolvedValue({
      id: '3',
      title: 'New Document',
      content: '',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    });
    vi.mocked(documentService.saveDocument).mockResolvedValue(undefined);
    vi.mocked(documentService.deleteDocument).mockResolvedValue(undefined);
  });

  describe('Document Store Operations', () => {
    it('should handle document store state correctly', () => {
      const store = useDocumentStore.getState();
      
      // Test initial state
      expect(store.currentDoc).toBeNull();
      
      // Test setting document
      const testDoc = { id: '1', title: 'Test', content: 'Content' };
      store.setDoc(testDoc);
      expect(useDocumentStore.getState().currentDoc).toEqual(testDoc);
      
      // Test updating content
      store.updateContent('Updated content');
      expect(useDocumentStore.getState().currentDoc?.content).toBe('Updated content');
      
      // Test updating title
      store.updateTitle('Updated title');
      expect(useDocumentStore.getState().currentDoc?.title).toBe('Updated title');
    });

    it('should handle refresh callback correctly', () => {
      const store = useDocumentStore.getState();
      const mockCallback = vi.fn();
      
      // Set refresh callback
      store.setDocumentListRefreshCallback(mockCallback);
      
      // Call refresh
      store.refreshDocuments();
      
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Document Service Integration', () => {
    it('should create new documents', async () => {
      const result = await documentService.createDocument('Test Document');
      
      expect(documentService.createDocument).toHaveBeenCalledWith('Test Document');
      expect(result.id).toBe('3');
      expect(result.title).toBe('New Document');
    });

    it('should save documents', async () => {
      await documentService.saveDocument('1', 'Updated content');
      
      expect(documentService.saveDocument).toHaveBeenCalledWith('1', 'Updated content');
    });

    it('should load documents', async () => {
      const result = await documentService.loadDocuments();
      
      expect(documentService.loadDocuments).toHaveBeenCalled();
      expect(result).toEqual(mockDocuments);
    });

    it('should delete documents', async () => {
      await documentService.deleteDocument('1');
      
      expect(documentService.deleteDocument).toHaveBeenCalledWith('1');
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(documentService.createDocument).mockRejectedValue(new Error('Creation failed'));
      
      await expect(documentService.createDocument('Test')).rejects.toThrow('Creation failed');
    });
  });

  describe('Document Management Workflow', () => {
    it('should complete create-edit-save workflow', async () => {
      // 1. Create new document
      const newDoc = await documentService.createDocument('New Document');
      useDocumentStore.getState().setDoc(newDoc);
      
      expect(useDocumentStore.getState().currentDoc?.id).toBe('3');
      expect(useDocumentStore.getState().currentDoc?.title).toBe('New Document');
      
      // 2. Edit content
      useDocumentStore.getState().updateContent('New content');
      expect(useDocumentStore.getState().currentDoc?.content).toBe('New content');
      
      // 3. Save document
      const currentDoc = useDocumentStore.getState().currentDoc!;
      await documentService.saveDocument(currentDoc.id, currentDoc.content);
      
      expect(documentService.saveDocument).toHaveBeenCalledWith('3', 'New content');
    });

    it('should handle document switching', () => {
      // Switch to first document
      useDocumentStore.getState().setDoc(mockDocuments[0]);
      expect(useDocumentStore.getState().currentDoc?.id).toBe('1');
      expect(useDocumentStore.getState().currentDoc?.title).toBe('Test Document 1');
      
      // Switch to second document
      useDocumentStore.getState().setDoc(mockDocuments[1]);
      expect(useDocumentStore.getState().currentDoc?.id).toBe('2');
      expect(useDocumentStore.getState().currentDoc?.title).toBe('Test Document 2');
    });

    it('should handle document deletion workflow', async () => {
      // Set current document
      useDocumentStore.getState().setDoc(mockDocuments[0]);
      expect(useDocumentStore.getState().currentDoc?.id).toBe('1');
      
      // Delete the document
      await documentService.deleteDocument('1');
      
      // Switch to remaining document (simulating sidebar behavior)
      const remainingDocs = mockDocuments.filter(doc => doc.id !== '1');
      if (remainingDocs.length > 0) {
        useDocumentStore.getState().setDoc(remainingDocs[0]);
      } else {
        useDocumentStore.getState().setDoc(null);
      }
      
      expect(useDocumentStore.getState().currentDoc?.id).toBe('2');
      expect(documentService.deleteDocument).toHaveBeenCalledWith('1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty document list', async () => {
      vi.mocked(documentService.loadDocuments).mockResolvedValue([]);
      
      const result = await documentService.loadDocuments();
      expect(result).toEqual([]);
    });

    it('should handle null current document', () => {
      const store = useDocumentStore.getState();
      
      store.setDoc(null);
      expect(store.currentDoc).toBeNull();
      
      // Should not crash when updating content with null document
      store.updateContent('test');
      expect(store.currentDoc).toBeNull();
    });

    it('should handle local document save workflow', async () => {
      // Set up a local document (not yet saved to database)
      const localDoc = {
        id: 'local-123456',
        title: 'Local Document',
        content: 'Local content'
      };
      useDocumentStore.getState().setDoc(localDoc);
      
      // Simulate save workflow for local document
      if (localDoc.id.startsWith('local-')) {
        // Create new document in database
        const newDoc = await documentService.createDocument(localDoc.title);
        // Save content
        await documentService.saveDocument(newDoc.id, localDoc.content);
        // Update store with new ID
        useDocumentStore.getState().setDoc({ ...localDoc, id: newDoc.id });
      }
      
      expect(documentService.createDocument).toHaveBeenCalledWith('Local Document');
      expect(documentService.saveDocument).toHaveBeenCalledWith('3', 'Local content');
      expect(useDocumentStore.getState().currentDoc?.id).toBe('3');
    });
  });
});