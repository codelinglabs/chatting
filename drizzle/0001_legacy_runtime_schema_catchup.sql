CREATE TABLE IF NOT EXISTS "auth_email_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"type" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_email_tokens_type_check" CHECK ((type = ANY (ARRAY['password_reset'::text, 'email_verification'::text])))
);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'auth_email_tokens_user_id_fkey'
	) THEN
		ALTER TABLE "auth_email_tokens"
			ADD CONSTRAINT "auth_email_tokens_user_id_fkey"
			FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "auth_email_tokens_token_hash_key"
	ON "auth_email_tokens" USING btree ("token_hash");

ALTER TABLE "user_settings"
	ADD COLUMN IF NOT EXISTS "workspace_automation_settings_json" text DEFAULT '' NOT NULL;

ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_sender_check";

UPDATE "messages"
SET "sender" = 'team'
WHERE "sender" NOT IN ('user', 'team');

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'messages_sender_check'
	) THEN
		ALTER TABLE "messages"
			ADD CONSTRAINT "messages_sender_check"
			CHECK (("sender" = ANY (ARRAY['user'::text, 'team'::text])));
	END IF;
END $$;
