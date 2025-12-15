CREATE TABLE "confessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"message" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"dislikes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ip_hash" varchar(64),
	"status" text DEFAULT 'APPROVED' NOT NULL,
	"embedding" vector(384)
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"confession_id" integer NOT NULL,
	"ip_hash" varchar(64) NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_confession_id_confessions_id_fk" FOREIGN KEY ("confession_id") REFERENCES "public"."confessions"("id") ON DELETE cascade ON UPDATE no action;