import { Hono } from "hono";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import crypto from "crypto";
import * as useCases from "../container";
import { ConfessionStatus } from "../../domain/entities/Confession";
import { loggerMiddleware } from "../middleware/logger";
import logger from "../../infrastructure/logger";

const app = new Hono();
app.use('*', loggerMiddleware());
app.use("*", cors());

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "devadmin";
logger.info(`Admin token configured: ${ADMIN_TOKEN.slice(0, 4)}...`);

// --- Helper Functions ---
function ipHash(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function toCSV(rows: any[]) {
  const headers = ["id", "name", "message", "likes", "dislikes", "createdAt", "status"];
  const esc = (v: any) => {
    const s = (v ?? "").toString().replace(/"/g, '""');
    return `"${s}"`;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join("\n");
}

// --- Routes ---
app.get("/health", (c) => c.json({ ok: true }));

app.get("/api/confessions", async (c) => {
  const log = c.get('logger');
  try {
    const url = new URL(c.req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.toUpperCase() as ConfessionStatus;
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");
  
    const result = await useCases.listConfessions.execute({ query: q, status, page, limit });
    return c.json(result);
  } catch (error: any) {
    log.error({ err: error }, 'Failed to list confessions');
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

app.get("/api/confessions/export.csv", async (c) => {
  const log = c.get('logger');
  try {
    const url = new URL(c.req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.toUpperCase() as ConfessionStatus;
    
    const confessions = await useCases.exportConfessions.execute({ query: q, status });
    const csv = toCSV(confessions);
    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="confessions.csv"`
        }
    });
  } catch (error: any) {
    log.error({ err: error }, 'Failed to export confessions');
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

app.post("/api/confessions", async (c) => {
  const log = c.get('logger');
  try {
    const body = await c.req.json();
    const { name = "", message = "", website = "" } = body;

    if (website) return c.json({ error: "Spam detected" }, 400); // Honeypot

    const hash = ipHash(c.req.raw);
    const confession = await useCases.createConfession.execute({
      name: name.slice(0, 40),
      message: message.slice(0, 500),
      ipHash: hash,
    });
    return c.json(confession, 201);
  } catch (error: any) {
    log.warn({ err: error, body: c.req.body }, 'Failed to create confession');
    return c.json({ error: error.message }, 400);
  }
});

app.post("/api/confessions/:id/vote", async (c) => {
  const log = c.get('logger');
  try {
    const id = Number(c.req.param("id"));
    const { value } = await c.req.json();

    if (![1, -1].includes(value)) return c.json({ error: "Invalid value" }, 400);

    const hash = ipHash(c.req.raw);
    const confession = await useCases.voteOnConfession.execute({
      confessionId: id,
      value,
      ipHash: hash,
    });
    return c.json(confession);
  } catch (error: any) {
    if (error.message === "You already voted") {
      log.warn({ err: error }, 'Duplicate vote attempt');
      return c.json({ error: error.message }, 409);
    }
    log.error({ err: error }, 'Failed to vote on confession');
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// --- Admin Routes ---
const admin = new Hono();
admin.use("*", bearerAuth({ token: ADMIN_TOKEN }));

admin.get("/api/admin/verify", (c) => c.json({ verified: true }));

admin.post("/api/confessions/:id/approve", async (c) => {
  const log = c.get('logger');
  try {
    const id = Number(c.req.param("id"));
    const confession = await useCases.approveConfession.execute(id);
    return c.json(confession);
  } catch (error: any) {
    log.error({ err: error, confessionId: c.req.param("id") }, 'Failed to approve confession');
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

admin.post("/api/confessions/:id/reject", async (c) => {
  const log = c.get('logger');
  try {
    const id = Number(c.req.param("id"));
    const confession = await useCases.rejectConfession.execute(id);
    return c.json(confession);
  } catch (error: any) {
    log.error({ err: error, confessionId: c.req.param("id") }, 'Failed to reject confession');
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

admin.delete("/api/confessions/:id", async (c) => {
  const log = c.get('logger');
  try {
    const id = Number(c.req.param("id"));
    await useCases.deleteConfession.execute(id);
    return c.json({ success: true });
  } catch (error: any) {
    log.error({ err: error, confessionId: c.req.param("id") }, 'Failed to delete confession');
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

app.route("/", admin);

export default app;
