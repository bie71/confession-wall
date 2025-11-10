export const api = {
  async list(params?: { q?: string; page?: number; limit?: number; status?: string }) {
    const u = new URL('/api/confessions', location.origin);
    if (params?.q) u.searchParams.set('q', params.q);
    if (params?.page) u.searchParams.set('page', String(params.page));
    if (params?.limit) u.searchParams.set('limit', String(params.limit));
    if (params?.status) u.searchParams.set('status', params.status);
    const r = await fetch(u.toString());
    return r.json(); // { items, total, page, limit }
  },
  exportUrl(params?: { q?: string; status?: string }) {
    const u = new URL('/api/confessions/export.csv', location.origin);
    if (params?.q) u.searchParams.set('q', params.q);
    if (params?.status) u.searchParams.set('status', params.status);
    return u.toString();
  },
  async create(payload: { name?: string; message: string; website?: string }) {
    const r = await fetch('/api/confessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async vote(id:number, value:1|-1) {
    const r = await fetch(`/api/confessions/${id}/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    return r.json();
  },
  async remove(id:number, adminToken:string){
    const r = await fetch(`/api/confessions/${id}`, {
      method:'DELETE', headers:{ 'Authorization': `Bearer ${adminToken}` }
    });
    return r.ok;
  },
  async approve(id:number, adminToken:string){
    const r = await fetch(`/api/confessions/${id}/approve`, {
      method:'POST', headers:{ 'Authorization': `Bearer ${adminToken}` }
    });
    return r.json();
  },
  async reject(id:number, adminToken:string){
    const r = await fetch(`/api/confessions/${id}/reject`, {
      method:'POST', headers:{ 'Authorization': `Bearer ${adminToken}` }
    });
    return r.json();
  },
  async verifyAdmin(adminToken:string) {
    const r = await fetch(`/api/admin/verify`, {
      headers:{ 'Authorization': `Bearer ${adminToken}` }
    });
    if (!r.ok) throw new Error('Token invalid');
    return r.json();
  }
};
