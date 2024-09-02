
import { Database } from "bun:sqlite";

export const db = new Database("hono-htmx.sqlite3");