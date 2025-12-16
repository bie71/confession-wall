import { defineStore } from "pinia";
import { ref } from "vue";
import { userAdminApiRepository } from "../repositories/UserAdminApiRepository";
import { useAuthStore } from "./authStore";

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
}

export const useUserAdminStore = defineStore("user-admin", () => {
    const users = ref<User[]>([]);
    const total = ref(0);
    const page = ref(1);
    const limit = ref(10);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const auth = useAuthStore();

    async function fetchUsers() {
        if (!auth.token) return;
        loading.value = true;
        error.value = null;
        try {
            const data = await userAdminApiRepository.getAll(auth.token, page.value, limit.value);
            users.value = data.items;
            total.value = data.total;
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }
    
    async function updateUserRole(id: number, role: 'user' | 'admin') {
        if (!auth.token) return;
        try {
            await userAdminApiRepository.update(id, { role }, auth.token);
            const index = users.value.findIndex(u => u.id === id);
            if (index !== -1) {
                users.value[index].role = role;
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        }
    }

    async function deleteUser(id: number) {
        if (!auth.token) return;
        try {
            await userAdminApiRepository.remove(id, auth.token);
            users.value = users.value.filter(u => u.id !== id);
            total.value--;
        } catch (e: any) {
            error.value = e.message;
            throw e;
        }
    }

    return { users, total, page, limit, loading, error, fetchUsers, updateUserRole, deleteUser };
});
