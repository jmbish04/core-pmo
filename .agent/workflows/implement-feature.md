# Antigravity Implementation Plan

**Phase 1: Database & Core Foundation**

1. Initialize Cloudflare D1 database and apply schema (`src/backend/db/schema.ts`).
2. Deploy the Hono API Worker to handle CRUD for projects and documents.
3. Validate API interactions (e.g. `GET /api/projects`, `POST /api/projects`).

**Phase 2: Google Apps Script Thin Client**

1. Setup Google Apps Script project.
2. Push `Code.gs` and `Sidebar.html` using the configured GitHub Actions workflow (`.github/workflows/gas-deploy.yml`).
3. Test Sidebar loading, document ID retrieval, and API integration.

**Phase 3: AI Agents Integration**

1. Implement and deploy `CloudflareAgent`, `DocAnalysisAgent`, and `JulesOversightAgent` within the Worker architecture.
2. Ensure `DocAnalysisAgent` handles payload properly and integrates with AI Gateway.
3. Verify MCP capabilities (if applicable) for Cloudflare docs retrieval.

**Phase 4: Frontend UI Assembly (Astro + React Islands)**

1. Construct the Astro landing page (`/`) fetching projects via the Worker API.
2. Build the project dashboard (`/projects/[id]`) highlighting linked docs and tasks.
3. Implement the orchestration view (`/projects/[id]/orchestrate`) combining markdown parsing and the `@assistant-ui/react` chat component connected via WebSockets/API to the Worker Agents.

**Phase 5: System Verification**

1. Test end-to-end: Create project -> Link Doc -> Type in Doc -> Hit "Analyze" in sidebar -> Receive analysis -> Check D1 state -> Verify frontend updates.
