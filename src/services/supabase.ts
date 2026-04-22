import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug for checking if keys are reaching the client
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Draft saving/loading will not work.');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export interface Draft {
  id: string;
  data: any;
  created_at?: string;
  updated_at?: string;
}

export async function saveDraft(data: any, id?: string) {
  if (!supabase) {
    alert('ระบบฐานข้อมูลยังไม่พร้อมใช้งาน (กรุณาตรวจสอบ Environment Variables ใน Vercel)');
    return null;
  }

  if (id) {
    // Update existing
    const { data: result, error } = await supabase
      .from('drafts')
      .update({ data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  } else {
    // Create new
    const { data: result, error } = await supabase
      .from('drafts')
      .insert([{ data }])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }
}

export async function getDraft(id: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching draft:', error);
    return null;
  }
  return data;
}
