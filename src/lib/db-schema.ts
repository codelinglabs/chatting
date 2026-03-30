import type { Pool } from "pg";
import { runBillingSchemaInitialization } from "./db-schema-billing";
import { runConversationSchemaInitialization } from "./db-schema-conversations";
import { runIndexSchemaInitialization } from "./db-schema-indexes";
import { runMarketingSchemaInitialization } from "./db-schema-marketing";
import { runReferralSchemaInitialization } from "./db-schema-referrals";
import { runSiteSchemaInitialization } from "./db-schema-sites";
import { runVisitorNotesSchemaInitialization } from "./db-schema-visitor-notes";
import { runUserSchemaInitialization } from "./db-schema-users";
import { runVisitorPresenceSchemaInitialization } from "./db-schema-visitor-presence";

export async function runSchemaInitialization(pool: Pool) {
  await runUserSchemaInitialization(pool);
  await runReferralSchemaInitialization(pool);
  await runBillingSchemaInitialization(pool);
  await runSiteSchemaInitialization(pool);
  await runConversationSchemaInitialization(pool);
  await runVisitorPresenceSchemaInitialization(pool);
  await runVisitorNotesSchemaInitialization(pool);
  await runMarketingSchemaInitialization(pool);
  await runIndexSchemaInitialization(pool);
}
