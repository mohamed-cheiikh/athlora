"use client";

import { useActionState } from "react";
import type { Evenement } from "@/db/schema";
import { Loader2 } from "lucide-react";

type Action = (prevState: unknown, formData: FormData) => Promise<unknown>;

const SPORT_TYPES = ["course", "randonnee", "cyclisme", "natation", "trail", "autre"] as const;
const NIVEAUX = ["debutant", "intermediaire", "confirme", "expert"] as const;
const ZONES = ["Alger", "Oran", "Mostaganem"] as const;

interface Props {
  event?: Evenement;
  action: Action;
  submitLabel: string;
}

export function EvenementForm({ event, action, submitLabel }: Props) {
  const [, formAction, isPending] = useActionState(action, null);

  const dateDebut = event?.dateDebut
    ? new Date(event.dateDebut).toISOString().slice(0, 16)
    : "";
  const dateFin = event?.dateFin
    ? new Date(event.dateFin).toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-6">
      {/* Hidden existing image */}
      {event?.image && <input type="hidden" name="imageExistante" value={event.image} />}

      {/* Identification */}
      <Section title="Identification">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug URL (auto si vide)" name="slug" defaultValue={event?.slug} />
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
              Type de sport *
            </label>
            <select name="sportType" defaultValue={event?.sportType ?? "autre"}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]">
              {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
              Niveau
            </label>
            <select name="niveau" defaultValue={event?.niveau ?? ""}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]">
              <option value="">—</option>
              {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-2">
          <Checkbox label="À la une" name="aLaUne" defaultChecked={event?.aLaUne ?? false} />
          <Checkbox label="Publié" name="publie" defaultChecked={event?.publie ?? false} />
        </div>
      </Section>

      {/* FR Content */}
      <Section title="Contenu (Français)">
        <Field label="Titre FR *" name="titreFr" required defaultValue={event?.titreFr} />
        <Textarea label="Description FR *" name="descriptionFr" rows={4} required defaultValue={event?.descriptionFr} />
        <Textarea label="Programme FR" name="programmeFr" rows={3} defaultValue={event?.programmeFr ?? ""} />
        <Textarea label="Conditions de participation FR" name="conditionsFr" rows={3} defaultValue={event?.conditionsFr ?? ""} />
      </Section>

      {/* AR Content */}
      <Section title="المحتوى (عربي)">
        <Field label="العنوان بالعربية" name="titreAr" dir="rtl" defaultValue={event?.titreAr ?? ""} />
        <Textarea label="الوصف بالعربية" name="descriptionAr" rows={4} dir="rtl" defaultValue={event?.descriptionAr ?? ""} />
        <Textarea label="البرنامج بالعربية" name="programmeAr" rows={3} dir="rtl" defaultValue={event?.programmeAr ?? ""} />
        <Textarea label="شروط المشاركة بالعربية" name="conditionsAr" rows={3} dir="rtl" defaultValue={event?.conditionsAr ?? ""} />
      </Section>

      {/* Dates & Places */}
      <Section title="Dates & Places">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Date de début *" name="dateDebut" type="datetime-local" required defaultValue={dateDebut} />
          <Field label="Date de fin" name="dateFin" type="datetime-local" defaultValue={dateFin} />
          <Field label="Prix (DA)" name="prix" type="number" defaultValue={event?.prix?.toString() ?? ""} />
          <Field label="Places max" name="placesMax" type="number" defaultValue={event?.placesMax?.toString() ?? ""} />
        </div>
      </Section>

      {/* Localisation */}
      <Section title="Localisation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
              Ville *
            </label>
            <select name="zone" defaultValue={event?.zone ?? ""}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]">
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <Field label="Lieu FR *" name="lieuFr" required defaultValue={event?.lieuFr} />
          <Field label="الموقع بالعربية" name="lieuAr" dir="rtl" defaultValue={event?.lieuAr ?? ""} />
          <Field label="Lien Google Maps" name="mapsUrl" defaultValue={event?.mapsUrl ?? ""} />
          <Field label="Latitude" name="latitude" type="number" defaultValue={event?.latitude?.toString() ?? ""} />
          <Field label="Longitude" name="longitude" type="number" defaultValue={event?.longitude?.toString() ?? ""} />
        </div>
      </Section>

      {/* Image */}
      <Section title="Image principale">
        {event?.image && (
          <img src={event.image} alt="Image actuelle" className="h-32 object-cover rounded-xl mb-3" />
        )}
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm text-[var(--color-on-surface-variant)] file:me-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[var(--color-secondary)] file:text-white file:font-bold file:text-xs hover:file:opacity-90"
        />
      </Section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Enregistrement…" : submitLabel}
        </button>
        <a href="/admin/evenements" className="px-6 py-3 rounded-xl border border-[var(--color-outline-variant)] text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]">
          Annuler
        </a>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] p-5 flex flex-col gap-4">
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] border-b border-[var(--color-outline-variant)] pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, name, type = "text", required = false, defaultValue = "", dir }: {
  label: string; name: string; type?: string; required?: boolean; defaultValue?: string; dir?: string;
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
        defaultValue={defaultValue}
        dir={dir}
        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
      />
    </div>
  );
}

function Textarea({ label, name, rows = 3, required = false, defaultValue = "", dir }: {
  label: string; name: string; rows?: number; required?: boolean; defaultValue?: string; dir?: string;
}) {
  return (
    <div>
      <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        dir={dir}
        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
      />
    </div>
  );
}

function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 rounded accent-[var(--color-secondary)]"
      />
      <span className="text-sm font-semibold text-[var(--color-on-surface)]">{label}</span>
    </label>
  );
}
