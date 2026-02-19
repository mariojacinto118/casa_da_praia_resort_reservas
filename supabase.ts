
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DE ACESSO ---
// 1. Vá em Supabase Dashboard > Project Settings > API
// 2. Copie a "Project URL" e a "anon public key"
// 3. Cole abaixo:

const supabaseUrl = 'https://bkyfosvqceaivtoinemw.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJreWZvc3ZxY2VhaXZ0b2luZW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjY0ODQsImV4cCI6MjA4NjgwMjQ4NH0.xPzRc9avjz3UPd0_mk-6AbjP-NY26sbNbx58IHwUNU0'; 

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper para obter a URL completa de uma imagem no bucket 'resort_assets'.
 * @param path O caminho do arquivo (ex: 'suites/standard.jpg')
 * @returns A URL pública completa
 */
export const getStorageUrl = (path: string) => {
  if (!path) return '';
  // Se já for uma URL completa (ex: picsum para testes), retorna ela mesma
  if (path.startsWith('http')) return path;
  
  const { data } = supabase.storage.from('resort_assets').getPublicUrl(path);
  return data.publicUrl;
};
