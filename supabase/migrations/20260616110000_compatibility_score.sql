-- Uyum skoru: giriş yapan kullanıcı ile verilen kullanıcılar arasında, ortak
-- yanıtlanan sorulardaki cevap yakınlığının ortalaması (0-100).
-- SECURITY DEFINER: ham cevapları sızdırmadan yalnızca yüzdeyi döndürür.
-- Cevap aralığı 1..3 olduğu için fark/2 → [0,1]; 1 - fark/2 → benzerlik.

create or replace function public.compatibility_scores(other_users uuid[])
returns table (user_id uuid, score int)
language sql
security definer
set search_path = ''
as $$
  select o.user_id,
         round(avg(1.0 - abs(o.value - m.value) / 2.0) * 100)::int
  from public.compatibility_answers o
  join public.compatibility_answers m
    on m.question_id = o.question_id
   and m.user_id = auth.uid()
  where o.user_id = any (other_users)
    and o.user_id <> auth.uid()
  group by o.user_id;
$$;

grant execute on function public.compatibility_scores(uuid[]) to authenticated;
