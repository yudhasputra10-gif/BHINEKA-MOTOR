-- Jalankan di Supabase SQL Editor.
-- Kebijakan untuk pengunjung: boleh mengirim ulasan pending dan hanya melihat ulasan approved.
-- Admin: harus login melalui Supabase Auth dan memiliki app_metadata.role = 'admin'.

alter table public.reviews enable row level security;

drop policy if exists "Pelanggan mengirim ulasan" on public.reviews;
drop policy if exists "Publik melihat ulasan disetujui" on public.reviews;
drop policy if exists "Admin melihat semua ulasan" on public.reviews;
drop policy if exists "Admin mengubah status ulasan" on public.reviews;

create policy "Pelanggan mengirim ulasan"
on public.reviews
for insert
to anon, authenticated
with check (status = 'pending');

create policy "Publik melihat ulasan disetujui"
on public.reviews
for select
to anon, authenticated
using (status = 'approved');

create policy "Admin melihat semua ulasan"
on public.reviews
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin mengubah status ulasan"
on public.reviews
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Setelah membuat akun admin di Authentication > Users, jalankan perintah ini
-- dengan email admin yang benar:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--     || '{"role":"admin"}'::jsonb
-- where email = 'EMAIL_ADMIN_ANDA';
