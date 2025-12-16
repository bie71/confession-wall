const API_URL = import.meta.env.VITE_API_URL || "/api";

class UserAdminApiRepository {
  async getAll(token: string, page: number, limit: number) {
    const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=${limit}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  }

  async update(id: number, data: { name?: string, email?: string, role?: string }, token: string) {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update user");
    }
  }

  async remove(id: number, token: string) {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete user");
    }
  }
}

export const userAdminApiRepository = new UserAdminApiRepository();
