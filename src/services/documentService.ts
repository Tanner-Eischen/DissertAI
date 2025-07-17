import { supabase } from '@/lib/supabase';
import { handleAsyncOperation, handleApiError, logError, retryOperation, ERROR_MESSAGES } from '@/lib/errorHandling';

const table = 'documents';

export async function createDocument(title = 'Untitled Document') {
  return retryOperation(async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert([{ 
          title, 
          content: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        logError(error, {
          component: 'documentService',
          operation: 'createDocument',
          additionalInfo: { title }
        });
        throw new Error(handleApiError(error, 'create document'));
      }
      
      if (!data) {
        throw new Error('No data returned from document creation');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('handleApiError')) {
        throw error; // Re-throw already handled errors
      }
      
      logError(error, {
        component: 'documentService',
        operation: 'createDocument',
        additionalInfo: { title }
      });
      throw new Error(ERROR_MESSAGES.DOCUMENT_SAVE_FAILED);
    }
  }, 2, 1000, { component: 'documentService', operation: 'createDocument' });
}

export async function saveDocument(id: string, content: string) {
  return retryOperation(async () => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ 
          content, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) {
        logError(error, {
          component: 'documentService',
          operation: 'saveDocument',
          additionalInfo: { id, contentLength: content.length }
        });
        throw new Error(handleApiError(error, 'save document'));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('handleApiError')) {
        throw error; // Re-throw already handled errors
      }
      
      logError(error, {
        component: 'documentService',
        operation: 'saveDocument',
        additionalInfo: { id, contentLength: content.length }
      });
      throw new Error(ERROR_MESSAGES.DOCUMENT_SAVE_FAILED);
    }
  }, 2, 1000, { component: 'documentService', operation: 'saveDocument' });
}

export async function loadDocuments() {
  return retryOperation(async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        logError(error, {
          component: 'documentService',
          operation: 'loadDocuments'
        });
        throw new Error(handleApiError(error, 'load documents'));
      }
      
      return data || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('handleApiError')) {
        throw error; // Re-throw already handled errors
      }
      
      logError(error, {
        component: 'documentService',
        operation: 'loadDocuments'
      });
      throw new Error(ERROR_MESSAGES.DOCUMENT_LOAD_FAILED);
    }
  }, 2, 1000, { component: 'documentService', operation: 'loadDocuments' });
}

export async function updateDocumentTitle(id: string, title: string) {
  return retryOperation(async () => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ 
          title,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
        
      if (error) {
        logError(error, {
          component: 'documentService',
          operation: 'updateDocumentTitle',
          additionalInfo: { id, title }
        });
        throw new Error(handleApiError(error, 'update document title'));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('handleApiError')) {
        throw error; // Re-throw already handled errors
      }
      
      logError(error, {
        component: 'documentService',
        operation: 'updateDocumentTitle',
        additionalInfo: { id, title }
      });
      throw new Error(ERROR_MESSAGES.DOCUMENT_SAVE_FAILED);
    }
  }, 2, 1000, { component: 'documentService', operation: 'updateDocumentTitle' });
}

export async function deleteDocument(id: string) {
  return retryOperation(async () => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
        
      if (error) {
        logError(error, {
          component: 'documentService',
          operation: 'deleteDocument',
          additionalInfo: { id }
        });
        throw new Error(handleApiError(error, 'delete document'));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('handleApiError')) {
        throw error; // Re-throw already handled errors
      }
      
      logError(error, {
        component: 'documentService',
        operation: 'deleteDocument',
        additionalInfo: { id }
      });
      throw new Error(ERROR_MESSAGES.DOCUMENT_DELETE_FAILED);
    }
  }, 2, 1000, { component: 'documentService', operation: 'deleteDocument' });
}

export async function loadDocument(id: string) {
  return retryOperation(async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logError(error, {
          component: 'documentService',
          operation: 'loadDocument',
          additionalInfo: { id }
        });
        throw new Error(handleApiError(error, 'load document'));
      }
      
      if (!data) {
        throw new Error('Document not found');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('handleApiError')) {
        throw error; // Re-throw already handled errors
      }
      
      logError(error, {
        component: 'documentService',
        operation: 'loadDocument',
        additionalInfo: { id }
      });
      throw new Error(ERROR_MESSAGES.DOCUMENT_LOAD_FAILED);
    }
  }, 2, 1000, { component: 'documentService', operation: 'loadDocument' });
}

