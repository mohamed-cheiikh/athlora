"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { sendMessageAction } from "@/lib/actions/public/send-message";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const SUBJECTS = ["question_generale", "partenariat", "assistance"] as const;

export function ContactForm() {
  const t = useTranslations();
  const locale = useLocale() as "fr" | "ar";
  const [state, action, isPending] = useActionState(sendMessageAction, null);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 flex items-start gap-3">
        <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
        <p className="font-bold text-green-800">{t("forms.successContact")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="text" name="_hp" className="sr-only" tabIndex={-1} autoComplete="off" />

      {state && !state.success && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{t(`errors.${state.error}` as "errors.serverError")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t("forms.fullName")} name="nom" required />
        <Field label={t("forms.email")} name="email" type="email" required />
      </div>
      <Field label={t("forms.phone")} name="telephone" type="tel" />

      {/* Subject */}
      <div>
        <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
          {t("forms.subject")}
        </label>
        <select
          name="sujet"
          required
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {t(`forms.subjects.${s}` as "forms.subjects.question_generale")}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
          {t("forms.message")}
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder={t("forms.remarksPlaceholder")}
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-sm text-[var(--color-on-surface)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {isPending ? t("forms.sending") : t("forms.submitContact")}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: {
  label: string; name: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
      />
    </div>
  );
}
