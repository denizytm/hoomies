-- İlan güncellemeleri: aidat, kişi kapasitesi, banyo sayısı, kapatma sebebi,
-- kategorili fotoğraflar; ev sahibinin isteyenin uyum cevaplarını görmesi.

alter table public.listings add column if not exists dues integer;             -- aidat (TL/ay)
alter table public.listings add column if not exists capacity smallint not null default 1;  -- toplam kişi
alter table public.listings add column if not exists occupied smallint not null default 0;   -- dolu kişi
alter table public.listings add column if not exists bathroom_count smallint;  -- banyo/tuvalet sayısı
alter table public.listings add column if not exists close_reason text;        -- kapatma sebebi

-- fotoğraf kategorisi: room | bathroom | kitchen | common
alter table public.listing_photos add column if not exists category text;

-- Konuşmanın diğer tarafının uyum cevaplarını döndürür (yalnızca taraflar görebilir).
-- Ham cevaplar RLS ile gizli; bu fonksiyon yalnızca konuşmadaki karşı taraf içindir.
create or replace function public.conversation_other_answers(conv_id uuid)
returns table (question_id smallint, value smallint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_other uuid;
begin
  select case
           when c.host_id = auth.uid() then c.seeker_id
           when c.seeker_id = auth.uid() then c.host_id
         end
    into v_other
  from public.conversations c
  where c.id = conv_id;

  if v_other is null then
    return; -- çağıran taraf değil
  end if;

  return query
    select a.question_id, a.value
    from public.compatibility_answers a
    where a.user_id = v_other;
end;
$$;
grant execute on function public.conversation_other_answers(uuid) to authenticated;
