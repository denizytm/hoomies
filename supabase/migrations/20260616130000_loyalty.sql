-- Sosyal & Sadakat: puan, üye no (kurucu rozeti için), referans kodları, eşleşme puanı.

alter table public.profiles add column if not exists points integer not null default 0;
alter table public.profiles add column if not exists member_no bigint;

create sequence if not exists public.profiles_member_no_seq;

create table if not exists public.referral_codes (
  code       text primary key,
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  used_by    uuid references public.profiles(id) on delete set null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists referral_codes_owner_idx on public.referral_codes (owner_id);

alter table public.referral_codes enable row level security;
drop policy if exists "referral: owner read" on public.referral_codes;
create policy "referral: owner read" on public.referral_codes
  for select to authenticated using (owner_id = auth.uid());

-- handle_new_user: profil + üye no + 10 referans kodu + referansla gelene +1 puan (sahibine)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain        text;
  v_university_id uuid;
  v_ref           text;
  v_owner         uuid;
  i               int;
begin
  v_domain := lower(split_part(new.email, '@', 2));
  select id into v_university_id
  from public.universities where v_domain = any (domains) limit 1;

  if v_university_id is null then
    raise exception 'EDU_EMAIL_REQUIRED: % tanimli bir universite uzantisi degil', v_domain
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, university_id, full_name, role, member_no)
  values (
    new.id,
    v_university_id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case when new.raw_user_meta_data ->> 'role' in ('host', 'seeker')
         then (new.raw_user_meta_data ->> 'role')::public.user_role else null end,
    nextval('public.profiles_member_no_seq')
  );

  -- 10 referans kodu üret
  for i in 1..10 loop
    insert into public.referral_codes (code, owner_id)
    values (upper(substr(md5(random()::text || clock_timestamp()::text || i::text), 1, 8)), new.id)
    on conflict (code) do nothing;
  end loop;

  -- Kayıtta referans kodu kullanıldıysa: kodun sahibine +1 puan
  v_ref := upper(nullif(new.raw_user_meta_data ->> 'referral_code', ''));
  if v_ref is not null then
    update public.referral_codes
      set used_by = new.id, used_at = now()
      where code = v_ref and used_by is null
      returning owner_id into v_owner;
    if v_owner is not null then
      update public.profiles set points = points + 1 where id = v_owner;
    end if;
  end if;

  return new;
end;
$$;

-- Eşleşme (konuşma 'accepted') olunca her iki tarafa +2 puan
create or replace function public.handle_match_points()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    update public.profiles set points = points + 2
    where id in (new.seeker_id, new.host_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_conversation_accepted on public.conversations;
create trigger on_conversation_accepted
  after update on public.conversations
  for each row execute function public.handle_match_points();

-- Mevcut profillere üye no ata (created_at sırasına göre)
with ordered as (
  select id, row_number() over (order by created_at) as rn
  from public.profiles where member_no is null
)
update public.profiles p set member_no = o.rn from ordered o where p.id = o.id;

select setval('public.profiles_member_no_seq',
              coalesce((select max(member_no) from public.profiles), 0) + 1, false);

-- Mevcut profillere referans kodu üret (yoksa)
do $$
declare r record; i int;
begin
  for r in select id from public.profiles loop
    if not exists (select 1 from public.referral_codes where owner_id = r.id) then
      for i in 1..10 loop
        insert into public.referral_codes (code, owner_id)
        values (upper(substr(md5(random()::text || clock_timestamp()::text || r.id::text || i::text), 1, 8)), r.id)
        on conflict (code) do nothing;
      end loop;
    end if;
  end loop;
end $$;
