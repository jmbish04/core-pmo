/**
 * @fileoverview Universal logger service for the PMO Orchestrator.
 * Handles dual-output logging: console (for standard Worker tails) and asynchronous D1 database inserts.
 */

import { drizzle } from "drizzle-orm/d1";

import { system_logs } from "../db/schemas/logs/system_logs";

/**
 * Interface representing standard logging arguments.
 */
interface LogArgs {
  level: "info" | "warn" | "error";
  module: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Universal Logger Service instance.
 *
 * Provides static methods for standardized logging. Requires passing the D1 binding
 * and ExecutionContext to properly mirror logs into the system_logs table asynchronously
 * using `ctx.waitUntil`.
 */
export class Logger {
  /**
   * Internal logging handler. Outputs to console and D1.
   *
   * @param db D1Database binding instance.
   * @param ctx ExecutionContext for Cloudflare Workers.
   * @param args Log arguments containing level, module, message, and optional metadata.
   */
  private static log(db: D1Database | undefined, ctx: ExecutionContext | undefined, args: LogArgs) {
    const { level, module, message, metadata } = args;

    // Output to console
    const logMethod = console[level] || console.log;
    logMethod(
      `[${level.toUpperCase()}] [${module}] ${message}`,
      metadata ? JSON.stringify(metadata) : "",
    );

    // Dual output to D1 if DB and ctx are provided
    if (db && ctx) {
      try {
        const orm = drizzle(db);
        const insertPromise = orm
          .insert(system_logs)
          .values({
            id: crypto.randomUUID(),
            level,
            module,
            message,
            metadata: metadata ? JSON.stringify(metadata) : null,
          })
          .run()
          .catch((e) => console.error("Failed to insert log into DB:", e));

        ctx.waitUntil(insertPromise);
      } catch (error) {
        console.error("Logger D1 connection error:", error);
      }
    }
  }

  /**
   * Logs an informational message.
   *
   * @param db D1Database binding.
   * @param ctx ExecutionContext.
   * @param module Originating module name.
   * @param message Message content.
   * @param metadata Optional contextual data.
   */
  static info(
    db: D1Database | undefined,
    ctx: ExecutionContext | undefined,
    module: string,
    message: string,
    metadata?: any,
  ) {
    this.log(db, ctx, { level: "info", module, message, metadata });
  }

  /**
   * Logs a warning message.
   *
   * @param db D1Database binding.
   * @param ctx ExecutionContext.
   * @param module Originating module name.
   * @param message Message content.
   * @param metadata Optional contextual data.
   */
  static warn(
    db: D1Database | undefined,
    ctx: ExecutionContext | undefined,
    module: string,
    message: string,
    metadata?: any,
  ) {
    this.log(db, ctx, { level: "warn", module, message, metadata });
  }

  /**
   * Logs an error message.
   *
   * @param db D1Database binding.
   * @param ctx ExecutionContext.
   * @param module Originating module name.
   * @param message Message content.
   * @param metadata Optional contextual data.
   */
  static error(
    db: D1Database | undefined,
    ctx: ExecutionContext | undefined,
    module: string,
    message: string,
    metadata?: any,
  ) {
    this.log(db, ctx, { level: "error", module, message, metadata });
  }
}
