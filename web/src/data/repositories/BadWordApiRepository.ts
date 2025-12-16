const API_URL = import.meta.env.VITE_API_URL || "/api";

class BadWordApiRepository {
  async getAll(token: string) {
    const res = await fetch(`${API_URL}/admin/bad-words`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch bad words");
    return res.json();
  }

  async add(word: string, token: string) {
    const res = await fetch(`${API_URL}/admin/bad-words`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ word }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add bad word");
    }
    return res.json();
  }

  async update(id: number, word: string, token: string) {
    const res = await fetch(`${API_URL}/admin/bad-words/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ word }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update bad word");
    }
  }

  async remove(id: number, token: string) {
    const res = await fetch(`${API_URL}/admin/bad-words/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete bad word");
    }
  }
}

export const badWordApiRepository = new BadWordApiRepository();
