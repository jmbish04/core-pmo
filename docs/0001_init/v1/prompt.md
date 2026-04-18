# Vibe Coding Orchestrator (Colby PMO) - Master Implementation Prompt

Copy and paste the following prompt to your coding agent to implement the hybrid Cloudflare Worker + Astro + Google Apps Script architecture based on your `core-pmo` template and the legacy `pmo` features.

***

**Role:** You are an elite Senior Systems Architect and Cloudflare Ecosystem Expert. Your task is to build the "Vibe Coding Orchestrator" (Colby PMO)—a hybrid system consisting of a Cloudflare Worker (running an Astro + React + Shadcn frontend via Worker Static Assets, Hono API, Drizzle/D1, and Agents SDK) and a Google Apps Script (GAS) Google Docs Add-on.

**Context & Baseline:**
You are operating within the `core-pmo` template structure. The Cloudflare Worker is the absolute source of truth and heavy-compute engine. Google Apps Script is strictly a thin client / OAuth broker providing a Sidebar UI inside Google Docs to seamlessly bridge planning artifacts with the Cloudflare backend.

### Part 1: Database & Core API (Cloudflare Worker)
**1. D1 Database Schema (Drizzle ORM)**
Extend the `core-pmo` schema to handle the legacy `pmo` logic and new orchestration requirements:
* `projects`: `id`, `name`, `github_repo_url`, `clickup_folder_id`, `created_at`.
* `documents`: Mapping table for Google Docs. `id`, `project_id` (FK), `google_doc_id` (unique), `doc_type` (e.g., 'PRD', 'UX_RESEARCH'), `version_number`, `created_at`.
* `tasks`: Syncs from `project_tasks.json`. `id`, `project_id` (FK), `external_task_id` (ClickUp/Linear ID), `title`, `description`, `status`, `agent_assignee`.
* `jules_sessions`: `id`, `project_id`, `jules_api_session_id`, `prompt`, `status`, `created_at`.

**2. Hono API Routes (`@hono/zod-openapi`)**
Implement secure REST endpoints in `src/backend/api/` for the GAS Add-on to consume:
* `GET /api/docs/:google_doc_id/project`: Looks up the doc. Returns the associated project, or 404.
* `GET /api/projects`: Lists existing orchestration projects.
* `POST /api/projects`: Creates a new project, maps the provided `google_doc_id` as v1, and returns the Worker frontend URL for the project.
* `POST /api/docs/link`: Associates an existing project with a `google_doc_id`, auto-incrementing the version number based on existing mapped docs for that project.
* `POST /api/repo/create`: Accepts a repo name. Uses the Github API to clone `jmbish04/core-template-cfw-assets-astro-shadcn`, update `wrangler.jsonc` with the new name, and returns the repo URL.
* `POST /api/analyze`: Accepts doc content. Triggers the internal `DocAnalysisAgent` workflow.

### Part 2: Google Apps Script Add-on (Sidebar UI)
**1. Setup & Deployment**
* Create a `/gas-addon/` directory in the repository.
* Configure clasp (`.clasp.json`) and a GitHub Action workflow to deploy this add-on automatically on push to the `main` branch.
* The Add-on must use `HtmlService` to render a React/Tailwind sidebar (bundled via Vite) or clean vanilla JS matching Shadcn aesthetics.

**2. Sidebar Features & Workflow**
* **Initialization:** `onOpen` creates the "Colby PMO" menu. Clicking it opens the Sidebar.
* **Doc Detection:** On load, fetches `GET /api/docs/:google_doc_id/project`.
    * *If Not Found:* Displays a welcome banner. Shows "Create New Project" (prompts for name, calls `POST /api/projects`) and "Link to Existing Project" (calls `GET /api/projects`, user selects, calls `POST /api/docs/link`).
    * *If Found:* Displays project details, task queues, and active Jules sessions.
* **AI Analysis Integration:** Button to "Analyze PRD". Calls `POST /api/analyze`. The Worker evaluates the PRD against Cloudflare/Github constraints. The GAS script uses `DocumentApp` to append the returned analysis as a new Section/Tab in the Doc, and utilizes the Google Docs API to insert specific `suggestions` (suggested edits) for the user to approve/reject.
* **Repository Scaffolding:** Button to "Provision Github Repo". Prompts for name, triggers the Worker API to clone the template.
* **Sidebar Chat:** A lightweight chat interface communicating with the Worker's `CloudflareAgent` for quick PRD Q&A.

### Part 3: AI Agents & Jules Orchestration (Workers Backend)
Utilize the `@cloudflare/agents` SDK and Cloudflare AI Gateway.
* **CloudflareAgent (`AIChatAgent`):**
    * Serves the frontend `assistant-ui` chat interface.
    * **MCP Integration:** Connects to the `cloudflare-docs` MCP server.
    * **Capabilities:** Acts as a Cloudflare expert. Can execute tools to provision Cloudflare bindings (D1, KV) via the Cloudflare API, update the associated repo's `wrangler.jsonc`, and draft the final `project_tasks.json`.
* **Task Sync Logic:**
    * Port the `clickup.ts` logic from the legacy `pmo` repo. When `project_tasks.json` is finalized by the `CloudflareAgent`, the Worker parses it, inserts rows into the D1 `tasks` table, and syncs them to ClickUp (or Linear) via their respective APIs.
* **JulesOversightAgent (`Agent` or `AIChatAgent`):**
    * Manages the backend Jules execution session.
    * Takes the finalized PRD and tasks, opens a session with the Jules API (routing through AI Gateway for observability).
    * Stores the `jules_session_id` in D1.
    * Subscribes to the Jules API events and relays them via WebSocket to the frontend `assistant-ui` interface, allowing the user to provide Human-in-the-Loop (HITL) feedback or corrections directly to Jules via the Cloudflare Agent proxy.

### Part 4: Frontend (Astro + React + assistant-ui + Shadcn)
Built within `src/frontend/` and served via Cloudflare Worker Static Assets.
* **Project Dashboard (`/projects/[id]`):**
    * Displays ClickUp/Linear task sync status.
    * Displays active Jules orchestration sessions.
* **Chat Interface (`/projects/[id]/orchestrate`):**
    * Implement the `@assistant-ui/react` Thread component.
    * Connect it to the `CloudflareAgent` using `@cloudflare/ai-chat`'s `useAgentChat` hook.
    * Include buttons to easily paste Gemini artifacts or trigger the `CloudflareAgent` to pull directly from the linked Google Doc via the mapping table.

### Strict Execution Requirements:
1.  **Full Code Output:** You must provide all files in their entirety. No `// ... rest of code` placeholders.
2.  **Astro + Cloudflare Assets:** Respect the `core-pmo` routing where Astro builds to `dist/` and the Worker `_worker.ts` or `src/backend/api/index.ts` intercepts `/api/*` and WebSocket upgrades, falling back to ASSETS for static files.
3.  **Drizzle ORM:** Use strict SQLite dialects for D1.
4.  **End with the Antigravity Plan.**

***

### Antigravity Implementation Plan

```markdown
# .agent/workflows/implement-feature.md

## Phase 1: D1 & Drizzle Schema Expansion
1. Update `src/backend/db/schema.ts` with `projects`, `documents`, `tasks`, and `jules_sessions` tables.
2. Generate migrations (`drizzle-kit generate`) and provide the raw `.sql` outputs.
3. Create TypeScript interfaces for the ClickUp/Linear API payloads.

## Phase 2: Hono API & Task Sync Core
1. Implement `src/backend/api/routes/projects.ts` and `src/backend/api/routes/documents.ts` with strict `@hono/zod-openapi` validation.
2. Port the legacy `pmo` clickup sync logic into `src/backend/services/task-sync.ts`.
3. Implement `src/backend/api/routes/github.ts` to handle the template repo cloning and `wrangler.jsonc` patching.

## Phase 3: Cloudflare Agents & Jules Orchestration
1. Create `src/backend/agents/CloudflareAgent.ts` extending `AIChatAgent`. Implement `onChatMessage`, register the `cloudflare-docs` MCP client, and define tools for `wrangler.jsonc` modification.
2. Create `src/backend/agents/DocAnalysisAgent.ts` extending `AgentWorkflow` or `Agent` to process large PRD payloads and return structured JSON suggestions.
3. Create `src/backend/agents/JulesOversightAgent.ts` extending `AIChatAgent`. Implement API wrappers for `https://jules.googleapis.com/v1alpha/sessions` and wire the WebSocket streams for the frontend.

## Phase 4: Astro Frontend & assistant-ui
1. Create Astro pages for the dashboard (`src/frontend/pages/projects/[id].astro`).
2. Build the React `assistant-ui` components (`src/frontend/components/chat/Thread.tsx`) wired to the `CloudflareAgent` WebSocket.
3. Ensure Shadcn UI dark theme defaults are strictly enforced in `globals.css`.

## Phase 5: Google Apps Script Add-on
1. Create `gas-addon/Code.gs` containing `onOpen`, sidebar initialization, and `UrlFetchApp` wrappers for the Worker API.
2. Create `gas-addon/Sidebar.html` (containing inline React/Tailwind or standard JS UI) to display the project linking logic, repo creation buttons, and analysis triggers.
3. Create `.github/workflows/deploy-gas.yml` utilizing `clasp push` for automated deployment.
```

```markdown
# .agent/rules/pmo-architecture.md

- **State Management:** D1 is the absolute source of truth. Google Docs is the canvas, ClickUp/Linear is the mirror.
- **Worker Supremacy:** Apps Script must contain ZERO heavy logic or LLM calls. It strictly passes the `google_doc_id` and text payloads to the Worker's Hono API and receives structured commands on what Google Docs API methods to execute (e.g., insert suggestion, append tab).
- **Agent Chat:** Always use `@cloudflare/ai-chat` for the frontend hooks and `@assistant-ui/react` for the UI components. Never use Vercel AI SDK due to Cloudflare compatibility issues.
- **Jules Integration:** All Jules API requests must pass through Cloudflare AI Gateway (`https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/jules/...`) for observability and logging.
```
