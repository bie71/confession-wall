// Simple WebSocket registry for Bun
export const sockets = new Set<WebSocket<any>>();

export function broadcast(data: any) {
  const msg = JSON.stringify(data);
  for (const s of sockets) {
    try { s.send(msg); } catch {}
  }
}
