<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Manage Confessions</h1>
    
    <!-- Filters -->
    <div class="flex gap-4 mb-8 border-b border-white/10 pb-4">
      <BaseButton @click="setStatus('PENDING')" :variant="wall.status === 'PENDING' ? 'solid' : 'outline'" theme="dark">
        Pending ({{ counts.pending }})
      </BaseButton>
      <BaseButton @click="setStatus('APPROVED')" :variant="wall.status === 'APPROVED' ? 'solid' : 'outline'" theme="dark">
        Approved ({{ counts.approved }})
      </BaseButton>
      <BaseButton @click="setStatus('REJECTED')" :variant="wall.status === 'REJECTED' ? 'solid' : 'outline'" theme="dark">
        Rejected ({{ counts.rejected }})
      </BaseButton>
    </div>

    <div v-if="wall.loading && !wall.items.length" class="text-center py-10">Loading...</div>
    <div v-else-if="wall.items.length === 0" class="text-center py-10 text-gray-500">No confessions found for this status.</div>

    <div v-else class="space-y-4">
      <ConfessionCard
        v-for="item in wall.items"
        :key="item.id"
        :item="item"
        :is-admin="true"
        theme="dark"
        @approve="approve(item.id)"
        @reject="reject(item.id)"
        @remove="remove(item.id)"
        @vote="() => {}"
      />
    </div>

    <!-- Pagination -->
     <div v-if="wall.hasMore" class="pt-8 text-center">
        <BaseButton @click="wall.loadMore()" :disabled="wall.loading" theme="dark">
            {{ wall.loading ? "Loading..." : "Load More" }}
        </BaseButton>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, onUnmounted } from 'vue';
import { useWallStore } from '../../../data/stores/wallStore';
import { useAuthStore } from '../../../data/stores/authStore';
import { confessionApiRepository } from '../../../data/repositories/ConfessionApiRepository';
import ConfessionCard from '../../organisms/ConfessionCard.vue';
import BaseButton from '../../atoms/BaseButton.vue';

const wall = useWallStore();
const auth = useAuthStore();
const counts = reactive({ pending: 0, approved: 0, rejected: 0 });

const setStatus = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
  wall.setStatus(status);
};

const fetchCounts = async () => {
    // This is a bit inefficient, but good enough for an admin dashboard
    const [p, a, r] = await Promise.all([
        confessionApiRepository.list({ status: 'PENDING', limit: 1 }),
        confessionApiRepository.list({ status: 'APPROVED', limit: 1 }),
        confessionApiRepository.list({ status: 'REJECTED', limit: 1 }),
    ]);
    counts.pending = p.total;
    counts.approved = a.total;
    counts.rejected = r.total;
};

// Refetch confessions when component is mounted
onMounted(() => {
  // Set initial status to PENDING for admin view, and then fetch
  wall.setStatus('PENDING');
  fetchCounts();
});

// Admin actions
const approve = async (id: number) => {
    if (!auth.token) return;
    await confessionApiRepository.approve(id, auth.token);
    wall.refresh();
    fetchCounts();
};
const reject = async (id: number) => {
    if (!auth.token) return;
    await confessionApiRepository.reject(id, auth.token);
    wall.refresh();
    fetchCounts();
};
const remove = async (id: number) => {
    if (!auth.token || !confirm('Are you sure?')) return;
    await confessionApiRepository.remove(id, auth.token);
    wall.refresh();
    fetchCounts();
};

</script>