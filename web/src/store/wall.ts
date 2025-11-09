import { reactive } from 'vue';
import { api } from '../lib/api';

function upsert(list:any[], item:any) {
  const idx = list.findIndex((x:any) => x.id === item.id);
  if (idx >= 0) list[idx] = item; else list.unshift(item);
}

export const wall = reactive({
  items: [] as any[],
  q: "",
  status: "APPROVED",
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  ws: null as WebSocket | null,
  async refresh() {
    this.page = 1;
    this.items = [];
    await this.loadMore();
  },
  async loadMore() {
    if (this.loading) return;
    this.loading = true;
    try {
      const res = await api.list({ q: this.q, page: this.page, limit: this.limit, status: this.status });
      if (res?.items?.length) this.items.push(...res.items);
      this.total = res?.total || 0;
      this.page += 1;
    } finally {
      this.loading = false;
    }
  },
  get hasMore() {
    return this.items.length < this.total;
  },
  connectWS() {
    if (this.ws) return;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    this.ws = new WebSocket(`${proto}://${location.host.replace(/:\d+$/, ':8080')}/ws`);
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'created' && this.status === (msg.item?.status || 'APPROVED')) upsert(this.items, msg.item);
        if (msg.type === 'voted') upsert(this.items, msg.item);
        if (msg.type === 'approved' && this.status === 'APPROVED') upsert(this.items, msg.item);
        if (msg.type === 'rejected' || msg.type === 'deleted') {
          const id = msg.id || msg.item?.id;
          const idx = this.items.findIndex(x => x.id === id);
          if (idx >= 0) this.items.splice(idx, 1);
        }
      } catch {}
    };
  }
});
