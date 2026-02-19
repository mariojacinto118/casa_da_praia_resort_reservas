
-- ==============================================================================
-- SCRIPT DE PERMISSÃO TOTAL (SUPER ADMIN)
-- Copie e execute este script no SQL Editor do Supabase
-- ==============================================================================

-- 1. Habilitar segurança nas tabelas
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat ENABLE ROW LEVEL SECURITY;

-- 2. Limpar TODAS as políticas antigas para evitar conflitos
-- (Tenta dropar todas as versões anteriores conhecidas)
DROP POLICY IF EXISTS "Universal Access for Admin - Reservas" ON public.reservas;
DROP POLICY IF EXISTS "Admin Update All - Reservas" ON public.reservas;
DROP POLICY IF EXISTS "View Bookings Policy" ON public.reservas;
DROP POLICY IF EXISTS "Update Bookings Policy" ON public.reservas;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.reservas;
DROP POLICY IF EXISTS "Users can create bookings" ON public.reservas;
DROP POLICY IF EXISTS "Create Bookings Policy" ON public.reservas;
DROP POLICY IF EXISTS "Reservas_Select" ON public.reservas;
DROP POLICY IF EXISTS "Reservas_Insert" ON public.reservas;
DROP POLICY IF EXISTS "Reservas_Update" ON public.reservas;
DROP POLICY IF EXISTS "Reservas_Delete" ON public.reservas;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.reservas;
DROP POLICY IF EXISTS "Reservas_Select_Final" ON public.reservas;
DROP POLICY IF EXISTS "Reservas_Update_Final" ON public.reservas;
DROP POLICY IF EXISTS "Reservas_Insert_Final" ON public.reservas;
DROP POLICY IF EXISTS "Reservas_Delete_Final" ON public.reservas;

DROP POLICY IF EXISTS "Universal Access for Admin - Restaurante" ON public.table_reservations;
DROP POLICY IF EXISTS "Admin Update All - Restaurante" ON public.table_reservations;
DROP POLICY IF EXISTS "Public create table reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Admin view table reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Restaurante_Insert" ON public.table_reservations;
DROP POLICY IF EXISTS "Restaurante_Select" ON public.table_reservations;
DROP POLICY IF EXISTS "Restaurante_Update" ON public.table_reservations;
DROP POLICY IF EXISTS "Restaurante_Insert_Final" ON public.table_reservations;
DROP POLICY IF EXISTS "Restaurante_Select_Final" ON public.table_reservations;
DROP POLICY IF EXISTS "Restaurante_Update_Final" ON public.table_reservations;

DROP POLICY IF EXISTS "Admin View Messages" ON public.messages;
DROP POLICY IF EXISTS "Public insert messages" ON public.messages;
DROP POLICY IF EXISTS "Messages_Insert" ON public.messages;
DROP POLICY IF EXISTS "Messages_Select" ON public.messages;
DROP POLICY IF EXISTS "Messages_Insert_Final" ON public.messages;
DROP POLICY IF EXISTS "Messages_Select_Final" ON public.messages;

DROP POLICY IF EXISTS "Public read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admin update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admin insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Rooms_Select_Final" ON public.rooms;
DROP POLICY IF EXISTS "Rooms_Update_Final" ON public.rooms;
DROP POLICY IF EXISTS "Rooms_Insert_Final" ON public.rooms;

-- ==============================================================================
-- 3. CRIAR NOVAS POLÍTICAS (ADMIN = marioantoniojacinto02@gmail.com)
-- ==============================================================================

-- --- TABELA: RESERVAS (QUARTOS) ---

-- Visualização: Admin vê tudo. Usuário comum vê apenas as suas.
CREATE POLICY "Reservas_Select_Final" ON public.reservas
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  lower((select auth.jwt() ->> 'email')) = 'marioantoniojacinto02@gmail.com'
);

-- Edição: Admin edita tudo (status). Usuário edita a sua (ex: anexar recibo).
CREATE POLICY "Reservas_Update_Final" ON public.reservas
FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  lower((select auth.jwt() ->> 'email')) = 'marioantoniojacinto02@gmail.com'
);

-- Criação: Qualquer usuário logado pode criar reserva.
CREATE POLICY "Reservas_Insert_Final" ON public.reservas
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Exclusão: Apenas Admin pode deletar.
CREATE POLICY "Reservas_Delete_Final" ON public.reservas
FOR DELETE TO authenticated
USING (
  lower((select auth.jwt() ->> 'email')) = 'marioantoniojacinto02@gmail.com'
);

-- --- TABELA: RESTAURANTE (Mesa) ---

-- Criação: Aberto ao público.
CREATE POLICY "Restaurante_Insert_Final" ON public.table_reservations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Visualização e Edição: Apenas Admin.
CREATE POLICY "Restaurante_Select_Final" ON public.table_reservations
FOR SELECT TO authenticated
USING (
  lower((select auth.jwt() ->> 'email')) = 'marioantoniojacinto02@gmail.com'
);

CREATE POLICY "Restaurante_Update_Final" ON public.table_reservations
FOR UPDATE TO authenticated
USING (
  lower((select auth.jwt() ->> 'email')) = 'marioantoniojacinto02@gmail.com'
);

-- --- TABELA: MENSAGENS (Contato) ---

-- Criação: Aberto ao público.
CREATE POLICY "Messages_Insert_Final" ON public.messages
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Visualização: Apenas Admin.
CREATE POLICY "Messages_Select_Final" ON public.messages
FOR SELECT TO authenticated
USING (
  lower((select auth.jwt() ->> 'email')) = 'marioantoniojacinto02@gmail.com'
);

-- --- TABELA: QUARTOS (Configurações) ---

-- Leitura: Todo mundo (para exibir no site).
CREATE POLICY "Rooms_Select_Final" ON public.rooms
FOR SELECT
USING (true);

-- Edição: Apenas Admin (mudar preço/quantidade).
CREATE POLICY "Rooms_Update_Final" ON public.rooms
FOR UPDATE TO authenticated
USING (
  lower((select auth.jwt() ->> 'email')) = 'marioantoniojacinto02@gmail.com'
);

CREATE POLICY "Rooms_Insert_Final" ON public.rooms
FOR INSERT TO authenticated
WITH CHECK (
  lower((select auth.jwt() ->> 'email')) = 'marioantoniojacinto02@gmail.com'
);

-- --- LIVE CHAT ---

DROP POLICY IF EXISTS "Chat_Insert" ON public.live_chat;
DROP POLICY IF EXISTS "Chat_Select" ON public.live_chat;

CREATE POLICY "Chat_Insert" ON public.live_chat FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Chat_Select" ON public.live_chat FOR SELECT TO public USING (true);

-- 4. Atualizar cache do Supabase
NOTIFY pgrst, 'reload config';
