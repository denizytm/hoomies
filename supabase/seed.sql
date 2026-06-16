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
