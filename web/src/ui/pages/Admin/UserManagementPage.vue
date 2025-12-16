<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Manage Users</h1>
    
    <div v-if="store.loading && !store.users.length" class="text-center">Loading...</div>
    <div v-else-if="store.error" class="text-center text-red-400">Error: {{ store.error }}</div>
    
    <div v-else-if="store.users.length > 0">
      <div class="overflow-x-auto rounded-lg border border-white/10">
        <table class="w-full min-w-[600px] text-left">
          <thead class="border-b border-white/10 text-sm text-gray-300">
            <tr>
              <th class="p-4 font-semibold">ID</th>
              <th class="p-4 font-semibold">Name</th>
              <th class="p-4 font-semibold">Email</th>
              <th class="p-4 font-semibold">Role</th>
              <th class="p-4 font-semibold">Joined</th>
              <th class="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in store.users" :key="user.id" class="border-b border-white/10 last:border-b-0">
              <td class="p-4 font-mono text-sm">{{ user.id }}</td>
              <td class="p-4">{{ user.name }}</td>
              <td class="p-4">{{ user.email }}</td>
              <td class="p-4">
                <select 
                  :value="user.role" 
                  @change="updateRole(user.id, ($event.target as HTMLSelectElement).value as 'user' | 'admin')" 
                  class="bg-slate-800 rounded px-2 py-1 border border-white/10"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td class="p-4 text-sm">{{ new Date(user.createdAt).toLocaleDateString() }}</td>
              <td class="p-4">
                <BaseButton 
                  @click="handleDeleteUser(user.id)" 
                  variant="ghost" 
                  class="text-red-400 hover:bg-red-500/10" 
                  size="sm" 
                  theme="dark"
                  :disabled="isCurrentUser(user.id)"
                  title="Cannot delete your own account"
                >
                  Delete
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- TODO: Pagination controls -->
    </div>
     <div v-else class="mt-4 text-center text-gray-500">No users found.</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useUserAdminStore } from '../../../data/stores/userAdminStore';
import { useAuthStore } from '../../../data/stores/authStore';
import BaseButton from '../../atoms/BaseButton.vue';

const store = useUserAdminStore();
const authStore = useAuthStore();

const isCurrentUser = computed(() => (id: number) => authStore.user?.id === id);

onMounted(() => {
  store.fetchUsers();
});

const updateRole = async (id: number, role: 'user' | 'admin') => {
  if (isCurrentUser.value(id) && role !== 'admin') {
      alert("You cannot remove admin role from yourself.");
      // a bit janky, but re-fetches to revert the visual change in the select box
      store.fetchUsers(); 
      return;
  }
  try {
    await store.updateUserRole(id, role);
  } catch (e: any) {
    alert(`Failed to update role: ${e.message}`);
    store.fetchUsers();
  }
};

const handleDeleteUser = (id: number) => {
  if (isCurrentUser.value(id)) {
      alert("You cannot delete your own account.");
      return;
  }
  if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
    store.deleteUser(id);
  }
};
</script>