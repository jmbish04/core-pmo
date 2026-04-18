import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { projects, documents } from "../db/schema";

export type Bindings = {
  DB: D1Database;
  DocAnalysisAgent: AgentNamespace;
  CloudflareAgent: AgentNamespace;
  JulesOversightAgent: AgentNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// GET /api/docs/:google_doc_id/project
app.get("/api/docs/:google_doc_id/project", async (c) => {
  const db = drizzle(c.env.DB);
  const docId = c.req.param("google_doc_id");

  const doc = await db.select().from(documents).where(eq(documents.google_doc_id, docId)).get();
  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  const project = await db.select().from(projects).where(eq(projects.id, doc.project_id)).get();
  return c.json({ project, document: doc });
});

// GET /api/projects
app.get("/api/projects", async (c) => {
  const db = drizzle(c.env.DB);
  const allProjects = await db.select().from(projects).all();
  return c.json(allProjects);
});

// POST /api/projects
const createProjectSchema = z.object({
  name: z.string(),
  google_doc_id: z.string(),
  doc_type: z.string().default("PRD"),
});

app.post("/api/projects", zValidator("json", createProjectSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { name, google_doc_id, doc_type } = c.req.valid("json");
  const projectId = uuidv4();

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

  return c.json({ url: `/projects/${projectId}` });
});

// POST /api/docs/link
const linkDocSchema = z.object({
  project_id: z.string(),
  google_doc_id: z.string(),
  doc_type: z.string().default("PRD"),
});

app.post("/api/docs/link", zValidator("json", linkDocSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { project_id, google_doc_id, doc_type } = c.req.valid("json");

  // Find highest version
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

  return c.json({ success: true, version: nextVersion });
});

// POST /api/repo/create
const createRepoSchema = z.object({
  project_id: z.string(),
  github_token: z.string(),
});

app.post("/api/repo/create", zValidator("json", createRepoSchema), async (c) => {
  // In a real implementation this would call GitHub API to clone jmbish04/core-template-cfw-assets-astro-shadcn
  // and patch wrangler.jsonc.
  return c.json({ status: "queued", message: "Repo creation initiated" });
});

// POST /api/analyze
const analyzeSchema = z.object({
  document_content: z.string(),
});
app.post("/api/analyze", zValidator("json", analyzeSchema), async (c) => {
  // const { document_content } = c.req.valid("json");
  // Trigger DocAnalysisAgent workflow
  const workflowId = uuidv4();
  // Assuming AgentWorkflow syntax based on requirements
  // c.env.DocAnalysisAgent.create(...) // pseudo-code depending on exact SDK
  return c.json({ status: "analyzing", workflow_id: workflowId });
});

export default app;
