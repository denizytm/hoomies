import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  GraduationCap,
  Heart,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

const TRUST = [
  {
    icon: GraduationCap,
    title: "Edu mail ile doğrulama",
    text: "Sadece üniversite e-postasıyla giriş. Topluluk gerçek öğrencilerden oluşur.",
  },
  {
    icon: Heart,
    title: "Uyum skoru",
    text: "15 soruluk uyum testiyle yaşam tarzınıza en uygun ev arkadaşını gör.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenlik önce",
    text: "Bölge bazlı konum, çift onaylı adres paylaşımı ve şikayet sistemi.",
  },
];

const STEPS = [
  {
    icon: BadgeCheck,
    title: "Doğrula & profilini oluştur",
    text: "Edu mail ile kayıt ol, üniversiteni ve yaşam tarzını birkaç soruda anlat.",
  },
  {
    icon: Sparkles,
    title: "Uyumlu ilanları keşfet",
    text: "Kira, konum ve oda filtreleriyle ara; her ilanda uyum yüzdeni gör.",
  },
  {
    icon: MessageCircleHeart,
    title: "Eşleş & güvenle iletişime geç",
    text: "Beğendiğin ev sahibiyle platform içinde mesajlaş, ilk buluşmayı kafede yap.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-accent),transparent)]"
        />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:py-28">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" /> ODTÜ Kapalı Beta · Ankara
            </span>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Doğru ev arkadaşını bul,{" "}
              <span className="text-primary">doğru evde</span> yaşa.
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              hoomies, üniversite öğrencilerini edu mail doğrulaması ve uyum skoruyla
              buluşturan güvenli ev arkadaşı platformudur.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/register" />}>
                Hemen başla <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/listings" />}>
                İlanları keşfet
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {TRUST.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight">Nasıl çalışır?</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            Üç adımda uyumlu ev arkadaşına ulaş.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.1}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-6">
                <span className="absolute -top-3 left-6 grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <step.icon className="mt-3 size-7 text-primary" />
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Kurucu üye ol, ilk 500 arasına gir.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/90">
              Edu mail ile kaydol, &ldquo;Kurucu Üye&rdquo; rozetini kazan.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
              render={<Link href="/register" />}
            >
              Ücretsiz kayıt ol <ArrowRight />
            </Button>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
