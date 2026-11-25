"use client";

import { useActionState } from "react";
import type { Activite } from "@/db/schema";
import { Loader2 } from "lucide-react";

type Action = (prevState: unknown, formData: FormData) => Promise<unknown>;

const CATEGORIES = ["sport", "tourisme"] as const;
const ZONES = ["Alger", "Oran", "Mostaganem"] as const;

const SOUS_CATEGORIES: Record<string, string[]> = {
  sport:    ["randonnee", "cyclisme", "escalade", "natation", "football", "course", "trail", "autre"],
  tourisme: ["visite_culturelle", "gastronomie", "detente", "decouverte", "autre"],
};

interface Props {
  activite?: Activite;
  action: Action;
  submitLabel: string;
}

export function ActiviteForm({ activite, action, submitLabel }: Props) {
  const [, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-6">
      {activite?.image && <input type="hidden" name="imageExistante" value={activite.image} />}

      {/* Identification */}
      <Section title="Identification">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug URL (auto si vide)" name="slug" defaultValue={activite?.slug} />
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
              Catégorie *
            </label>
            <select
              name="categoriePrincipale"
              defaultValue={activite?.categoriePrincipale ?? "sport"}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === "sport" ? "Sport" : "Tourisme"}</option>
              ))}
            </select>
          </div>
          <Field label="Sous-catégorie *" name="sousCategorie" required defaultValue={activite?.sousCategorie} />
          <Field label="Prix (DA)" name="prix" type="number" defaultValue={activite?.prix?.toString() ?? ""} />
        </div>
        <div className="flex flex-wrap gap-4 mt-2">
          <Checkbox label="Publié" name="publie" defaultChecked={activite?.publie ?? false} />
        </div>
      </Section>

      {/* FR Content */}
      <Section title="Contenu (Français)">
        <Field label="Titre FR *" name="titreFr" required defaultValue={activite?.titreFr} />
        <Textarea label="Description FR *" name="descriptionFr" rows={4} required defaultValue={activite?.descriptionFr} />
        <Field label="Durée FR" name="dureeFr" defaultValue={activite?.dureeFr ?? ""} />
        <Textarea label="Équipement nécessaire FR" name="equipementFr" rows={2} defaultValue={activite?.equipementFr ?? ""} />
      </Section>

      {/* AR Content */}
      <Section title="المحتوى (عربي)">
        <Field label="العنوان بالعربية" name="titreAr" dir="rtl" defaultValue={activite?.titreAr ?? ""} />
        <Textarea label="الوصف بالعربية" name="descriptionAr" rows={4} dir="rtl" defaultValue={activite?.descriptionAr ?? ""} />
        <Field label="المدة بالعربية" name="dureeAr" dir="rtl" defaultValue={activite?.dureeAr ?? ""} />
        <Textarea label="المعدات المطلوبة بالعربية" name="equipementAr" rows={2} dir="rtl" defaultValue={activite?.equipementAr ?? ""} />
      </Section>

      {/* Contact organisateur */}
      <Section title="Contact organisateur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nom" name="contactOrganisateurNom" defaultValue={activite?.contactOrganisateurNom ?? ""} />
          <Field label="Téléphone" name="contactOrganisateurTel" defaultValue={activite?.contactOrganisateurTel ?? ""} />
          <Field label="Email" name="contactOrganisateurEmail" type="email" defaultValue={activite?.contactOrganisateurEmail ?? ""} />
        </div>
      </Section>

      {/* Localisation */}
      <Section title="Localisation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
              Ville *
            </label>
            <select
              name="zone"
              defaultValue={activite?.zone ?? ""}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            >
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <Field label="Lieu FR *" name="lieuFr" required defaultValue={activite?.lieuFr} />
          <Field label="الموقع بالعربية" name="lieuAr" dir="rtl" defaultValue={activite?.lieuAr ?? ""} />
          <Field label="Lien Google Maps" name="mapsUrl" defaultValue={activite?.mapsUrl ?? ""} />
          <Field label="Latitude" name="latitude" type="number" defaultValue={activite?.latitude?.toString() ?? ""} />
          <Field label="Longitude" name="longitude" type="number" defaultValue={activite?.longitude?.toString() ?? ""} />
        </div>
      </Section>

      {/* Image */}
      <Section title="Image principale">
        {activite?.image && (
          <img src={activite.image} alt="Image actuelle" className="h-32 object-cover rounded-xl mb-3" />
        )}
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm text-[var(--color-on-surface-variant)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[var(--color-secondary)] file:text-white file:font-bold file:text-xs hover:file:opacity-90"
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
        <a
          href="/admin/activites"
          className="px-6 py-3 rounded-xl border border-[var(--color-outline-variant)] text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]"
        >
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

function Field({
  label, name, type = "text", required = false, defaultValue = "", dir,
}: {
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

function Textarea({
  label, name, rows = 3, required = false, defaultValue = "", dir,
}: {
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
