/**
 * @fileoverview API routes for managing PMO Documents.
 * Handles document lookup and linking to projects.
 */

import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { documents } from "../../db/schemas/documents/documents";
import { projects } from "../../db/schemas/projects/projects";
import { Logger } from "../../lib/logger";
import { Bindings } from "../index";

const docsApp = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/docs/:google_doc_id/project
 * Looks up the project associated with a specific Google Doc ID.
 */
docsApp.get("/:google_doc_id/project", async (c) => {
  const docId = c.req.param("google_doc_id");
  Logger.info(c.env.DB, "api/docs", `Fetching project for doc: ${docId}`);

  const db = drizzle(c.env.DB);
  const doc = await db.select().from(documents).where(eq(documents.google_doc_id, docId)).get();

  if (!doc) {
    Logger.warn(c.env.DB, "api/docs", `Document not found: ${docId}`);
    return c.json({ error: "Document not found" }, 404);
  }

  const project = await db.select().from(projects).where(eq(projects.id, doc.project_id)).get();
  return c.json({ project, document: doc });
});

const linkDocSchema = z.object({
  project_id: z.string(),
  google_doc_id: z.string(),
  doc_type: z.string().default("PRD"),
});

/**
 * POST /api/docs/link
 * Links an existing Google Doc to a project, auto-incrementing the version.
 */
docsApp.post("/link", zValidator("json", linkDocSchema), async (c) => {
  Logger.info(c.env.DB, "api/docs", "Linking document to project");
  const db = drizzle(c.env.DB);
  const { project_id, google_doc_id, doc_type } = c.req.valid("json");

  try {
    const existingDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.project_id, project_id))
      .all();
    const nextVersion =
      existingDocs.length > 0 ? Math.max(...existingDocs.map((d) => d.version_number)) + 1 : 1;

    await db
      .insert(documents)
      .values({
        id: uuidv4(),
        project_id,
        google_doc_id,
        doc_type,
        version_number: nextVersion,
      })
      .run();

    Logger.info(c.env.DB, "api/docs", `Successfully linked doc as v${nextVersion}`);
    return c.json({ success: true, version: nextVersion });
  } catch (error: any) {
    Logger.error(c.env.DB, "api/docs", "Failed to link document", { error: error.message });
    return c.json({ error: "Failed to link document" }, 500);
  }
});

export default docsApp;
