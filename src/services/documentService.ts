// documentService.ts placeholder
import { supabase } from '@/lib/supabase';

const table = 'documents';
const userId = '00000000-0000-0000-0000-000000000000'; // placeholder

export async function createDocument(title = 'Untitled') {
  const { data, error } = await supabase
    .from(table)
    .insert([{ title, content: ''}])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveDocument(id: string, content: string) {
  const { error } = await supabase
    .from(table)
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
