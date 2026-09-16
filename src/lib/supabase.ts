import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// Accessing environment variables in Vite uses import.meta.env
// The prompt mentioned NEXT_PUBLIC_, but in Vite we map them to VITE_ 
// Or we just read whatever is available in the env if we use the platform secrets.
// To support the prompt's request while staying compatible with Vite SPA:
const DEFAULT_SUPABASE_URL = 'https://sdkvmqvdmmypoclfivvo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka3ZtcXZkbW15cG9jbGZpdnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjE1MjIsImV4cCI6MjEwNTEzNzUyMn0.WPoslFDPFopd8hGUyyTuTQ8TAkTFdUahYUx4egDR7SY';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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
