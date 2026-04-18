/**
 * @fileoverview Defines the documents schema and its Zod validation types.
 * Links external Google Docs to projects and tracks versioning.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { projects } from "../projects/projects";

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  project_id: text("project_id")
    .notNull()
    .references(() => projects.id),
  google_doc_id: text("google_doc_id").notNull().unique(),
  doc_type: text("doc_type").notNull(), // 'PRD', etc.
  version_number: integer("version_number").notNull().default(1),
});

// Zod schemas
export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);
