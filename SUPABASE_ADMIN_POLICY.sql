
-- Habilitar RLS na tabela rooms (caso ainda não esteja)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas de update/insert para evitar conflitos
DROP POLICY IF EXISTS "Admin update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admin insert rooms" ON public.rooms;

-- Permitir que usuários autenticados (Admins) atualizem a tabela rooms
CREATE POLICY "Admin update rooms"
ON public.rooms
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir que usuários autenticados insiram novos quartos ou atualizem existentes via upsert
CREATE POLICY "Admin insert rooms"
ON public.rooms
FOR INSERT
TO authenticated
WITH CHECK (true);
