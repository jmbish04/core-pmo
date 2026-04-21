/**
 * @fileoverview API routes for managing PMO Projects.
 * Handles listing, creating, and retrieving project entities.
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { drizzle } from "drizzle-orm/d1";

import { documents } from "../../db/schemas/documents/documents";
import {
  projects,
  insertProjectSchema,
  selectProjectSchema,
} from "../../db/schemas/projects/projects";
import { Logger } from "../../lib/logger";
import { Bindings } from "../index";

const projectsApp = new OpenAPIHono<{ Bindings: Bindings }>();

const getProjectsRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(selectProjectSchema),
        },
      },
      description: "Retrieve all projects",
    },
  },
});

/**
 * GET /api/projects
 * Retrieves a list of all projects.
 */
projectsApp.openapi(getProjectsRoute, async (c) => {
  Logger.info(c.env.DB, c.executionCtx, "api/projects", "Fetching all projects");
  const db = drizzle(c.env.DB);
  const allProjects = await db.select().from(projects).all();
  return c.json(allProjects, 200);
});

const createProjectRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertProjectSchema
            .pick({ name: true, github_repo_url: true, clickup_folder_id: true })
            .extend({
              google_doc_id: z.string(),
              doc_type: z.string().default("PRD"),
            }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ url: z.string() }),
        },
      },
      description: "Project created successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
      description: "Internal Server Error",
    },
  },
});

/**
 * POST /api/projects
 * Creates a new project and links the initial document.
 *
 * @param {Object} body JSON body.
 * @returns JSON containing the newly created project URL.
 */
projectsApp.openapi(createProjectRoute, async (c) => {
  Logger.info(c.env.DB, c.executionCtx, "api/projects", "Creating new project");
  const db = drizzle(c.env.DB);
  const { name, github_repo_url, clickup_folder_id, google_doc_id, doc_type } = c.req.valid("json");
  const projectId = crypto.randomUUID();

  try {
    await db
      .insert(projects)
      .values({
        id: projectId,
        name,
        github_repo_url,
        clickup_folder_id,
      })
      .run();

    await db
      .insert(documents)
      .values({
        id: crypto.randomUUID(),
        project_id: projectId,
        google_doc_id,
        doc_type,
        version_number: 1,
      })
      .run();

    Logger.info(
      c.env.DB,
      c.executionCtx,
      "api/projects",
      `Successfully created project ${projectId}`,
    );
    return c.json({ url: `/projects/${projectId}` }, 200);
  } catch (error: any) {
    Logger.error(c.env.DB, c.executionCtx, "api/projects", "Failed to create project", {
      error: error.message,
    });
    return c.json({ error: "Failed to create project" }, 500);
  }
});

export default projectsApp;
