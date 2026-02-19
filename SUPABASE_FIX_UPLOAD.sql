ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS receipt_url text;

NOTIFY pgrst, 'reload config';

DROP POLICY IF EXISTS "Users can update own bookings" ON public.reservas;

CREATE POLICY "Users can update own bookings" ON public.reservas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('resort_assets', 'resort_assets', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'resort_assets' );

DROP POLICY IF EXISTS "Public Access Select" ON storage.objects;

CREATE POLICY "Public Access Select" ON storage.objects FOR SELECT USING ( bucket_id = 'resort_assets' );