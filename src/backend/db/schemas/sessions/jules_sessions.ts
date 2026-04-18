/**
 * @fileoverview Defines the jules_sessions schema and its Zod validation types.
 * Manages the state of long-running repoless execution agent sessions.
 */
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { projects } from "../projects/projects";

export const jules_sessions = sqliteTable("jules_sessions", {
  id: text("id").primaryKey(),
  project_id: text("project_id")
    .notNull()
    .references(() => projects.id),
  jules_api_session_id: text("jules_api_session_id").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("running"),
});

// Zod schemas
export const insertJulesSessionSchema = createInsertSchema(jules_sessions);
export const selectJulesSessionSchema = createSelectSchema(jules_sessions);
