import { sql } from "drizzle-orm";
/**
 * @fileoverview Defines the system_logs schema and its Zod validation types.
 * Acts as the centralized persistence layer for backend observabilty.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const system_logs = sqliteTable("system_logs", {
  id: text("id").primaryKey(),
  timestamp: integer("timestamp")
    .notNull()
    .default(sql`(unixepoch())`),
  level: text("level").notNull(), // 'info', 'warn', 'error'
  module: text("module").notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"), // JSON stringified
});

// Zod schemas
export const insertSystemLogSchema = createInsertSchema(system_logs);
export const selectSystemLogSchema = createSelectSchema(system_logs);
