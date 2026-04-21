/**
 * @fileoverview Defines the tasks schema and its Zod validation types.
 * Tracks granular action items derived from documents or linked externally.
 */
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { projects } from "../projects/projects";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  project_id: text("project_id")
    .notNull()
    .references(() => projects.id),
  external_task_id: text("external_task_id"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  agent_assignee: text("agent_assignee"),
});

// Zod schemas
export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);
