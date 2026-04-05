CREATE TABLE "auth_email_tokens" (
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

CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"active_workspace_owner_id" text
);

CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"onboarding_step" text DEFAULT 'done' NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"email_verified_at" timestamp with time zone,
	"owner_onboarding_stage" text DEFAULT 'complete' NOT NULL,
	"owner_onboarding_site_domain" text,
	"owner_onboarding_referral_code" text,
	CONSTRAINT "users_onboarding_step_check" CHECK ((onboarding_step = ANY (ARRAY['signup'::text, 'team'::text, 'customize'::text, 'install'::text, 'done'::text]))),
	CONSTRAINT "users_owner_onboarding_stage_check" CHECK ((owner_onboarding_stage = ANY (ARRAY['account_created'::text, 'site_created'::text, 'billing_ready'::text, 'referral_applied'::text, 'complete'::text])))
);

CREATE TABLE "team_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by_user_id" text,
	CONSTRAINT "team_invites_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text]))),
	CONSTRAINT "team_invites_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'revoked'::text])))
);

CREATE TABLE "team_memberships" (
	"owner_user_id" text NOT NULL,
	"member_user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_memberships_pkey" PRIMARY KEY("owner_user_id","member_user_id"),
	CONSTRAINT "team_memberships_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text]))),
	CONSTRAINT "team_memberships_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'revoked'::text])))
);

CREATE TABLE "user_presence" (
	"user_id" text PRIMARY KEY NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"first_name" text DEFAULT '' NOT NULL,
	"last_name" text DEFAULT '' NOT NULL,
	"job_title" text DEFAULT '' NOT NULL,
	"avatar_data_url" text,
	"notification_email" text,
	"reply_to_email" text,
	"browser_notifications" boolean DEFAULT true NOT NULL,
	"sound_alerts" boolean DEFAULT true NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"new_visitor_alerts" boolean DEFAULT false NOT NULL,
	"high_intent_alerts" boolean DEFAULT true NOT NULL,
	"assignment_notifications" boolean DEFAULT true NOT NULL,
	"mention_notifications" boolean DEFAULT true NOT NULL,
	"quiet_hours_enabled" boolean DEFAULT false NOT NULL,
	"quiet_hours_start" text DEFAULT '22:00' NOT NULL,
	"quiet_hours_end" text DEFAULT '08:00' NOT NULL,
	"email_signature" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email_templates_json" text DEFAULT '' NOT NULL,
	"timezone" text,
	"weekly_report_enabled" boolean DEFAULT true NOT NULL,
	"weekly_report_send_hour" integer DEFAULT 9 NOT NULL,
	"weekly_report_include_personal_stats" boolean DEFAULT true NOT NULL,
	"weekly_report_send_minute" integer DEFAULT 0 NOT NULL,
	"workspace_automation_settings_json" text DEFAULT '' NOT NULL
);

CREATE TABLE "workspace_report_settings" (
	"owner_user_id" text PRIMARY KEY NOT NULL,
	"weekly_reports_enabled" boolean DEFAULT true NOT NULL,
	"include_team_leaderboard" boolean DEFAULT true NOT NULL,
	"ai_insights_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "daily_digest_deliveries" (
	"user_id" text NOT NULL,
	"digest_date" date NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"owner_user_id" text NOT NULL,
	CONSTRAINT "daily_digest_deliveries_pkey" PRIMARY KEY("user_id","owner_user_id","digest_date")
);

CREATE TABLE "growth_email_nudges" (
	"user_id" text NOT NULL,
	"nudge_key" text NOT NULL,
	"last_sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "growth_email_nudges_pkey" PRIMARY KEY("user_id","nudge_key")
);

CREATE TABLE "scheduler_run_windows" (
	"job_key" text NOT NULL,
	"window_key" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "scheduler_run_windows_job_window_pk" PRIMARY KEY("job_key","window_key")
);

CREATE TABLE "weekly_performance_deliveries" (
	"user_id" text NOT NULL,
	"week_start" date NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"owner_user_id" text NOT NULL,
	CONSTRAINT "weekly_performance_deliveries_pkey" PRIMARY KEY("user_id","owner_user_id","week_start")
);

CREATE TABLE "weekly_performance_snapshots" (
	"owner_user_id" text NOT NULL,
	"week_start" date NOT NULL,
	"snapshot_json" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_performance_snapshots_pkey" PRIMARY KEY("owner_user_id","week_start")
);

CREATE TABLE "referral_attributions" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"referred_user_id" text NOT NULL,
	"referred_email" text NOT NULL,
	"code" text NOT NULL,
	"program_type" text NOT NULL,
	"program_label" text NOT NULL,
	"referrer_reward_months" integer DEFAULT 0 NOT NULL,
	"referrer_reward_cents" integer DEFAULT 0 NOT NULL,
	"referred_reward_cents" integer DEFAULT 0 NOT NULL,
	"commission_bps" integer DEFAULT 0 NOT NULL,
	"converted_to_paid_at" timestamp with time zone,
	"first_paid_invoice_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_attributions_program_type_check" CHECK ((program_type = ANY (ARRAY['customer'::text, 'affiliate'::text, 'mutual'::text])))
);

CREATE TABLE "referral_programs" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"code" text NOT NULL,
	"program_type" text NOT NULL,
	"label" text NOT NULL,
	"referrer_reward_months" integer DEFAULT 0 NOT NULL,
	"referrer_reward_cents" integer DEFAULT 0 NOT NULL,
	"referred_reward_cents" integer DEFAULT 0 NOT NULL,
	"commission_bps" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_programs_program_type_check" CHECK ((program_type = ANY (ARRAY['customer'::text, 'affiliate'::text, 'mutual'::text])))
);

CREATE TABLE "referral_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"reward_key" text NOT NULL,
	"attribution_id" text NOT NULL,
	"beneficiary_user_id" text NOT NULL,
	"program_type" text NOT NULL,
	"program_label" text NOT NULL,
	"reward_role" text NOT NULL,
	"reward_kind" text NOT NULL,
	"status" text NOT NULL,
	"description" text NOT NULL,
	"reward_months" integer DEFAULT 0 NOT NULL,
	"reward_cents" integer DEFAULT 0 NOT NULL,
	"commission_bps" integer DEFAULT 0 NOT NULL,
	"source_invoice_id" text,
	"source_invoice_amount_cents" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"earned_at" timestamp with time zone,
	CONSTRAINT "referral_rewards_program_type_check" CHECK ((program_type = ANY (ARRAY['customer'::text, 'affiliate'::text, 'mutual'::text]))),
	CONSTRAINT "referral_rewards_reward_kind_check" CHECK ((reward_kind = ANY (ARRAY['free_month'::text, 'discount_credit'::text, 'commission'::text]))),
	CONSTRAINT "referral_rewards_reward_role_check" CHECK ((reward_role = ANY (ARRAY['referrer'::text, 'referred'::text]))),
	CONSTRAINT "referral_rewards_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'earned'::text])))
);

CREATE TABLE "billing_accounts" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plan_key" text DEFAULT 'starter' NOT NULL,
	"next_billing_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"stripe_status" text,
	"stripe_current_period_end" timestamp with time zone,
	"billing_interval" text DEFAULT 'monthly' NOT NULL,
	"seat_quantity" integer DEFAULT 1 NOT NULL,
	"trial_started_at" timestamp with time zone,
	"trial_ends_at" timestamp with time zone,
	"trial_extension_used_at" timestamp with time zone,
	CONSTRAINT "billing_accounts_billing_interval_check" CHECK ((billing_interval = ANY (ARRAY['monthly'::text, 'annual'::text]))),
	CONSTRAINT "billing_accounts_plan_key_check" CHECK ((plan_key = ANY (ARRAY['starter'::text, 'growth'::text]))),
	CONSTRAINT "billing_accounts_seat_quantity_check" CHECK ((seat_quantity >= 1))
);

CREATE TABLE "billing_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_key" text NOT NULL,
	"description" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'paid' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stripe_invoice_id" text,
	"hosted_invoice_url" text,
	"invoice_pdf_url" text,
	"billing_interval" text,
	"seat_quantity" integer,
	CONSTRAINT "billing_invoices_billing_interval_check" CHECK (((billing_interval IS NULL) OR (billing_interval = ANY (ARRAY['monthly'::text, 'annual'::text])))),
	CONSTRAINT "billing_invoices_plan_key_check" CHECK ((plan_key = ANY (ARRAY['starter'::text, 'growth'::text]))),
	CONSTRAINT "billing_invoices_status_check" CHECK ((status = ANY (ARRAY['paid'::text, 'open'::text])))
);

CREATE TABLE "billing_payment_methods" (
	"user_id" text PRIMARY KEY NOT NULL,
	"brand" text NOT NULL,
	"last4" text NOT NULL,
	"exp_month" integer NOT NULL,
	"exp_year" integer NOT NULL,
	"holder_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stripe_payment_method_id" text
);

CREATE TABLE "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"brand_color" text DEFAULT '#2563EB' NOT NULL,
	"greeting_text" text DEFAULT 'Hi there. Have a question? We''re here to help.' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"widget_title" text DEFAULT 'Talk to the team' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"attribution_model" text DEFAULT 'last-touch' NOT NULL,
	"excluded_ips" text[] DEFAULT '{}'::text[] NOT NULL,
	"bot_filtering_enabled" boolean DEFAULT true NOT NULL,
	"launcher_position" text DEFAULT 'right' NOT NULL,
	"avatar_style" text DEFAULT 'initials' NOT NULL,
	"show_online_status" boolean DEFAULT true NOT NULL,
	"require_email_offline" boolean DEFAULT false NOT NULL,
	"sound_notifications" boolean DEFAULT false NOT NULL,
	"auto_open_paths" text[] DEFAULT '{}'::text[] NOT NULL,
	"response_time_mode" text DEFAULT 'minutes' NOT NULL,
	"operating_hours_enabled" boolean DEFAULT false NOT NULL,
	"operating_hours_timezone" text DEFAULT 'UTC' NOT NULL,
	"operating_hours_json" text DEFAULT '' NOT NULL,
	"widget_last_seen_at" timestamp with time zone,
	"team_photo_url" text,
	"team_photo_key" text,
	"widget_install_verified_at" timestamp with time zone,
	"widget_last_seen_url" text,
	"widget_install_verified_url" text,
	"offline_title" text DEFAULT 'We''re not online right now' NOT NULL,
	"offline_message" text DEFAULT 'Leave a message and we''ll get back to you via email.' NOT NULL,
	"away_title" text DEFAULT 'We''re away right now' NOT NULL,
	"away_message" text DEFAULT 'Leave a message and we''ll get back to you via email.' NOT NULL,
	CONSTRAINT "sites_attribution_model_check" CHECK ((attribution_model = ANY (ARRAY['first-touch'::text, 'last-touch'::text])))
);

CREATE TABLE "conversation_metadata" (
	"conversation_id" text PRIMARY KEY NOT NULL,
	"page_url" text,
	"referrer" text,
	"user_agent" text,
	"country" text,
	"region" text,
	"city" text,
	"timezone" text,
	"locale" text
);

CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"email" text,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_user_id" text,
	CONSTRAINT "conversations_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'resolved'::text])))
);

CREATE TABLE "feedback" (
	"conversation_id" text PRIMARY KEY NOT NULL,
	"helpful" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rating" smallint,
	CONSTRAINT "feedback_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);

CREATE TABLE "conversation_reads" (
	"user_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_reads_pkey" PRIMARY KEY("user_id","conversation_id")
);

CREATE TABLE "conversation_typing" (
	"user_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_typing_pkey" PRIMARY KEY("user_id","conversation_id")
);

CREATE TABLE "email_template_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"template_key" text NOT NULL,
	"delivery_key" text NOT NULL,
	"recipient_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"user_id" text,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"last_attempt_at" timestamp with time zone,
	"next_attempt_at" timestamp with time zone,
	CONSTRAINT "email_template_deliveries_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'failed'::text, 'sent'::text])))
);

CREATE TABLE "message_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"content" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"author_user_id" text,
	CONSTRAINT "messages_sender_check" CHECK ((sender = ANY (ARRAY['user'::text, 'team'::text])))
);

CREATE TABLE "tags" (
	"conversation_id" text NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_pkey" PRIMARY KEY("conversation_id","tag")
);

CREATE TABLE "visitor_typing" (
	"conversation_id" text NOT NULL,
	"session_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visitor_typing_pkey" PRIMARY KEY("conversation_id","session_id")
);

CREATE TABLE "help_center_articles" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "saved_replies" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "email_recipient_preferences" (
	"email" text PRIMARY KEY NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'blog' NOT NULL,
	"last_source" text DEFAULT 'blog' NOT NULL,
	"welcome_email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone
);

CREATE TABLE "tool_export_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"tool_slug" text NOT NULL,
	"source" text DEFAULT 'free-tools' NOT NULL,
	"result_payload_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"delivery_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "visitor_contacts" (
	"site_id" text NOT NULL,
	"email" text NOT NULL,
	"latest_conversation_id" text,
	"latest_session_id" text,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visitor_contacts_pkey" PRIMARY KEY("site_id","email")
);

CREATE TABLE "visitor_notes" (
	"site_id" text NOT NULL,
	"identity_type" text NOT NULL,
	"identity_value" text NOT NULL,
	"note" text NOT NULL,
	"updated_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"mentions_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "visitor_notes_pkey" PRIMARY KEY("site_id","identity_type","identity_value"),
	CONSTRAINT "visitor_notes_identity_type_check" CHECK ((identity_type = ANY (ARRAY['email'::text, 'session'::text])))
);

CREATE TABLE "visitor_presence_sessions" (
	"site_id" text NOT NULL,
	"session_id" text NOT NULL,
	"conversation_id" text,
	"email" text,
	"current_page_url" text,
	"referrer" text,
	"user_agent" text,
	"country" text,
	"region" text,
	"city" text,
	"timezone" text,
	"locale" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visitor_presence_sessions_pkey" PRIMARY KEY("site_id","session_id")
);

ALTER TABLE "auth_email_tokens" ADD CONSTRAINT "auth_email_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_active_workspace_owner_id_fkey" FOREIGN KEY ("active_workspace_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_accepted_by_user_id_fkey" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_member_user_id_fkey" FOREIGN KEY ("member_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_presence" ADD CONSTRAINT "user_presence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "workspace_report_settings" ADD CONSTRAINT "workspace_report_settings_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_digest_deliveries" ADD CONSTRAINT "daily_digest_deliveries_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_digest_deliveries" ADD CONSTRAINT "daily_digest_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "growth_email_nudges" ADD CONSTRAINT "growth_email_nudges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "weekly_performance_deliveries" ADD CONSTRAINT "weekly_performance_deliveries_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "weekly_performance_deliveries" ADD CONSTRAINT "weekly_performance_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "weekly_performance_snapshots" ADD CONSTRAINT "weekly_performance_snapshots_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "referral_attributions" ADD CONSTRAINT "referral_attributions_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "referral_attributions" ADD CONSTRAINT "referral_attributions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."referral_programs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "referral_attributions" ADD CONSTRAINT "referral_attributions_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "referral_programs" ADD CONSTRAINT "referral_programs_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_attribution_id_fkey" FOREIGN KEY ("attribution_id") REFERENCES "public"."referral_attributions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_beneficiary_user_id_fkey" FOREIGN KEY ("beneficiary_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "billing_accounts" ADD CONSTRAINT "billing_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "billing_payment_methods" ADD CONSTRAINT "billing_payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sites" ADD CONSTRAINT "sites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation_metadata" ADD CONSTRAINT "conversation_metadata_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation_typing" ADD CONSTRAINT "conversation_typing_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation_typing" ADD CONSTRAINT "conversation_typing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "email_template_deliveries" ADD CONSTRAINT "email_template_deliveries_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "email_template_deliveries" ADD CONSTRAINT "email_template_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "tags" ADD CONSTRAINT "tags_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "visitor_typing" ADD CONSTRAINT "visitor_typing_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "help_center_articles" ADD CONSTRAINT "help_center_articles_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "saved_replies" ADD CONSTRAINT "saved_replies_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "visitor_contacts" ADD CONSTRAINT "visitor_contacts_latest_conversation_id_fkey" FOREIGN KEY ("latest_conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "visitor_contacts" ADD CONSTRAINT "visitor_contacts_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "visitor_notes" ADD CONSTRAINT "visitor_notes_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "visitor_notes" ADD CONSTRAINT "visitor_notes_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "visitor_presence_sessions" ADD CONSTRAINT "visitor_presence_sessions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "visitor_presence_sessions" ADD CONSTRAINT "visitor_presence_sessions_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "auth_email_tokens_token_hash_key" ON "auth_email_tokens" USING btree ("token_hash");
CREATE UNIQUE INDEX "auth_sessions_token_hash_key" ON "auth_sessions" USING btree ("token_hash");
CREATE INDEX "idx_auth_sessions_token_hash" ON "auth_sessions" USING btree ("token_hash");
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");
CREATE INDEX "idx_team_invites_owner_status" ON "team_invites" USING btree ("owner_user_id","status","updated_at" desc);
CREATE INDEX "idx_team_memberships_member_status" ON "team_memberships" USING btree ("member_user_id","status","updated_at" desc);
CREATE INDEX "idx_team_memberships_owner_status" ON "team_memberships" USING btree ("owner_user_id","status","updated_at" desc);
CREATE UNIQUE INDEX "team_memberships_member_user_id_key" ON "team_memberships" USING btree ("member_user_id");
CREATE INDEX "scheduler_run_windows_started_at_idx" ON "scheduler_run_windows" USING btree ("started_at");
CREATE INDEX "referral_attributions_owner_created_idx" ON "referral_attributions" USING btree ("owner_user_id","created_at" desc);
CREATE INDEX "referral_attributions_referred_idx" ON "referral_attributions" USING btree ("referred_user_id");
CREATE UNIQUE INDEX "referral_attributions_referred_user_id_key" ON "referral_attributions" USING btree ("referred_user_id");
CREATE UNIQUE INDEX "referral_programs_code_key" ON "referral_programs" USING btree ("code");
CREATE INDEX "referral_programs_owner_created_idx" ON "referral_programs" USING btree ("owner_user_id","created_at" desc);
CREATE UNIQUE INDEX "referral_programs_owner_type_key" ON "referral_programs" USING btree ("owner_user_id","program_type");
CREATE INDEX "referral_rewards_attribution_created_idx" ON "referral_rewards" USING btree ("attribution_id","created_at" desc);
CREATE INDEX "referral_rewards_beneficiary_created_idx" ON "referral_rewards" USING btree ("beneficiary_user_id","created_at" desc);
CREATE UNIQUE INDEX "referral_rewards_reward_key_key" ON "referral_rewards" USING btree ("reward_key");
CREATE UNIQUE INDEX "billing_accounts_stripe_customer_id_key" ON "billing_accounts" USING btree ("stripe_customer_id");
CREATE UNIQUE INDEX "billing_accounts_stripe_subscription_id_key" ON "billing_accounts" USING btree ("stripe_subscription_id");
CREATE INDEX "idx_billing_accounts_stripe_customer_id" ON "billing_accounts" USING btree ("stripe_customer_id");
CREATE INDEX "idx_billing_accounts_stripe_subscription_id" ON "billing_accounts" USING btree ("stripe_subscription_id");
CREATE UNIQUE INDEX "billing_invoices_stripe_invoice_id_key" ON "billing_invoices" USING btree ("stripe_invoice_id");
CREATE INDEX "idx_billing_invoices_user_id" ON "billing_invoices" USING btree ("user_id","issued_at" desc);
CREATE UNIQUE INDEX "billing_payment_methods_stripe_payment_method_id_key" ON "billing_payment_methods" USING btree ("stripe_payment_method_id");
CREATE INDEX "idx_sites_user_id" ON "sites" USING btree ("user_id","created_at" desc);
CREATE INDEX "idx_conversations_site_id" ON "conversations" USING btree ("site_id","updated_at" desc);
CREATE INDEX "idx_conversations_updated_at" ON "conversations" USING btree ("updated_at" desc);
CREATE INDEX "idx_conversation_reads_user_id" ON "conversation_reads" USING btree ("user_id","updated_at" desc);
CREATE INDEX "idx_conversation_typing_lookup" ON "conversation_typing" USING btree ("conversation_id","expires_at" desc);
CREATE UNIQUE INDEX "email_template_deliveries_delivery_key_key" ON "email_template_deliveries" USING btree ("delivery_key");
CREATE INDEX "idx_email_template_deliveries_conversation" ON "email_template_deliveries" USING btree ("conversation_id","created_at" desc);
CREATE INDEX "idx_email_template_deliveries_retry_queue" ON "email_template_deliveries" USING btree ("status","next_attempt_at");
CREATE INDEX "idx_message_attachments_message_id" ON "message_attachments" USING btree ("message_id","created_at");
CREATE INDEX "idx_messages_conversation_created_at" ON "messages" USING btree ("conversation_id","created_at" desc);
CREATE INDEX "idx_tags_conversation_id" ON "tags" USING btree ("conversation_id");
CREATE INDEX "idx_visitor_typing_lookup" ON "visitor_typing" USING btree ("conversation_id","expires_at" desc);
CREATE UNIQUE INDEX "help_center_articles_owner_user_id_slug_key" ON "help_center_articles" USING btree ("owner_user_id","slug");
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers" USING btree ("email");
CREATE INDEX "idx_visitor_contacts_conversation_last_seen" ON "visitor_contacts" USING btree ("latest_conversation_id","last_seen_at" desc);
CREATE INDEX "idx_visitor_contacts_site_last_seen" ON "visitor_contacts" USING btree ("site_id","last_seen_at" desc);
CREATE INDEX "idx_visitor_notes_site_updated_at" ON "visitor_notes" USING btree ("site_id","updated_at" desc);
CREATE INDEX "idx_visitor_presence_conversation_last_seen" ON "visitor_presence_sessions" USING btree ("conversation_id","last_seen_at" desc);
CREATE INDEX "idx_visitor_presence_site_last_seen" ON "visitor_presence_sessions" USING btree ("site_id","last_seen_at" desc);
