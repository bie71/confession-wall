import { Hono } from "hono";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { broadcast } from "./ws";

const app = new Hono();
app.use("*", cors());

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "devadmin";

console.log(`Admin token: ${ADMIN_TOKEN}`);


// naive bad-words list (demo)
const BAD_WORDS = ["bangsat","anjing","goblok"];

// helper: hash IP (naive, demo)
function ipHash(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

// helper: CSV escape
function toCSV(rows: any[]) {
  const headers = ["id","name","message","likes","dislikes","created_at","status"];
  const esc = (v: any) => {
    const s = (v ?? "").toString().replace(/"/g,'""');
    return `"${s}"`;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}

app.get("/health", (c) => c.json({ ok: true }));

// LIST + search + pagination + status filter
app.get("/api/confessions", async (c) => {
  const url = new URL(c.req.url);
  const q = url.searchParams.get("q")?.trim();
  const status = (url.searchParams.get("status") || "APPROVED").toUpperCase();
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "10")));
  const offset = (page - 1) * limit;

  const params:any[] = [];
  const wh: string[] = [];
  if (q) { wh.push("(message LIKE ? OR IFNULL(name,'') LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  if (status) { wh.push("status = ?"); params.push(status); }
  const where = wh.length ? ("WHERE " + wh.join(" AND ")) : "";

  const cnt = await db.execute({ sql: `SELECT COUNT(*) as c FROM confessions ${where}`, params });
  const total = Number(cnt.rows?.[0]?.c || 0);

  const rows = await db.execute({
    sql: `SELECT * FROM confessions ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    params: [...params, limit, offset],
  });

  return c.json({ items: rows.rows ?? [], total, page, limit });
});

// CSV export (respect q & status)
app.get("/api/confessions/export.csv", async (c) => {
  const url = new URL(c.req.url);
  const q = url.searchParams.get("q")?.trim();
  const status = (url.searchParams.get("status") || "APPROVED").toUpperCase();

  const params:any[] = [];
  const wh: string[] = [];
  if (q) { wh.push("(message LIKE ? OR IFNULL(name,'') LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  if (status) { wh.push("status = ?"); params.push(status); }
  const where = wh.length ? ("WHERE " + wh.join(" AND ")) : "";

  const rows = await db.execute({ sql: `SELECT id, name, message, likes, dislikes, created_at, status FROM confessions ${where} ORDER BY created_at DESC, id DESC`, params });
  const csv = toCSV(rows.rows ?? []);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="confessions_${status.toLowerCase()}.csv"`
    }
  });
});

// CREATE (honeypot + bad-words + moderation)
app.post("/api/confessions", async (c) => {
  const body = await c.req.json();
  const name = (body.name ?? "").toString().slice(0, 40);
  const message = (body.message ?? "").toString().slice(0, 500);
  const website = (body.website ?? "").toString(); // honeypot, must stay empty

  if (website) return c.json({ error: "Spam detected" }, 400);
  if (!message || message.length < 3) return c.json({ error: "Message too short" }, 400);
  const lower = message.toLowerCase();
  if (BAD_WORDS.some(w => lower.includes(w))) return c.json({ error: "Message contains prohibited words" }, 400);

  const hash = ipHash(c.req.raw);
  const hasLink = /https?:\/\/|www\.|@/.test(message);
  const status = hasLink ? "PENDING" : "APPROVED";

  const res = await db.insert(schema.confessions).values({
    name: name || null, message, ipHash: hash, status
  }).returning().get();

  broadcast({ type: "created", item: res });
  return c.json(res, 201);
});

// LIKE / DISLIKE
app.post("/api/confessions/:id/vote", async (c) => {
  const id = Number(c.req.param("id"));
  const { value } = await c.req.json(); // +1 or -1
  if (![1, -1].includes(value)) return c.json({ error: "Invalid value" }, 400);

  const hash = ipHash(c.req.raw);
  const already = await db.select().from(schema.votes)
    .where(and(eq(schema.votes.confessionId, id), eq(schema.votes.ipHash, hash))).get();

  if (already) return c.json({ error: "You already voted" }, 409);

  await db.insert(schema.votes).values({ confessionId: id, ipHash: hash, value }).run();
  if (value === 1) {
    await db.execute({ sql: `UPDATE confessions SET likes = likes + 1 WHERE id = ?`, params: [id] });
  } else {
    await db.execute({ sql: `UPDATE confessions SET dislikes = dislikes + 1 WHERE id = ?`, params: [id] });
  }
  const row = await db.execute({ sql: `SELECT * FROM confessions WHERE id = ?`, params: [id] });
  const item = row.rows?.[0] ?? null;
  broadcast({ type: "voted", item });
  return c.json(item);
});

// Approve / Reject (admin)
app.post("/api/confessions/:id/approve", bearerAuth({ token: ADMIN_TOKEN }), async (c) => {
  const id = Number(c.req.param("id"));
  await db.execute({ sql: `UPDATE confessions SET status='APPROVED' WHERE id = ?`, params: [id] });
  const row = await db.execute({ sql: `SELECT * FROM confessions WHERE id = ?`, params: [id] });
  const item = row.rows?.[0] ?? null;
  broadcast({ type: "approved", item });
  return c.json(item);
});

app.post("/api/confessions/:id/reject", bearerAuth({ token: ADMIN_TOKEN }), async (c) => {
  const id = Number(c.req.param("id"));
  await db.execute({ sql: `UPDATE confessions SET status='REJECTED' WHERE id = ?`, params: [id] });
  const row = await db.execute({ sql: `SELECT * FROM confessions WHERE id = ?`, params: [id] });
  const item = row.rows?.[0] ?? null;
  broadcast({ type: "rejected", item });
  return c.json(item);
});

app.get("/api/admin/verify", bearerAuth({ token: ADMIN_TOKEN }), (c) => {
  return c.json({ ok: true });
});

// DELETE (admin)
app.delete(
  "/api/confessions/:id",
  bearerAuth({ token: ADMIN_TOKEN }),
  async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.votes).where(eq(schema.votes.confessionId, id)).run();
    await db.delete(schema.confessions).where(eq(schema.confessions.id, id)).run();
    broadcast({ type: "deleted", id });
    return c.body(null, 204);
  }
);

export default app;
