import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  github_repo_url: text("github_repo_url"),
  clickup_folder_id: text("clickup_folder_id"),
  created_at: integer("created_at").notNull().default(Date.now()),
});

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  project_id: text("project_id")
    .notNull()
    .references(() => projects.id),
  google_doc_id: text("google_doc_id").notNull().unique(),
  doc_type: text("doc_type").notNull(), // 'PRD', etc.
  version_number: integer("version_number").notNull().default(1),
});

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

export const jules_sessions = sqliteTable("jules_sessions", {
  id: text("id").primaryKey(),
  project_id: text("project_id")
    .notNull()
    .references(() => projects.id),
  jules_api_session_id: text("jules_api_session_id").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("running"),
});
