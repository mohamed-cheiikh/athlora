CREATE TYPE "public"."categorie_activite" AS ENUM('sport', 'tourisme');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('fr', 'ar');--> statement-breakpoint
CREATE TYPE "public"."niveau" AS ENUM('debutant', 'intermediaire', 'confirme', 'expert');--> statement-breakpoint
CREATE TYPE "public"."sport_type" AS ENUM('course', 'randonnee', 'cyclisme', 'natation', 'trail', 'autre');--> statement-breakpoint
CREATE TYPE "public"."statut_demande" AS ENUM('en_attente', 'confirme', 'annule');--> statement-breakpoint
CREATE TYPE "public"."sujet_contact" AS ENUM('question_generale', 'partenariat', 'assistance');--> statement-breakpoint
CREATE TYPE "public"."type_cible" AS ENUM('evenement', 'activite', 'hebergement');--> statement-breakpoint
CREATE TYPE "public"."type_hebergement" AS ENUM('hotel', 'auberge', 'motel');--> statement-breakpoint
CREATE TABLE "activites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "activites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(160) NOT NULL,
	"categorie_principale" "categorie_activite" NOT NULL,
	"sous_categorie" varchar(40) NOT NULL,
	"titre_fr" varchar(200) NOT NULL,
	"titre_ar" varchar(200),
	"description_fr" text NOT NULL,
	"description_ar" text,
	"duree_fr" varchar(80),
	"duree_ar" varchar(80),
	"equipement_fr" text,
	"equipement_ar" text,
	"prix" integer,
	"contact_organisateur_nom" varchar(120),
	"contact_organisateur_tel" varchar(30),
	"contact_organisateur_email" varchar(160),
	"publie" boolean DEFAULT false NOT NULL,
	"zone" varchar(80) NOT NULL,
	"lieu_fr" varchar(200) NOT NULL,
	"lieu_ar" varchar(200),
	"latitude" double precision,
	"longitude" double precision,
	"maps_url" text,
	"image" text,
	"galerie" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activites_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "demandes_reservations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "demandes_reservations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type_cible" "type_cible" NOT NULL,
	"cible_id" integer NOT NULL,
	"cible_titre" varchar(200) NOT NULL,
	"nom_client" varchar(120) NOT NULL,
	"telephone" varchar(30) NOT NULL,
	"email" varchar(160),
	"date_souhaitee" date,
	"date_fin" date,
	"nb_personnes" integer DEFAULT 1 NOT NULL,
	"remarques" text,
	"statut" "statut_demande" DEFAULT 'en_attente' NOT NULL,
	"note_admin" text,
	"locale" "locale" DEFAULT 'fr' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evenements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "evenements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(160) NOT NULL,
	"titre_fr" varchar(200) NOT NULL,
	"titre_ar" varchar(200),
	"description_fr" text NOT NULL,
	"description_ar" text,
	"programme_fr" text,
	"programme_ar" text,
	"conditions_fr" text,
	"conditions_ar" text,
	"sport_type" "sport_type" NOT NULL,
	"niveau" "niveau",
	"date_debut" timestamp with time zone NOT NULL,
	"date_fin" timestamp with time zone,
	"prix" integer,
	"places_max" integer,
	"a_la_une" boolean DEFAULT false NOT NULL,
	"publie" boolean DEFAULT false NOT NULL,
	"zone" varchar(80) NOT NULL,
	"lieu_fr" varchar(200) NOT NULL,
	"lieu_ar" varchar(200),
	"latitude" double precision,
	"longitude" double precision,
	"maps_url" text,
	"image" text,
	"galerie" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evenements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hebergements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hebergements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(160) NOT NULL,
	"type" "type_hebergement" NOT NULL,
	"nom_fr" varchar(200) NOT NULL,
	"nom_ar" varchar(200),
	"description_fr" text NOT NULL,
	"description_ar" text,
	"adresse" varchar(255) NOT NULL,
	"telephone" varchar(30),
	"email" varchar(160),
	"site_web" text,
	"tarif_indicatif" integer,
	"commodites" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"publie" boolean DEFAULT false NOT NULL,
	"zone" varchar(80) NOT NULL,
	"lieu_fr" varchar(200) NOT NULL,
	"lieu_ar" varchar(200),
	"latitude" double precision,
	"longitude" double precision,
	"maps_url" text,
	"image" text,
	"galerie" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hebergements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hebergements_activites" (
	"hebergement_id" integer NOT NULL,
	"activite_id" integer NOT NULL,
	CONSTRAINT "hebergements_activites_hebergement_id_activite_id_pk" PRIMARY KEY("hebergement_id","activite_id")
);
--> statement-breakpoint
CREATE TABLE "hebergements_evenements" (
	"hebergement_id" integer NOT NULL,
	"evenement_id" integer NOT NULL,
	CONSTRAINT "hebergements_evenements_hebergement_id_evenement_id_pk" PRIMARY KEY("hebergement_id","evenement_id")
);
--> statement-breakpoint
CREATE TABLE "messages_contact" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_contact_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nom" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"telephone" varchar(30),
	"sujet" "sujet_contact" NOT NULL,
	"message" text NOT NULL,
	"lu" boolean DEFAULT false NOT NULL,
	"locale" "locale" DEFAULT 'fr' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parametres_site" (
	"cle" varchar(60) PRIMARY KEY NOT NULL,
	"valeur" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"cle" varchar(200) PRIMARY KEY NOT NULL,
	"compteur" integer DEFAULT 0 NOT NULL,
	"fenetre_debut" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_admin" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_admin_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nom" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"mot_de_passe_hash" text NOT NULL,
	"derniere_connexion" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "hebergements_activites" ADD CONSTRAINT "hebergements_activites_hebergement_id_hebergements_id_fk" FOREIGN KEY ("hebergement_id") REFERENCES "public"."hebergements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hebergements_activites" ADD CONSTRAINT "hebergements_activites_activite_id_activites_id_fk" FOREIGN KEY ("activite_id") REFERENCES "public"."activites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hebergements_evenements" ADD CONSTRAINT "hebergements_evenements_hebergement_id_hebergements_id_fk" FOREIGN KEY ("hebergement_id") REFERENCES "public"."hebergements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hebergements_evenements" ADD CONSTRAINT "hebergements_evenements_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activites_categorie_idx" ON "activites" USING btree ("categorie_principale","sous_categorie");--> statement-breakpoint
CREATE INDEX "activites_publie_zone_idx" ON "activites" USING btree ("publie","zone");--> statement-breakpoint
CREATE INDEX "demandes_statut_idx" ON "demandes_reservations" USING btree ("statut","created_at");--> statement-breakpoint
CREATE INDEX "demandes_cible_idx" ON "demandes_reservations" USING btree ("type_cible","cible_id");--> statement-breakpoint
CREATE INDEX "evenements_date_idx" ON "evenements" USING btree ("date_debut");--> statement-breakpoint
CREATE INDEX "evenements_publie_zone_idx" ON "evenements" USING btree ("publie","zone");--> statement-breakpoint
CREATE INDEX "hebergements_type_idx" ON "hebergements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "hebergements_publie_zone_idx" ON "hebergements" USING btree ("publie","zone");--> statement-breakpoint
CREATE INDEX "messages_lu_idx" ON "messages_contact" USING btree ("lu","created_at");