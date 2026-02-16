
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkyfosvqceaivtoinemw.supabase.co';
const supabaseKey = 'sb_publishable_qO5RGtFWZy7foscp-cHKug_Uq84YLrx';

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
