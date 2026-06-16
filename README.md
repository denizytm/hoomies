# hoomies

Üniversite öğrencileri için güvenli ev arkadaşı eşleşme platformu. Edu mail doğrulaması,
uyum skoru ve ilan sistemiyle. Bu repo **web** uygulamasıdır (wg-gesucht tarzı ilan odaklı);
mobil (swipe odaklı) ileride aynı Supabase backend'ini kullanacak.

## Teknoloji

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui** (Base UI) — turuncu/beyaz tema
- **Framer Motion** (animasyon), **nuqs** (URL'de filtre state'i)
- **Supabase** — Postgres + Auth + Storage + RLS (cloud, Frankfurt/eu-central)
- **Zod** + **React Hook Form** (validasyon)

## Kurulum

### 1. Bağımlılıklar
```bash
npm install
```

### 2. Supabase (cloud) projesi
1. [supabase.com](https://supabase.com) → yeni proje (**Region: Frankfurt / eu-central-1**, KVKK için).
2. **SQL Editor** → `supabase/setup.sql` içeriğini yapıştırıp çalıştır (şema + seed).
3. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`
   - (Authentication → Email: "Confirm email" açık olmalı.)
4. **Project Settings → API**'den değerleri al.

### 3. Ortam değişkenleri
`.env.local` (örnek için `.env.local.example`):
```
NEXT_PUBLIC_SUPABASE_URL=https://<proje-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon / publishable key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
> `service_role` anahtarı şu an gerekmiyor (her şey kullanıcı oturumu + RLS ile çalışır).
> Moderasyon gibi admin işlevleri eklenince eklenecek.

### 4. Çalıştır
```bash
npm run dev      # http://localhost:3000
```

## Komutlar
| Komut | Açıklama |
|------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Prod build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Yapı
```
src/
  app/                 # rotalar (App Router)
    (auth)/            # login, register
    listings/          # liste, [id], new, mine
    onboarding/, profile/, verify/, auth/callback/
  components/          # ui (shadcn), layout, motion
  features/            # auth, profile, onboarding, listings (UI + actions + queries)
  lib/                 # supabase clients, validation (Zod), types, data, format
supabase/
  migrations/          # şema + RLS + trigger (kaynak doğruluk)
  seed.sql             # üniversiteler + 15 uyum sorusu
  setup.sql            # cloud için migration+seed birleşik (tek seferlik bootstrap)
```

`src/lib` (validation, types, data) framework-bağımsızdır ve ileride mobil uygulamada
yeniden kullanılabilir.

## Kapsam

Bu sürüm MVP'nin **temel iskeletidir**: edu-mail auth + doğrulama, profil + 15 soruluk uyum
onboarding, ilan oluştur/listele/filtrele/detay. Sıradaki katmanlar: uyum skoru hesabı &
gösterimi, platform içi mesajlaşma, push bildirimleri, interaktif harita, moderasyon/şikayet,
referans/puan/rozet.
