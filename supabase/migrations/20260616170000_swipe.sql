-- Mobil swipe: "pas" geçilen ilanlar (sola kaydırma) tekrar gösterilmesin.
-- Sağa kaydırma = ilgilenme = mevcut conversations modeli (pending) ile çalışır.

create table if not exists public.listing_passes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.listing_passes enable row level security;
drop policy if exists "passes: own" on public.listing_passes;
create policy "passes: own"
  on public.listing_passes for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
