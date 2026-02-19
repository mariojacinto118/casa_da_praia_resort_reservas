
-- Habilitar a extensão de storage se necessário
-- (Geralmente já vem habilitado, mas garante que o schema existe)

-- 1. Criar o bucket 'resort_assets' se não existir
insert into storage.buckets (id, name, public)
values ('resort_assets', 'resort_assets', true)
on conflict (id) do nothing;

-- 2. POLÍTICAS DE STORAGE (Para corrigir o erro de upload)

-- Permitir acesso PÚBLICO para ver imagens (Select)
create policy "Public Access Select"
on storage.objects for select
using ( bucket_id = 'resort_assets' );

-- Permitir acesso para usuários AUTENTICADOS fazerem upload (Insert)
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'resort_assets' );

-- (Opcional) Permitir acesso PÚBLICO para upload (se quiser permitir sem login)
-- create policy "Public Upload"
-- on storage.objects for insert
-- to anon
-- with check ( bucket_id = 'resort_assets' );


-- 3. POLÍTICAS DA TABELA DE RESERVAS (Para garantir que salva no banco)

-- Habilitar RLS na tabela
alter table reservas enable row level security;

-- Permitir que usuários autenticados criem reservas
create policy "Users can create bookings"
on reservas for insert
to authenticated
with check ( auth.uid() = user_id );

-- Permitir que usuários vejam suas próprias reservas
create policy "Users can view own bookings"
on reservas for select
to authenticated
using ( auth.uid() = user_id );

-- 4. POLÍTICAS DO CHAT (Live Chat)
alter table live_chat enable row level security;

create policy "Public/Auth insert chat"
on live_chat for insert
to public
with check (true);

create policy "Public/Auth select chat"
on live_chat for select
to public
using (true);
