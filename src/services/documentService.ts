import { supabase } from '@/lib/supabase';

const table = 'documents';

export async function createDocument(title = 'Untitled Document') {
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
  
  if (error) throw error;
  return data;
}

export async function saveDocument(id: string, content: string) {
  const { error } = await supabase
    .from(table)
    .update({ 
      content, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);
  
  if (error) throw error;
}

export async function loadDocuments() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function loadDocument(id: string) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}