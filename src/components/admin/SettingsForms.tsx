"use client";

import { useActionState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import {
  updateAccueilAction,
  updateContactAction,
  updateReseauxAction,
} from "@/lib/actions/admin/settings";

type SaveState = { ok: true } | { ok: false; error: string } | null;

// ── Accueil ──────────────────────────────────────────────────────────

export function SettingsAccueil({ accueil }: { accueil: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(
    async (prev: SaveState, fd: FormData) => {
      await updateAccueilAction(prev, fd);
      return { ok: true } as const;
    },
    null,
  );

  return (
    <SectionForm title="Page d'accueil — Hero" state={state} formAction={formAction} isPending={isPending}>
      <Field label="Titre FR *" name="heroTitreFr" defaultValue={accueil.heroTitreFr} />
      <Field label="العنوان بالعربية *" name="heroTitreAr" dir="rtl" defaultValue={accueil.heroTitreAr} />
      <Field label="Sous-titre FR" name="heroSousTitreFr" defaultValue={accueil.heroSousTitreFr} />
      <Field label="العنوان الفرعي بالعربية" name="heroSousTitreAr" dir="rtl" defaultValue={accueil.heroSousTitreAr} />
      <Textarea label="Présentation FR" name="presentationFr" defaultValue={accueil.presentationFr} />
      <Textarea label="التقديم بالعربية" name="presentationAr" dir="rtl" defaultValue={accueil.presentationAr} />
    </SectionForm>
  );
}

// ── Contact ──────────────────────────────────────────────────────────

export function SettingsContact({ contact }: { contact: Record<string, string | number | null> }) {
  const [state, formAction, isPending] = useActionState(
    async (prev: SaveState, fd: FormData) => {
      await updateContactAction(prev, fd);
      return { ok: true } as const;
    },
    null,
  );

  return (
    <SectionForm title="Informations de contact" state={state} formAction={formAction} isPending={isPending}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Email" name="email" type="email" defaultValue={String(contact.email ?? "")} />
        <Field label="Téléphone" name="telephone" defaultValue={String(contact.telephone ?? "")} />
        <Field label="WhatsApp (numéro sans +)" name="whatsapp" defaultValue={String(contact.whatsapp ?? "")} />
      </div>
      <Field label="Adresse FR" name="adresseFr" defaultValue={String(contact.adresseFr ?? "")} />
      <Field label="العنوان بالعربية" name="adresseAr" dir="rtl" defaultValue={String(contact.adresseAr ?? "")} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Latitude" name="latitude" type="number" defaultValue={contact.latitude != null ? String(contact.latitude) : ""} />
        <Field label="Longitude" name="longitude" type="number" defaultValue={contact.longitude != null ? String(contact.longitude) : ""} />
      </div>
    </SectionForm>
  );
}

// ── Réseaux sociaux ──────────────────────────────────────────────────

export function SettingsReseaux({ reseaux }: { reseaux: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(
    async (prev: SaveState, fd: FormData) => {
      await updateReseauxAction(prev, fd);
      return { ok: true } as const;
    },
    null,
  );

  return (
    <SectionForm title="Réseaux sociaux" state={state} formAction={formAction} isPending={isPending}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Facebook (URL)" name="facebook" defaultValue={reseaux.facebook} />
        <Field label="Instagram (URL)" name="instagram" defaultValue={reseaux.instagram} />
        <Field label="TikTok (URL)" name="tiktok" defaultValue={reseaux.tiktok} />
        <Field label="YouTube (URL)" name="youtube" defaultValue={reseaux.youtube} />
      </div>
    </SectionForm>
  );
}

// ── Shared sub-components ────────────────────────────────────────────

function SectionForm({
  title,
  state,
  formAction,
  isPending,
  children,
}: {
  title: string;
  state: SaveState;
  formAction: (fd: FormData) => void;
  isPending: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] p-6 flex flex-col gap-4">
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] border-b border-[var(--color-outline-variant)] pb-3">
        {title}
      </h2>

      <form action={formAction} className="flex flex-col gap-4">
        {children}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
          {state?.ok && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
              <CheckCircle size={15} /> Sauvegardé
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label, name, type = "text", defaultValue = "", dir,
}: {
  label: string; name: string; type?: string; defaultValue?: string; dir?: string;
}) {
  return (
    <div>
      <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        dir={dir}
        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
      />
    </div>
  );
}

function Textarea({
  label, name, defaultValue = "", dir,
}: {
  label: string; name: string; defaultValue?: string; dir?: string;
}) {
  return (
    <div>
      <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
        {label}
      </label>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue}
        dir={dir}
        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
      />
    </div>
  );
}
