import { Hono } from "hono";
import { cors } from "hono/cors";
import crypto from "crypto";
import * as useCases from "../container";
import { ConfessionStatus } from "../../domain/entities/Confession";
import { loggerMiddleware } from "../middleware/logger";
import { adminAuthMiddleware, enrichAuthContext } from "../middleware/auth";
import badWordsAdmin from "./adminBadWords";
import usersAdmin from "./adminUsers";
import { BusinessError, TechnicalError } from "../../domain/errors/AppError";
import logger from "../../infrastructure/logger";

const app = new Hono();

// Register Error Handler
app.onError((err, c) => {
  if (err instanceof BusinessError) {
    c.status(400);
    return c.json({ error: err.message });
  }

  if (err instanceof TechnicalError) {
    logger.error(err.originalError ?? err, err.message);
    c.status(500);
    return c.json({ error: "An internal server error occurred." });
  }

  if (err instanceof Error) {
    logger.error(err, `An unexpected error occurred: ${err.message}`);
  } else {
    logger.error("An unexpected non-Error object was thrown", err);
  }
  
  c.status(500);
  return c.json({ error: "An internal server error occurred." });
});

// Register Middleware
app.use('*', loggerMiddleware());
app.use("*", cors());
app.use('*', enrichAuthContext()); // Make userId available if token exists

// --- Helper Functions ---
function ipHash(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function toCSV(rows: any[]) {
  const headers = ["id", "name", "message", "likes", "dislikes", "createdAt", "status", "userId"];
  const esc = (v: any) => {
    const s = (v ?? "").toString().replace(/"/g, '""');
    return `"${s}"`;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join("\n");
}

// --- Public Routes ---
app.get("/health", (c) => c.json({ ok: true }));

app.get("/api/confessions", async (c) => {
  const url = new URL(c.req.url);
  const q = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status")?.toUpperCase() as ConfessionStatus;
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "10");

  const result = await useCases.listConfessions.execute({ query: q, status, page, limit });
  return c.json(result);
});

app.post("/api/confessions", async (c) => {
  const body = await c.req.json();
  const { name = "", message = "", website = "" } = body;
  const userId = c.get('userId'); // Get from enrichAuthContext middleware

  if (website) return c.json({ error: "Spam detected" }, 400); // Honeypot

  const hash = ipHash(c.req.raw);
  const confession = await useCases.createConfession.execute({
    name: name.slice(0, 40),
    message: message.slice(0, 500),
    ipHash: hash,
    userId: userId, // Associate with user if logged in
  });
  return c.json(confession, 201);
});

app.post("/api/confessions/:id/vote", async (c) => {
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
});

// --- Auth Routes ---
const auth = new Hono();
auth.post('/register', async (c) => {
    const body = await c.req.json();
    const user = await useCases.registerUser.execute(body);
    return c.json(user, 201);
});

auth.post('/login', async (c) => {
    const body = await c.req.json();
    const result = await useCases.loginUser.execute(body);
    return c.json(result);
});
app.route("/api/auth", auth);


// --- Admin Routes ---
const admin = new Hono();
admin.use("*", adminAuthMiddleware()); // Protect all admin routes
admin.route("/", badWordsAdmin);
admin.route("/", usersAdmin);

admin.get("/verify", (c) => c.json({ verified: true })); // Simple endpoint to verify admin token

admin.get("/confessions/export.csv", async (c) => {
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
});

admin.post("/confessions/:id/approve", async (c) => {
  const id = Number(c.req.param("id"));
  const confession = await useCases.approveConfession.execute(id);
  return c.json(confession);
});

admin.post("/confessions/:id/reject", async (c) => {
  const id = Number(c.req.param("id"));
  const confession = await useCases.rejectConfession.execute(id);
  return c.json( confession);
});

admin.delete("/confessions/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await useCases.deleteConfession.execute(id);
  return c.json({ success: true });
});

app.route("/api/admin", admin);

export default app;
