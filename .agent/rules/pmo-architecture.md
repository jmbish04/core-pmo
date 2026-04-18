# PMO Architecture Rules

1.  **D1 is the Source of Truth:** All persistent state regarding projects, tasks, and document versions MUST reside in D1. Other systems (Docs, ClickUp) are clients/mirrors.
2.  **Worker API Supremacy:** Google Apps Script is strictly a presentation and bridging layer. All business logic, parsing, and heavy lifting happens in the Cloudflare Worker via the Hono API.
3.  **No Vercel AI SDK:** Avoid `@vercel/ai` due to edge compatibility quirks. Exclusively use `@cloudflare/ai-chat`'s `useAgentChat` hook and `@assistant-ui/react` for AI interfaces.
4.  **No Placeholders in Code:** Provide fully functional, end-to-end code ready for execution.
