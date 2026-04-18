/**
 * @fileoverview Main Hono API application entrypoint.
 * Mounts modular sub-routers and handles top-level configuration.
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { Logger } from "../lib/logger";
import docsApp from "./routes/documents";
import projectsApp from "./routes/projects";

export type Bindings = {
  DB: D1Database;
  DocAnalysisAgent: any; // Assuming AgentNamespace isn't globally available here
  CloudflareAgent: any;
  JulesOversightAgent: any;
};

const app = new Hono<{ Bindings: Bindings }>();

// Mount modular sub-routers
app.route("/api/projects", projectsApp);
app.route("/api/docs", docsApp);

/**
 * POST /api/analyze
 * Legacy/Standalone route for triggering document analysis.
 */
const analyzeSchema = z.object({
  document_content: z.string(),
});

app.post("/api/analyze", zValidator("json", analyzeSchema), async (c) => {
  Logger.info(c.env.DB, "api/analyze", "Triggered analysis agent");
  // const { document_content } = c.req.valid('json');
  const workflowId = uuidv4();
  // Simulate AI Gateway / Workflow call here
  return c.json({ status: "analyzing", workflow_id: workflowId });
});

/**
 * POST /api/repo/create
 * Legacy/Standalone route for triggering GitHub repo cloning.
 */
const createRepoSchema = z.object({
  project_id: z.string(),
  github_token: z.string(),
});

app.post("/api/repo/create", zValidator("json", createRepoSchema), async (c) => {
  Logger.info(c.env.DB, "api/repo", "Initiating repo creation");
  return c.json({ status: "queued", message: "Repo creation initiated" });
});

export default app;
