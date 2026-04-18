/**
 * @fileoverview Defines the projects schema and its Zod validation types.
 * This table acts as the parent object for all PMO data entities.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  github_repo_url: text("github_repo_url"),
  clickup_folder_id: text("clickup_folder_id"),
  created_at: integer("created_at").notNull().default(Date.now()),
});

// Zod schemas
export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
