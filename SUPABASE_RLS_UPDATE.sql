-- Execute este comando no SQL Editor do Supabase para corrigir o problema de não conseguir mudar o status
-- Isso permite que usuários autenticados (Admin) atualizem a tabela 'reservas'

create policy "Allow update for authenticated users"
on reservas
for update
to authenticated
using (true)
with check (true);