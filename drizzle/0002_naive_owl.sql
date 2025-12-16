CREATE TABLE "bad_words" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bad_words_word_unique" UNIQUE("word")
);
