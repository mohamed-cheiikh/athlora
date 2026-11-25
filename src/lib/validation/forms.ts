import { z } from "zod";

const phone = z.string().min(9, "invalidPhone").max(20, "invalidPhone");
const name  = z.string().min(2, "required").max(120, "required");
const email = z.string().email("invalidEmail");
const emailOpt = z.string().email("invalidEmail").or(z.literal("")).optional();

export const registerEventSchema = z.object({
  cibleId:    z.coerce.number().int().positive(),
  cibleTitre: z.string().max(200),
  locale:     z.enum(["fr", "ar"]).default("fr"),
  nomClient:  name,
  telephone:  phone,
  email:      emailOpt,
  nbPersonnes: z.coerce.number().int().min(1, "minPeople").max(20, "maxPeople").default(1),
  remarques:  z.string().max(500).optional(),
  _hp:        z.literal(""),
});

export const bookActivitySchema = z.object({
  cibleId:      z.coerce.number().int().positive(),
  cibleTitre:   z.string().max(200),
  locale:       z.enum(["fr", "ar"]).default("fr"),
  nomClient:    name,
  telephone:    phone,
  email:        emailOpt,
  dateSouhaitee: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateFuture"),
  nbPersonnes:  z.coerce.number().int().min(1, "minPeople").max(20, "maxPeople").default(1),
  remarques:    z.string().max(500).optional(),
  _hp:          z.literal(""),
});

export const bookStaySchema = z.object({
  cibleId:       z.coerce.number().int().positive(),
  cibleTitre:    z.string().max(200),
  locale:        z.enum(["fr", "ar"]).default("fr"),
  nomClient:     name,
  telephone:     phone,
  email:         emailOpt,
  dateSouhaitee: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateFuture"),
  dateFin:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateFuture"),
  nbPersonnes:   z.coerce.number().int().min(1, "minPeople").max(20, "maxPeople").default(1),
  remarques:     z.string().max(500).optional(),
  _hp:           z.literal(""),
}).refine((d) => d.dateSouhaitee < d.dateFin, { message: "dateOrder", path: ["dateFin"] });

export const contactSchema = z.object({
  locale:    z.enum(["fr", "ar"]).default("fr"),
  nom:       name,
  email:     email,
  telephone: phone.optional().or(z.literal("")).optional(),
  sujet:     z.enum(["question_generale", "partenariat", "assistance"]),
  message:   z.string().min(10, "required").max(2000, "required"),
  _hp:       z.literal(""),
});

export type RegisterEventInput = z.infer<typeof registerEventSchema>;
export type BookActivityInput  = z.infer<typeof bookActivitySchema>;
export type BookStayInput      = z.infer<typeof bookStaySchema>;
export type ContactInput       = z.infer<typeof contactSchema>;
