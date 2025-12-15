import app from '../../presentation/routes';


import { sockets } from '../websocket';

const port = Number(process.env.PORT || 8080);

import logger from '../logger';

export function startServer() {
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
      open(ws) { 
        logger.info('WebSocket connection opened');
        sockets.add(ws); 
      },
      close(ws) { 
        logger.info('WebSocket connection closed');
        sockets.delete(ws); 
      },
      message(ws, msg) { /* no inbound handling */ }
    }
  });

  logger.info(`API listening on :${port}`);
  return server;
}
