
-- ==============================================================================
-- TABELA DE RESERVAS DE MESA (RESTAURANTE)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.table_reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  guests integer DEFAULT 2,
  special_requests text,
  status text DEFAULT 'pending' -- pending, confirmed, cancelled
);

-- Habilitar segurança (RLS)
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;

-- 1. Qualquer pessoa (anon ou logado) pode CRIAR uma reserva
CREATE POLICY "Public create table reservations" 
ON public.table_reservations 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 2. Apenas ADMINS podem VER todas as reservas
CREATE POLICY "Admin view table reservations" 
ON public.table_reservations 
FOR SELECT 
TO authenticated 
USING (
  (select auth.jwt() ->> 'email') IN ('marioantoniojacinto02@gmail.com')
);

-- 3. Apenas ADMINS podem ATUALIZAR (confirmar/cancelar)
CREATE POLICY "Admin update table reservations" 
ON public.table_reservations 
FOR UPDATE 
TO authenticated 
USING (
  (select auth.jwt() ->> 'email') IN ('marioantoniojacinto02@gmail.com')
)
WITH CHECK (
  (select auth.jwt() ->> 'email') IN ('marioantoniojacinto02@gmail.com')
);
