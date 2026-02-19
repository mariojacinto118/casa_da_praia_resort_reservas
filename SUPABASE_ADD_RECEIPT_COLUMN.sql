
-- ==============================================================================
-- SOLUÇÃO DO ERRO DE UPLOAD (PGRST204)
-- ==============================================================================
-- O erro ocorre porque a tabela 'reservas' no banco de dados não tem a coluna 
-- 'receipt_url' para guardar o link do comprovativo.
--
-- COMO CORRIGIR:
-- 1. Copie todo o código abaixo.
-- 2. Vá ao Painel do Supabase > SQL Editor.
-- 3. Cole o código e clique no botão "RUN".
-- ==============================================================================

-- 1. Adicionar a coluna 'receipt_url' (Obrigatório para o anexo funcionar)
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS receipt_url text;

-- 2. Adicionar outras colunas que podem estar faltando para o funcionamento completo
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'transfer';

ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- 3. Atualizar o cache do Supabase para reconhecer as novas colunas imediatamente
NOTIFY pgrst, 'reload config';
