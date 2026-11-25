import {
  pgTable, pgEnum, integer, varchar, text, boolean,
  timestamp, date, doublePrecision, jsonb, primaryKey, index,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────
export const sportTypeEnum        = pgEnum("sport_type",         ["course", "randonnee", "cyclisme", "natation", "trail", "autre"]);
export const niveauEnum           = pgEnum("niveau",             ["debutant", "intermediaire", "confirme", "expert"]);
export const categorieActiviteEnum= pgEnum("categorie_activite", ["sport", "tourisme"]);
export const typeHebergementEnum  = pgEnum("type_hebergement",   ["hotel", "auberge", "motel"]);
export const typeCibleEnum        = pgEnum("type_cible",         ["evenement", "activite", "hebergement"]);
export const statutDemandeEnum    = pgEnum("statut_demande",     ["en_attente", "confirme", "annule"]);
export const sujetContactEnum     = pgEnum("sujet_contact",      ["question_generale", "partenariat", "assistance"]);
export const localeEnum           = pgEnum("locale",             ["fr", "ar"]);

// ── Colonnes réutilisables ───────────────────────────────────────────
const timestamps = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
};

const localisation = {
  zone:      varchar({ length: 80 }).notNull(),
  lieuFr:    varchar({ length: 200 }).notNull(),
  lieuAr:    varchar({ length: 200 }),
  latitude:  doublePrecision(),
  longitude: doublePrecision(),
  mapsUrl:   text(),
};

const medias = {
  image:   text(),
  galerie: jsonb().$type<string[]>().default([]).notNull(),
};

// ── Tables métier ────────────────────────────────────────────────────
export const usersAdmin = pgTable("users_admin", {
  id:                integer().primaryKey().generatedAlwaysAsIdentity(),
  nom:               varchar({ length: 120 }).notNull(),
  email:             varchar({ length: 160 }).notNull().unique(),
  motDePasseHash:    text().notNull(),
  derniereConnexion: timestamp({ withTimezone: true }),
  ...timestamps,
});

export const evenements = pgTable("evenements", {
  id:            integer().primaryKey().generatedAlwaysAsIdentity(),
  slug:          varchar({ length: 160 }).notNull().unique(),
  titreFr:       varchar({ length: 200 }).notNull(),
  titreAr:       varchar({ length: 200 }),
  descriptionFr: text().notNull(),
  descriptionAr: text(),
  programmeFr:   text(),
  programmeAr:   text(),
  conditionsFr:  text(),
  conditionsAr:  text(),
  sportType:     sportTypeEnum().notNull(),
  niveau:        niveauEnum(),
  dateDebut:     timestamp({ withTimezone: true }).notNull(),
  dateFin:       timestamp({ withTimezone: true }),
  prix:          integer(),
  placesMax:     integer(),
  aLaUne:        boolean().default(false).notNull(),
  publie:        boolean().default(false).notNull(),
  ...localisation,
  ...medias,
  ...timestamps,
}, (t) => [
  index("evenements_date_idx").on(t.dateDebut),
  index("evenements_publie_zone_idx").on(t.publie, t.zone),
]);

export const activites = pgTable("activites", {
  id:                        integer().primaryKey().generatedAlwaysAsIdentity(),
  slug:                      varchar({ length: 160 }).notNull().unique(),
  categoriePrincipale:       categorieActiviteEnum().notNull(),
  sousCategorie:             varchar({ length: 40 }).notNull(),
  titreFr:                   varchar({ length: 200 }).notNull(),
  titreAr:                   varchar({ length: 200 }),
  descriptionFr:             text().notNull(),
  descriptionAr:             text(),
  dureeFr:                   varchar({ length: 80 }),
  dureeAr:                   varchar({ length: 80 }),
  equipementFr:              text(),
  equipementAr:              text(),
  prix:                      integer(),
  contactOrganisateurNom:    varchar({ length: 120 }),
  contactOrganisateurTel:    varchar({ length: 30 }),
  contactOrganisateurEmail:  varchar({ length: 160 }),
  publie:                    boolean().default(false).notNull(),
  ...localisation,
  ...medias,
  ...timestamps,
}, (t) => [
  index("activites_categorie_idx").on(t.categoriePrincipale, t.sousCategorie),
  index("activites_publie_zone_idx").on(t.publie, t.zone),
]);

export const hebergements = pgTable("hebergements", {
  id:              integer().primaryKey().generatedAlwaysAsIdentity(),
  slug:            varchar({ length: 160 }).notNull().unique(),
  type:            typeHebergementEnum().notNull(),
  nomFr:           varchar({ length: 200 }).notNull(),
  nomAr:           varchar({ length: 200 }),
  descriptionFr:   text().notNull(),
  descriptionAr:   text(),
  adresse:         varchar({ length: 255 }).notNull(),
  telephone:       varchar({ length: 30 }),
  email:           varchar({ length: 160 }),
  siteWeb:         text(),
  tarifIndicatif:  integer(),
  commodites:      jsonb().$type<string[]>().default([]).notNull(),
  publie:          boolean().default(false).notNull(),
  ...localisation,
  ...medias,
  ...timestamps,
}, (t) => [
  index("hebergements_type_idx").on(t.type),
  index("hebergements_publie_zone_idx").on(t.publie, t.zone),
]);

export const demandesReservations = pgTable("demandes_reservations", {
  id:           integer().primaryKey().generatedAlwaysAsIdentity(),
  typeCible:    typeCibleEnum().notNull(),
  cibleId:      integer().notNull(),
  cibleTitre:   varchar({ length: 200 }).notNull(),
  nomClient:    varchar({ length: 120 }).notNull(),
  telephone:    varchar({ length: 30 }).notNull(),
  email:        varchar({ length: 160 }),
  dateSouhaitee:date(),
  dateFin:      date(),
  nbPersonnes:  integer().default(1).notNull(),
  remarques:    text(),
  statut:       statutDemandeEnum().default("en_attente").notNull(),
  noteAdmin:    text(),
  locale:       localeEnum().default("fr").notNull(),
  ...timestamps,
}, (t) => [
  index("demandes_statut_idx").on(t.statut, t.createdAt),
  index("demandes_cible_idx").on(t.typeCible, t.cibleId),
]);

export const messagesContact = pgTable("messages_contact", {
  id:        integer().primaryKey().generatedAlwaysAsIdentity(),
  nom:       varchar({ length: 120 }).notNull(),
  email:     varchar({ length: 160 }).notNull(),
  telephone: varchar({ length: 30 }),
  sujet:     sujetContactEnum().notNull(),
  message:   text().notNull(),
  lu:        boolean().default(false).notNull(),
  locale:    localeEnum().default("fr").notNull(),
  ...timestamps,
}, (t) => [index("messages_lu_idx").on(t.lu, t.createdAt)]);

// ── Tables de support ────────────────────────────────────────────────
export const hebergementsEvenements = pgTable("hebergements_evenements", {
  hebergementId: integer().notNull().references(() => hebergements.id, { onDelete: "cascade" }),
  evenementId:   integer().notNull().references(() => evenements.id,   { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.hebergementId, t.evenementId] })]);

export const hebergementsActivites = pgTable("hebergements_activites", {
  hebergementId: integer().notNull().references(() => hebergements.id, { onDelete: "cascade" }),
  activiteId:    integer().notNull().references(() => activites.id,    { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.hebergementId, t.activiteId] })]);

export const parametresSite = pgTable("parametres_site", {
  cle:      varchar({ length: 60 }).primaryKey(),
  valeur:   jsonb().notNull(),
  updatedAt:timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export const rateLimits = pgTable("rate_limits", {
  cle:          varchar({ length: 200 }).primaryKey(),
  compteur:     integer().default(0).notNull(),
  fenetreDebut: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

// ── Types exportés ───────────────────────────────────────────────────
export type Evenement          = typeof evenements.$inferSelect;
export type EvenementInsert    = typeof evenements.$inferInsert;
export type Activite           = typeof activites.$inferSelect;
export type ActiviteInsert     = typeof activites.$inferInsert;
export type Hebergement        = typeof hebergements.$inferSelect;
export type HebergementInsert  = typeof hebergements.$inferInsert;
export type DemandeReservation       = typeof demandesReservations.$inferSelect;
export type DemandeReservationInsert = typeof demandesReservations.$inferInsert;
export type MessageContact           = typeof messagesContact.$inferSelect;
export type MessageContactInsert     = typeof messagesContact.$inferInsert;
export type UserAdmin                = typeof usersAdmin.$inferSelect;
