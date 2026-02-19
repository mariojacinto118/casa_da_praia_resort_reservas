
-- ==============================================================================
-- SCRIPT MESTRE: CONFIGURAÇÃO COMPLETA (Tabelas, Storage e Permissões)
-- Copie e cole este código no SQL Editor do Supabase e clique em "RUN"
-- ==============================================================================

-- 1. CRIAR OU ATUALIZAR TABELA DE RESERVAS
CREATE TABLE IF NOT EXISTS public.reservas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  customer_name text,
  email text,
  phone text,
  check_in date,
  check_out date,
  guests jsonb,
  room_id text,
  activities text[],
  total_amount numeric,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'transfer',
  payment_details jsonb,
  receipt_url text
);

-- Garantir que colunas críticas existam (caso a tabela já existisse antes)
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 2. CRIAR TABELA DE INVENTÁRIO (QUARTOS)
CREATE TABLE IF NOT EXISTS public.rooms (
  id text PRIMARY KEY,
  name text,
  quantity integer DEFAULT 1
);

-- Inserir quartos padrão se não existirem
INSERT INTO public.rooms (id, name, quantity) VALUES
('std', 'Suíte Standard', 5),
('dlx', 'Suíte Deluxe', 6),
('dlxp', 'Suíte Deluxe Premium', 7),
('chalet', 'Chalé com Piscina', 5),
('master', 'Suíte Master com Jango', 3),
('duplex', 'Duplex', 4),
('duplex_prem', 'Duplex Premium c/ Jango', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. CONFIGURAR STORAGE (BUCKET)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resort_assets', 'resort_assets', true) 
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage (Upload e Leitura)
DROP POLICY IF EXISTS "Public Access Select" ON storage.objects;
CREATE POLICY "Public Access Select" ON storage.objects FOR SELECT USING ( bucket_id = 'resort_assets' );

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'resort_assets' );

-- 4. CONFIGURAR SEGURANÇA (RLS) DAS TABELAS

-- Habilitar RLS
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas para evitar erros de duplicidade
DROP POLICY IF EXISTS "View Bookings Policy" ON public.reservas;
DROP POLICY IF EXISTS "Update Bookings Policy" ON public.reservas;
DROP POLICY IF EXISTS "Delete Bookings Policy" ON public.reservas;
DROP POLICY IF EXISTS "Admin Delete Policy" ON public.reservas;
DROP POLICY IF EXISTS "Create Bookings Policy" ON public.reservas;
DROP POLICY IF EXISTS "Users can create bookings" ON public.reservas;
DROP POLICY IF EXISTS "Public read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admin update rooms" ON public.rooms;

-- --- POLÍTICAS DA TABELA RESERVAS ---

-- Visualizar: Admin vê tudo, Usuário vê as suas
CREATE POLICY "View Bookings Policy" ON public.reservas
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  (select auth.jwt() ->> 'email') IN ('marioantoniojacinto02@gmail.com')
);

-- Criar: Qualquer usuário autenticado
CREATE POLICY "Create Bookings Policy" ON public.reservas
FOR INSERT TO authenticated
WITH CHECK ( auth.uid() = user_id );

-- Atualizar: Admin muda status/dados, Usuário anexa comprovativo (update na própria reserva)
CREATE POLICY "Update Bookings Policy" ON public.reservas
FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  (select auth.jwt() ->> 'email') IN ('marioantoniojacinto02@gmail.com')
)
WITH CHECK (
  auth.uid() = user_id 
  OR 
  (select auth.jwt() ->> 'email') IN ('marioantoniojacinto02@gmail.com')
);

-- Deletar: Apenas Admin
CREATE POLICY "Delete Bookings Policy" ON public.reservas
FOR DELETE TO authenticated
USING (
  (select auth.jwt() ->> 'email') IN ('marioantoniojacinto02@gmail.com')
);

-- --- POLÍTICAS DA TABELA ROOMS ---

-- Todos podem ler (para ver disponibilidade no site)
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);

-- Apenas Admin pode alterar quantidade/preço no banco
CREATE POLICY "Admin update rooms" ON public.rooms FOR UPDATE TO authenticated USING (
  (select auth.jwt() ->> 'email') IN ('marioantoniojacinto02@gmail.com')
);

-- 5. FINALIZAR
NOTIFY pgrst, 'reload config';
