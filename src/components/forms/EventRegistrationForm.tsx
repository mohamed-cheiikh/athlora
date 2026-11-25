"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { registerEventAction } from "@/lib/actions/public/register-event";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  eventId: number;
  eventTitle: string;
}

const initialState = null;

export function EventRegistrationForm({ eventId, eventTitle }: Props) {
  const t = useTranslations();
  const locale = useLocale() as "fr" | "ar";
  const [state, action, isPending] = useActionState(registerEventAction, initialState);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 flex items-start gap-3">
        <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-green-800">{t("forms.success")}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" id="inscription">
      {/* Hidden fields */}
      <input type="hidden" name="cibleId" value={eventId} />
      <input type="hidden" name="cibleTitre" value={eventTitle} />
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot */}
      <input type="text" name="_hp" className="sr-only" tabIndex={-1} autoComplete="off" />

      {state && !state.success && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{t(`errors.${state.error}` as "errors.serverError")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t("forms.fullName")} name="nomClient" required />
        <Field label={t("forms.phone")} name="telephone" type="tel" required />
      </div>
      <Field label={t("forms.emailOptional")} name="email" type="email" />
      <div>
        <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
          {t("forms.numberOfPeople")}
        </label>
        <input
          type="number"
          name="nbPersonnes"
          min={1}
          max={20}
          defaultValue={1}
          className="w-24 px-3 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        />
      </div>
      <div>
        <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
          {t("forms.remarks")}
        </label>
        <textarea
          name="remarques"
          rows={3}
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
        {isPending ? t("forms.sending") : t("forms.submit")}
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
