
-- ==============================================================================
-- CORREÇÃO DE PERMISSÕES (GOD MODE PARA O ADMIN)
-- Execute este script para garantir que seu email vê TUDO.
-- ==============================================================================

-- 1. LIMPEZA DE POLÍTICAS ANTIGAS (Para evitar conflitos)
DROP POLICY IF EXISTS "View Bookings Policy" ON public.reservas;
DROP POLICY IF EXISTS "Admin Select All Reservas" ON public.reservas;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.reservas;
DROP POLICY IF EXISTS "Admin view table reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Admin view messages" ON public.messages;

-- 2. POLÍTICA PARA RESERVAS DE QUARTOS (Tabela 'reservas')
-- Permite que o dono da reserva veja a sua E o admin veja TODAS.
CREATE POLICY "Universal Access for Admin - Reservas"
ON public.reservas
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  lower(auth.jwt() ->> 'email') = 'marioantoniojacinto02@gmail.com'
);

-- Permite Admin atualizar status de qualquer reserva
CREATE POLICY "Admin Update All - Reservas"
ON public.reservas
FOR UPDATE
TO authenticated
USING (
  lower(auth.jwt() ->> 'email') = 'marioantoniojacinto02@gmail.com'
)
WITH CHECK (
  lower(auth.jwt() ->> 'email') = 'marioantoniojacinto02@gmail.com'
);

-- 3. POLÍTICA PARA RESERVAS DE RESTAURANTE (Tabela 'table_reservations')
-- Admin vê todas.
CREATE POLICY "Universal Access for Admin - Restaurante"
ON public.table_reservations
FOR SELECT
TO authenticated
USING (
  lower(auth.jwt() ->> 'email') = 'marioantoniojacinto02@gmail.com'
);

-- Admin atualiza todas.
CREATE POLICY "Admin Update All - Restaurante"
ON public.table_reservations
FOR UPDATE
TO authenticated
USING (
  lower(auth.jwt() ->> 'email') = 'marioantoniojacinto02@gmail.com'
);

-- 4. POLÍTICA PARA MENSAGENS DE CONTACTO (Tabela 'messages')
CREATE POLICY "Admin View Messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  lower(auth.jwt() ->> 'email') = 'marioantoniojacinto02@gmail.com'
);

-- 5. RECARREGAR CONFIGURAÇÕES
NOTIFY pgrst, 'reload config';
