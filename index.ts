import app from "./src/server";
import { sockets } from "./src/ws";

const port = Number(process.env.PORT || 8080);

const server = Bun.serve({
  port,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === "/ws") {
      if (server.upgrade(req)) return new Response(); // handshake done
      return new Response("Upgrade failed", { status: 400 });
    }
    return app.fetch(req);
  },
  websocket: {
    open(ws) { sockets.add(ws); },
    close(ws) { sockets.delete(ws); },
    message(ws, msg) { /* no inbound handling */ }
  }
});

console.log(`API listening on :${port}`);
