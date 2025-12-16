import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { confessionApiRepository, PaginatedConfessions } from '../repositories/ConfessionApiRepository';
import type { Confession, ConfessionStatus } from '../../domain/models/Confession';

function upsert(list: Confession[], item: Confession) {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
}

export const useWallStore = defineStore('wall', () => {
  // --- State ---
  const items = ref<Confession[]>([]);
  const q = ref('');
  const status = ref<ConfessionStatus | undefined>('APPROVED');
  const page = ref(1);
  const limit = ref(10);
  const total = ref(0);
  const loading = ref(false); // For list loading
  const ws = ref<WebSocket | null>(null);

  // State for the submission form
  const submissionLoading = ref(false);
  const submissionError = ref<string | null>(null);
  const submissionSuccess = ref<string | null>(null);


  // --- Getters ---
  const hasMore = computed(() => items.value.length < total.value);
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
  const currentPage = computed(() => {
    if (!items.value.length) return 1;
    return Math.max(1, page.value - 1);
  });

  // --- Actions ---
  async function loadMore() {
    if (loading.value) return;
    loading.value = true;
    try {
      const res = await confessionApiRepository.list({ q: q.value, page: page.value, limit: limit.value, status: status.value });
      if (res?.items?.length) {
        items.value.push(...res.items);
        page.value += 1;
      }
      total.value = res?.total || 0;
    } catch (error) {
      console.error("Failed to load more confessions:", error);
    } finally {
      loading.value = false;
    }
  }

  async function refresh() {
    page.value = 1;
    items.value = [];
    total.value = 0;
    await loadMore();
  }
  
  function connectWS() {
    if (ws.value) return;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    // Use the correct port for the backend server during development
    const host = location.hostname === 'localhost' ? 'localhost:8080' : location.host;
    const wsUrl = `${proto}://${host}/ws`;

    ws.value = new WebSocket(wsUrl);
    ws.value.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'created' && status.value === (msg.item?.status || 'APPROVED')) {
            upsert(items.value, msg.item);
            total.value++;
        }
        if (msg.type === 'voted') upsert(items.value, msg.item);
        if (msg.type === 'approved' && status.value === 'APPROVED') upsert(items.value, msg.item);
        if (msg.type === 'rejected' || msg.type === 'deleted') {
          const id = msg.id || msg.item?.id;
          const idx = items.value.findIndex(x => x.id === id);
          if (idx >= 0) {
              items.value.splice(idx, 1);
              total.value--;
          }
        }
      } catch (e) {
        console.error("WS message error", e);
      }
    };
  }
  
  async function setStatus(newStatus: ConfessionStatus) {
    if (status.value === newStatus) return;
    status.value = newStatus;
    await refresh();
  }

  function clearSubmissionStatus() {
    submissionError.value = null;
    submissionSuccess.value = null;
  }

  async function createConfession(data: { name: string; message: string; website: string }) {
    submissionLoading.value = true;
    clearSubmissionStatus();
    try {
      const res = await confessionApiRepository.create(data);
      submissionSuccess.value = res.status === "PENDING" ? "Terkirim! Menunggu moderasi." : "Terkirim dan sudah tampil publik.";
      return true; // Indicate success
    } catch (err: any) {
      submissionError.value = err.message || "Gagal mengirim. Coba lagi ya.";
      return false; // Indicate failure
    } finally {
      submissionLoading.value = false;
    }
  }

  return {
    items,
    q,
    status,
    page,
    limit,
    total,
    loading,
    ws,
    submissionLoading,
    submissionError,
    submissionSuccess,
    hasMore,
    totalPages,
    currentPage,
    loadMore,
    refresh,
    connectWS,
    setStatus,
    createConfession,
    clearSubmissionStatus,
  };
});
