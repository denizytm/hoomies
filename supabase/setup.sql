-- Hoomies cloud bootstrap: schema + seed. Paste into Supabase SQL Editor and run.

-- Hoomies — initial schema
-- Foundation: universities, profiles, compatibility questions/answers, listings, photos.
-- Security model relies on Postgres RLS; edu-mail enforcement via auth.users trigger.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('host', 'seeker');
create type public.listing_status as enum ('active', 'passive', 'matched', 'closed');

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Universities (edu-mail domain database)
-- ---------------------------------------------------------------------------
create table public.universities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  city       text not null,
  domains    text[] not null,           -- e.g. {'metu.edu.tr','odtu.edu.tr'}
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles (1-1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  full_name            text,
  university_id        uuid references public.universities(id),
  department           text,
  graduation_date      date,
  bio                  text,
  avatar_url           text,
  role                 public.user_role,
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Compatibility questions (5 categories, 15 questions in MVP)
-- ---------------------------------------------------------------------------
create table public.compatibility_categories (
  id       smallint primary key,
  slug     text unique not null,
  name     text not null,
  position smallint not null
);

create table public.compatibility_questions (
  id          smallint primary key,
  category_id smallint not null references public.compatibility_categories(id),
  question    text not null,
  options     jsonb not null,           -- [{"value":1,"label":"..."}, ...]
  position    smallint not null
);

create table public.compatibility_answers (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  question_id smallint not null references public.compatibility_questions(id),
  value       smallint not null,
  answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------
create table public.listings (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  description     text,
  monthly_rent    integer not null,                 -- TL / month
  deposit         integer,
  bills_included  boolean not null default false,
  room_count      smallint not null default 1,      -- available room(s) in the flat
  total_rooms     smallint,                          -- total rooms in the flat
  flatmates_count smallint,                          -- current flatmates
  available_from  date,
  city            text not null,
  district        text not null,
  neighborhood    text,
  pets_allowed    boolean not null default false,
  furnished       boolean not null default false,
  gender_preference text not null default 'any',     -- 'any' | 'female' | 'male'
  features        jsonb not null default '[]'::jsonb,
  status          public.listing_status not null default 'active',
  expires_at      timestamptz not null default (now() + interval '30 days'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index listings_status_idx   on public.listings (status);
create index listings_location_idx on public.listings (city, district);
create index listings_rent_idx     on public.listings (monthly_rent);
create index listings_owner_idx    on public.listings (owner_id);

create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

create table public.listing_photos (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  position    smallint not null default 0,
  created_at  timestamptz not null default now()
);

create index listing_photos_listing_idx on public.listing_photos (listing_id);

-- ---------------------------------------------------------------------------
-- New user handler: enforce edu-mail + create profile
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain        text;
  v_university_id uuid;
begin
  v_domain := lower(split_part(new.email, '@', 2));

  select id into v_university_id
  from public.universities
  where v_domain = any (domains)
  limit 1;

  if v_university_id is null then
    raise exception 'EDU_EMAIL_REQUIRED: % tanimli bir universite uzantisi degil', v_domain
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, university_id, full_name, role)
  values (
    new.id,
    v_university_id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('host', 'seeker')
        then (new.raw_user_meta_data ->> 'role')::public.user_role
      else null
    end
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.universities             enable row level security;
alter table public.profiles                 enable row level security;
alter table public.compatibility_categories enable row level security;
alter table public.compatibility_questions  enable row level security;
alter table public.compatibility_answers    enable row level security;
alter table public.listings                 enable row level security;
alter table public.listing_photos           enable row level security;

-- universities: public read (needed on the register screen)
create policy "universities readable by everyone"
  on public.universities for select using (true);

-- compatibility reference data: readable by authenticated users
create policy "categories readable by authenticated"
  on public.compatibility_categories for select to authenticated using (true);
create policy "questions readable by authenticated"
  on public.compatibility_questions for select to authenticated using (true);

-- profiles
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- compatibility answers: user owns their answers
create policy "users read own answers"
  on public.compatibility_answers for select to authenticated using (auth.uid() = user_id);
create policy "users insert own answers"
  on public.compatibility_answers for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own answers"
  on public.compatibility_answers for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own answers"
  on public.compatibility_answers for delete to authenticated using (auth.uid() = user_id);

-- listings: active ones readable by all authenticated; owner sees own regardless
create policy "active listings readable by authenticated"
  on public.listings for select to authenticated
  using (status = 'active' or owner_id = auth.uid());
create policy "owners insert listings"
  on public.listings for insert to authenticated with check (owner_id = auth.uid());
create policy "owners update own listings"
  on public.listings for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners delete own listings"
  on public.listings for delete to authenticated using (owner_id = auth.uid());

-- listing photos: visible when the parent listing is visible; managed by owner
create policy "listing photos readable by authenticated"
  on public.listing_photos for select to authenticated
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and (l.status = 'active' or l.owner_id = auth.uid())
  ));
create policy "owners insert listing photos"
  on public.listing_photos for insert to authenticated
  with check (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()
  ));
create policy "owners delete listing photos"
  on public.listing_photos for delete to authenticated
  using (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- Storage buckets + policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
       ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Files are stored under "<auth.uid()>/..." so the first path segment is the owner.
create policy "avatars: read public"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: owner insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "listing-photos: read public"
  on storage.objects for select using (bucket_id = 'listing-photos');
create policy "listing-photos: owner insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "listing-photos: owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ===== SEED =====
-- Hoomies seed data
-- NOTE: edu-mail domains are a best-effort starter set. Verify/expand before production.
-- ODTÜ is the closed-beta priority.

-- ---------------------------------------------------------------------------
-- Universities
-- ---------------------------------------------------------------------------
insert into public.universities (name, city, domains) values
  ('Orta Doğu Teknik Üniversitesi (ODTÜ)', 'Ankara',  '{metu.edu.tr,odtu.edu.tr}'),
  ('Bilkent Üniversitesi',                 'Ankara',  '{bilkent.edu.tr,ug.bilkent.edu.tr}'),
  ('Hacettepe Üniversitesi',               'Ankara',  '{hacettepe.edu.tr}'),
  ('Ankara Üniversitesi',                  'Ankara',  '{ankara.edu.tr,ogr.ankara.edu.tr}'),
  ('Gazi Üniversitesi',                    'Ankara',  '{gazi.edu.tr}'),
  ('TOBB Ekonomi ve Teknoloji Üniversitesi','Ankara', '{etu.edu.tr}'),
  ('Ankara Yıldırım Beyazıt Üniversitesi', 'Ankara',  '{aybu.edu.tr,ybu.edu.tr}'),
  ('Atılım Üniversitesi',                  'Ankara',  '{atilim.edu.tr}'),
  ('Başkent Üniversitesi',                 'Ankara',  '{baskent.edu.tr}'),
  ('Çankaya Üniversitesi',                 'Ankara',  '{cankaya.edu.tr}'),
  ('Boğaziçi Üniversitesi',                'İstanbul','{boun.edu.tr,std.bogazici.edu.tr}'),
  ('İstanbul Teknik Üniversitesi (İTÜ)',   'İstanbul','{itu.edu.tr}'),
  ('İstanbul Üniversitesi',                'İstanbul','{istanbul.edu.tr,ogr.iu.edu.tr}'),
  ('Koç Üniversitesi',                     'İstanbul','{ku.edu.tr,koc.edu.tr}'),
  ('Sabancı Üniversitesi',                 'İstanbul','{sabanciuniv.edu,sabanciuniv.edu.tr}'),
  ('Yıldız Teknik Üniversitesi',           'İstanbul','{yildiz.edu.tr,std.yildiz.edu.tr}'),
  ('Marmara Üniversitesi',                 'İstanbul','{marmara.edu.tr,marun.edu.tr}'),
  ('Galatasaray Üniversitesi',             'İstanbul','{gsu.edu.tr}'),
  ('Ege Üniversitesi',                     'İzmir',   '{ege.edu.tr,mail.ege.edu.tr}'),
  ('Dokuz Eylül Üniversitesi',             'İzmir',   '{deu.edu.tr,ogr.deu.edu.tr}'),
  ('İzmir Yüksek Teknoloji Enstitüsü',     'İzmir',   '{iyte.edu.tr,std.iyte.edu.tr}'),
  ('Çukurova Üniversitesi',                'Adana',   '{cu.edu.tr}'),
  ('Akdeniz Üniversitesi',                 'Antalya', '{akdeniz.edu.tr}'),
  ('Karadeniz Teknik Üniversitesi',        'Trabzon', '{ktu.edu.tr}'),
  ('Anadolu Üniversitesi',                 'Eskişehir','{anadolu.edu.tr}'),
  ('Eskişehir Osmangazi Üniversitesi',     'Eskişehir','{ogu.edu.tr,ogr.ogu.edu.tr}'),
  ('Bursa Uludağ Üniversitesi',            'Bursa',   '{uludag.edu.tr}'),
  ('Selçuk Üniversitesi',                  'Konya',   '{selcuk.edu.tr}'),
  ('Erciyes Üniversitesi',                 'Kayseri', '{erciyes.edu.tr}'),
  ('Gaziantep Üniversitesi',               'Gaziantep','{gantep.edu.tr}'),
  ('Atatürk Üniversitesi',                 'Erzurum', '{atauni.edu.tr}'),
  ('Ondokuz Mayıs Üniversitesi',           'Samsun',  '{omu.edu.tr}'),
  ('Pamukkale Üniversitesi',               'Denizli', '{pau.edu.tr}')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Compatibility categories (5)
-- ---------------------------------------------------------------------------
insert into public.compatibility_categories (id, slug, name, position) values
  (1, 'lifestyle',   'Yaşam Düzeni',        1),
  (2, 'cleanliness', 'Temizlik & Düzen',    2),
  (3, 'social',      'Sosyallik',           3),
  (4, 'habits',      'Alışkanlıklar',       4),
  (5, 'budget',      'Bütçe & Paylaşım',    5)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Compatibility questions (15 — 3 per category)
-- ---------------------------------------------------------------------------
insert into public.compatibility_questions (id, category_id, question, options, position) values
  (1, 1, 'Günün hangi vaktinde daha aktifsin?',
      '[{"value":1,"label":"Sabahçıyım"},{"value":2,"label":"Dengeli"},{"value":3,"label":"Gece kuşuyum"}]', 1),
  (2, 1, 'Hafta içi uyku düzenin nasıl?',
      '[{"value":1,"label":"Erken yatarım (23 öncesi)"},{"value":2,"label":"Değişken"},{"value":3,"label":"Geç yatarım (01 sonrası)"}]', 2),
  (3, 1, 'Evde sessizlik senin için ne kadar önemli?',
      '[{"value":1,"label":"Çok önemli"},{"value":2,"label":"Orta"},{"value":3,"label":"Gürültü beni rahatsız etmez"}]', 3),

  (4, 2, 'Ortak alanların temizliğinde hassasiyetin?',
      '[{"value":1,"label":"Çok titizim"},{"value":2,"label":"Dengeli"},{"value":3,"label":"Rahatım"}]', 1),
  (5, 2, 'Bulaşıkları ne sıklıkla yıkarsın?',
      '[{"value":1,"label":"Hemen"},{"value":2,"label":"Günde bir"},{"value":3,"label":"Biriktiririm"}]', 2),
  (6, 2, 'Ev temizliğini nasıl yönetmek istersin?',
      '[{"value":1,"label":"Net görev paylaşımı"},{"value":2,"label":"Esnek sıra"},{"value":3,"label":"İhtiyaç oldukça"}]', 3),

  (7, 3, 'Eve misafir çağırma sıklığın?',
      '[{"value":1,"label":"Nadiren"},{"value":2,"label":"Ara sıra"},{"value":3,"label":"Sık sık"}]', 1),
  (8, 3, 'Ev arkadaşınla ilişkin nasıl olsun?',
      '[{"value":1,"label":"Arkadaş gibi"},{"value":2,"label":"İyi komşu"},{"value":3,"label":"Mesafeli"}]', 2),
  (9, 3, 'Evde kalabalık/parti konusunda?',
      '[{"value":1,"label":"İstemem"},{"value":2,"label":"Bazen olur"},{"value":3,"label":"Severim"}]', 3),

  (10, 4, 'Sigara kullanımı?',
      '[{"value":1,"label":"İçilmesini istemem"},{"value":2,"label":"İçmem ama sorun değil"},{"value":3,"label":"İçerim"}]', 1),
  (11, 4, 'Evcil hayvan?',
      '[{"value":1,"label":"İstemem"},{"value":2,"label":"Olabilir"},{"value":3,"label":"Bayılırım / hayvanım var"}]', 2),
  (12, 4, 'Alkol kullanımı?',
      '[{"value":1,"label":"Kullanmam"},{"value":2,"label":"Sosyal içerim"},{"value":3,"label":"Düzenli"}]', 3),

  (13, 5, 'Ortak market/yemek paylaşımı?',
      '[{"value":1,"label":"Ayrı tutarım"},{"value":2,"label":"Bazı şeyler ortak"},{"value":3,"label":"Tamamen ortak"}]', 1),
  (14, 5, 'Faturalar konusunda yaklaşımın?',
      '[{"value":1,"label":"Anında bölüşelim"},{"value":2,"label":"Ay sonu toplu"},{"value":3,"label":"Esnek"}]', 2),
  (15, 5, 'Genel harcama tarzın?',
      '[{"value":1,"label":"Tutumluyum"},{"value":2,"label":"Dengeli"},{"value":3,"label":"Rahat harcarım"}]', 3)
on conflict (id) do nothing;
