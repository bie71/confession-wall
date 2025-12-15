export class AuthApiRepository {
  async login(credentials: any) {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || 'Login failed');
    return res;
  }

  async register(data: any) {
    const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || 'Registration failed');
    return res;
  }
}

export const authApiRepository = new AuthApiRepository();
