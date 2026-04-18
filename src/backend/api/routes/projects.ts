/**
 * @fileoverview API routes for managing PMO Projects.
 * Handles listing, creating, and retrieving project entities.
 */

import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { documents } from "../../db/schemas/documents/documents";
import { projects } from "../../db/schemas/projects/projects";
import { Logger } from "../../lib/logger";
import { Bindings } from "../index";

const projectsApp = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/projects
 * Retrieves a list of all projects.
 */
projectsApp.get("/", async (c) => {
  Logger.info(c.env.DB, "api/projects", "Fetching all projects");
  const db = drizzle(c.env.DB);
  const allProjects = await db.select().from(projects).all();
  return c.json(allProjects);
});

const createProjectSchema = z.object({
  name: z.string(),
  google_doc_id: z.string(),
  doc_type: z.string().default("PRD"),
});

/**
 * POST /api/projects
 * Creates a new project and links the initial document.
 *
 * @param {Object} body JSON body matching createProjectSchema.
 * @returns JSON containing the newly created project URL.
 */
projectsApp.post("/", zValidator("json", createProjectSchema), async (c) => {
  Logger.info(c.env.DB, "api/projects", "Creating new project");
  const db = drizzle(c.env.DB);
  const { name, google_doc_id, doc_type } = c.req.valid("json");
  const projectId = uuidv4();

  try {
    await db
      .insert(projects)
      .values({
        id: projectId,
        name,
        created_at: Date.now(),
      })
      .run();

    await db
      .insert(documents)
      .values({
        id: uuidv4(),
        project_id: projectId,
        google_doc_id,
        doc_type,
        version_number: 1,
      })
      .run();

    Logger.info(c.env.DB, "api/projects", `Successfully created project ${projectId}`);
    return c.json({ url: `/projects/${projectId}` });
  } catch (error: any) {
    Logger.error(c.env.DB, "api/projects", "Failed to create project", { error: error.message });
    return c.json({ error: "Failed to create project" }, 500);
  }
});

export default projectsApp;
