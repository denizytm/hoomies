-- Demo: 12 sentetik ev sahibi + farklı uyum cevapları + örnek ilanları onlara dağıt.
-- Böylece her ilanın skoru farklı çıkar. BİR KEZ çalıştır. (Sadece geliştirme/demo için.)

-- 1) Sentetik kullanıcılar (trigger profillerini otomatik oluşturur)
insert into auth.users
  (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at, email_confirmed_at)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'roomie' || i || '@metu.edu.tr',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object(
    'full_name',
    (array['Ahmet Yılmaz','Zeynep Kaya','Mert Demir','Elif Şahin','Can Öztürk',
           'Derya Aydın','Burak Çelik','Selin Arslan','Emre Koç','Ece Yıldız',
           'Kaan Aksoy','Naz Polat'])[i],
    'role', 'host'
  ),
  now(), now(), now()
from generate_series(1, 12) as i
on conflict do nothing;

-- 2) Her sentetik kullanıcıya md5 tabanlı, kişiye özel (farklı) uyum cevapları
with owners as (
  select p.id, row_number() over (order by u.email) as idx
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email like 'roomie%@metu.edu.tr'
)
insert into public.compatibility_answers (user_id, question_id, value)
select o.id, q.id,
       (abs(('x' || substr(md5(o.idx::text || ':' || q.id::text), 1, 8))::bit(32)::int) % 3) + 1
from owners o
cross join public.compatibility_questions q
on conflict (user_id, question_id) do nothing;

-- 3) Örnek ilanları (şu an senin hesabında) bu 12 sahibe birebir dağıt
with owners as (
  select p.id, row_number() over (order by u.email) as idx
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email like 'roomie%@metu.edu.tr'
),
mine as (
  select l.id, row_number() over (order by l.created_at) as rn
  from public.listings l
  where l.owner_id = (select id from auth.users where email = '220911765@stu.istinye.edu.tr')
)
update public.listings l
set owner_id = o.id
from mine m
join owners o on o.idx = ((m.rn - 1) % 12) + 1
where l.id = m.id;
