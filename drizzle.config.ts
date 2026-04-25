import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/backend/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // In v1.0.0+, 'dialect: sqlite' is sufficient for generating D1-compatible SQL files.
  // We avoid specifying 'driver' to keep the local generation process decoupled 
  // from remote HTTP credentials, as wrangler handles the application phase.
});
