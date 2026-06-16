"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { saveOnboardingAction } from "@/features/profile/actions";
import type {
  CompatibilityCategory,
  CompatibilityQuestion,
  QuestionOption,
  UserRole,
} from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

type Props = {
  categories: CompatibilityCategory[];
  questions: CompatibilityQuestion[];
  role: UserRole;
};

export function OnboardingFlow({ categories, questions, role }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();

  const total = categories.length;
  const category = categories[step];
  const stepQuestions = questions.filter((q) => q.category_id === category?.id);
  const allAnswered = stepQuestions.every((q) => answers[String(q.id)] != null);
  const isLast = step === total - 1;

  function next() {
    if (!allAnswered) {
      toast.error("Bu adımdaki tüm soruları yanıtla.");
      return;
    }
    if (isLast) {
      startTransition(async () => {
        const res = await saveOnboardingAction({ role, answers });
        if (res?.error) toast.error(res.error);
      });
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-primary">{category?.name}</span>
          <span className="text-muted-foreground">
            {step + 1} / {total}
          </span>
        </div>
        <Progress value={((step + 1) / total) * 100} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Yaşam tarzını tanıyalım
            </h1>
            <p className="mt-1 text-muted-foreground">
              Bu yanıtlar uyum skorunu belirler — istediğin zaman güncelleyebilirsin.
            </p>
          </div>

          {stepQuestions.map((q) => {
            const options = q.options as unknown as QuestionOption[];
            const selected = answers[String(q.id)];
            return (
              <div key={q.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-medium">{q.question}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {options.map((opt) => {
                    const active = selected === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [String(q.id)]: opt.value }))
                        }
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-sm transition-all",
                          active
                            ? "border-primary bg-primary/5 font-medium text-primary ring-2 ring-primary/30"
                            : "border-border text-foreground hover:border-primary/40 hover:bg-muted",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
        >
          <ArrowLeft /> Geri
        </Button>
        <Button onClick={next} disabled={pending}>
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : isLast ? (
            <Check />
          ) : null}
          {isLast ? "Tamamla" : "İleri"}
          {!isLast && !pending && <ArrowRight />}
        </Button>
      </div>
    </div>
  );
}
