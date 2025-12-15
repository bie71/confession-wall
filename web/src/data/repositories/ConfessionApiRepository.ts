import type { Confession, ConfessionStatus } from "../../domain/models/Confession";
import { useAuthStore } from "../stores/authStore";

export interface PaginatedConfessions {
  items: Confession[];
  total: number;
  page: number;
  limit: number;
}

export class ConfessionApiRepository {
  private _getAuthHeaders() {
    const authStore = useAuthStore();
    if (authStore.token) {
      return { 'Authorization': `Bearer ${authStore.token}` };
    }
    return {};
  }

  async list(params: { q?: string; page?: number; limit?: number; status?: ConfessionStatus }): Promise<PaginatedConfessions> {
    const u = new URL('/api/confessions', location.origin);
    if (params.q) u.searchParams.set('q', params.q);
    if (params.page) u.searchParams.set('page', String(params.page));
    if (params.limit) u.searchParams.set('limit', String(params.limit));
    if (params.status) u.searchParams.set('status', params.status);
    
    const r = await fetch(u.toString());
    if (!r.ok) throw new Error('Failed to fetch confessions');
    return r.json();
  }

  exportUrl(params: { q?: string; status?: string }): string {
    const u = new URL('/api/admin/confessions/export.csv', location.origin);
    if (params.q) u.searchParams.set('q', params.q);
    if (params.status) u.searchParams.set('status', params.status);
    return u.toString();
  }

  async create(payload: { name?: string; message: string; website?: string }): Promise<Confession> {
    const r = await fetch('/api/confessions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...this._getAuthHeaders(),
      },
      body: JSON.stringify(payload)
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || 'Failed to create confession');
    return res;
  }

  async vote(id: number, value: 1 | -1): Promise<Confession> {
    const r = await fetch(`/api/confessions/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || 'Failed to vote');
    return res;
  }

  async remove(id: number): Promise<boolean> {
    const r = await fetch(`/api/admin/confessions/${id}`, {
      method: 'DELETE',
      headers: this._getAuthHeaders()
    });
    return r.ok;
  }

  async approve(id: number): Promise<Confession> {
    const r = await fetch(`/api/admin/confessions/${id}/approve`, {
      method: 'POST',
      headers: this._getAuthHeaders()
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || 'Failed to approve');
    return res;
  }

  async reject(id: number): Promise<Confession> {
    const r = await fetch(`/api/admin/confessions/${id}/reject`, {
      method: 'POST',
      headers: this._getAuthHeaders()
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || 'Failed to reject');
    return res;
  }
}

// Export a singleton instance
export const confessionApiRepository = new ConfessionApiRepository();
