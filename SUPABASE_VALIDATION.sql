
-- ==============================================================================
-- SCRIPT DE VALIDAÇÃO DE DISPONIBILIDADE (ANTI-OVERBOOKING)
-- ==============================================================================
-- INSTRUÇÕES IMPORTANTES:
-- 1. Copie TODO o conteúdo deste arquivo.
-- 2. Cole no SQL Editor do Supabase.
-- 3. NÃO SELECIONE linhas com o mouse. Apenas clique no botão verde "RUN".
-- ==============================================================================

-- 1. Limpar triggers e funções antigas para evitar conflitos
DROP TRIGGER IF EXISTS check_availability_on_insert ON public.reservas;
DROP FUNCTION IF EXISTS check_availability_trigger();

-- 2. Garantir que a tabela de quartos (inventário) existe
CREATE TABLE IF NOT EXISTS public.rooms (
  id text PRIMARY KEY,
  name text NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar leitura para todos (para o site saber quantos quartos existem)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Recriar política de acesso público
DROP POLICY IF EXISTS "Public read rooms" ON public.rooms;
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);

-- 3. Atualizar o inventário com as quantidades corretas
INSERT INTO public.rooms (id, name, quantity) VALUES
('std', 'Suíte Standard', 5),
('dlx', 'Suíte Deluxe', 6),
('dlxp', 'Suíte Deluxe Premium', 7),
('chalet', 'Chalé com Piscina', 5),
('master', 'Suíte Master com Jango', 3),
('duplex', 'Duplex', 4),
('duplex_prem', 'Duplex Premium c/ Jango', 4)
ON CONFLICT (id) DO UPDATE SET 
  quantity = EXCLUDED.quantity,
  name = EXCLUDED.name;

-- 4. Criar a Função de Validação (O "Cérebro" do sistema)
CREATE OR REPLACE FUNCTION check_availability_trigger()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  max_qty int;
  current_bookings int;
  room_exists boolean;
BEGIN
  -- A. Verificar se o quarto existe na tabela de controle
  SELECT EXISTS(SELECT 1 FROM public.rooms WHERE id = new.room_id) INTO room_exists;
  
  -- Se não existir controle para este quarto, permite a reserva sem checar
  IF NOT room_exists THEN
     RETURN new;
  END IF;

  -- B. Obter a quantidade máxima permitida
  SELECT quantity INTO max_qty FROM public.rooms WHERE id = new.room_id;

  -- C. Contar reservas sobrepostas ativas
  -- (StartA < EndB) e (EndA > StartB) é a fórmula de sobreposição de datas
  SELECT count(*) INTO current_bookings
  FROM public.reservas
  WHERE room_id = new.room_id
  AND status != 'cancelled'
  AND (
    (check_in < new.check_out) AND (check_out > new.check_in)
  );

  -- D. Se já estiver cheio (reservas atuais >= quantidade total), bloquear
  IF current_bookings >= max_qty THEN
    RAISE EXCEPTION 'Infelizmente não há mais disponibilidade para este quarto nas datas selecionadas.';
  END IF;

  RETURN new;
END;
$func$;

-- 5. Ligar a Função à Tabela de Reservas
CREATE TRIGGER check_availability_on_insert
BEFORE INSERT ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION check_availability_trigger();
