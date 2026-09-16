import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// Accessing environment variables in Vite uses import.meta.env
// The prompt mentioned NEXT_PUBLIC_, but in Vite we map them to VITE_ 
// Or we just read whatever is available in the env if we use the platform secrets.
// To support the prompt's request while staying compatible with Vite SPA:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);

export async function uploadFile(file: File, bucket: string, path: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
