import { ref, reactive, watch, computed } from 'vue';
import { useWallStore } from '../../data/stores/wallStore';
import { confessionApiRepository } from '../../data/repositories/ConfessionApiRepository';

export function useAdmin() {
  const wallStore = useWallStore();
  const adminToken = ref(localStorage.getItem('adminToken') ?? '');
  const adminState = reactive({
    valid: false,
    checking: false,
    error: '',
  });

  const isAdmin = computed(() => adminState.valid);

  let verifyTimer: ReturnType<typeof setTimeout> | null = null;
  let verifyRequestId = 0;

  const verifyAdminToken = async () => {
    const token = adminToken.value.trim();
    const requestId = ++verifyRequestId;

    if (!token) {
      if (verifyTimer) {
        clearTimeout(verifyTimer);
        verifyTimer = null;
      }
      if (requestId === verifyRequestId) {
        adminState.valid = false;
        adminState.error = '';
        adminState.checking = false;
        localStorage.removeItem('adminToken');
        if (wallStore.status !== 'APPROVED') {
            wallStore.status = 'APPROVED';
            wallStore.refresh();
        }
      }
      return;
    }

    adminState.checking = true;
    adminState.error = '';
    try {
      await confessionApiRepository.verifyAdmin(token);
      if (requestId === verifyRequestId) {
        adminState.valid = true;
        adminState.error = '';
        localStorage.setItem('adminToken', token);
      }
    } catch (err) {
      if (requestId === verifyRequestId) {
        adminState.valid = false;
        adminState.error = 'Token salah atau tidak sah.';
        localStorage.removeItem('adminToken');
        if (wallStore.status !== 'APPROVED') {
            wallStore.status = 'APPROVED';
            wallStore.refresh();
        }
      }
    } finally {
      if (requestId === verifyRequestId) {
        adminState.checking = false;
      }
    }
  };

  watch(adminToken, () => {
    if (verifyTimer) clearTimeout(verifyTimer);
    verifyTimer = setTimeout(verifyAdminToken, 400);
  }, { immediate: true });

  function requireAdmin() {
    if (!adminState.valid) {
      alert(adminState.error || 'Masukkan token admin yang benar.');
      return false;
    }
    return true;
  }

  return {
    adminToken,
    adminState,
    isAdmin,
    requireAdmin,
  };
}
