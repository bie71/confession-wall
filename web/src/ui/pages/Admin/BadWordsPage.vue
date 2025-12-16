<template>
  <div>
      <h1 class="text-3xl font-bold mb-8">Manage Bad Words</h1>

      <!-- Add Word Form -->
      <form @submit.prevent="handleAddWord" class="mb-8 rounded-2xl border border-white/10 bg-white/[.05] p-6">
        <h2 class="text-xl font-semibold">Add New Word</h2>
        <div class="mt-4 flex gap-4">
          <BaseInput v-model="newWord" placeholder="Enter a new word..." class="flex-grow" theme="dark" />
          <BaseButton type="submit" :disabled="store.loading" theme="dark">
            {{ store.loading ? 'Adding...' : 'Add Word' }}
          </BaseButton>
        </div>
        <p v-if="addError" class="mt-2 text-red-400">{{ addError }}</p>
      </form>

      <!-- Word List -->
      <div>
        <h2 class="text-xl font-semibold">Existing Words ({{ store.words.length }})</h2>
        <div v-if="store.loading && !store.words.length" class="mt-4 text-center text-gray-400">Loading...</div>
        <div v-else-if="store.error && !store.words.length" class="mt-4 text-center text-red-400">
          Error: {{ store.error }}
        </div>
        <ul v-else-if="store.words.length > 0" class="mt-4 space-y-3">
          <li
            v-for="word in store.words"
            :key="word.id"
            class="flex items-center justify-between rounded-lg border border-white/10 bg-white/[.05] p-4"
          >
            <template v-if="editingWord?.id === word.id">
              <BaseInput v-model="editingWord.word" class="flex-grow" theme="dark" @keyup.enter="handleUpdateWord" @keyup.esc="cancelEdit" />
              <div class="flex gap-2 ml-4">
                <BaseButton @click="handleUpdateWord" :disabled="store.loading" size="sm" theme="dark">Save</BaseButton>
                <BaseButton @click="cancelEdit" variant="ghost" size="sm" theme="dark">Cancel</BaseButton>
              </div>
            </template>
            <template v-else>
              <span class="font-mono">{{ word.word }}</span>
              <div class="flex gap-2">
                <BaseButton @click="startEdit(word)" variant="ghost" size="sm" theme="dark">Edit</BaseButton>
                <BaseButton @click="handleDeleteWord(word.id)" :disabled="store.loading" variant="ghost" class="text-red-400 hover:bg-red-500/10" size="sm" theme="dark">
                  Delete
                </BaseButton>
              </div>
            </template>
          </li>
        </ul>
        <div v-else class="mt-4 text-center text-gray-500">No bad words found.</div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useBadWordStore, type BadWord } from '../../../data/stores/badWordStore';
import BaseInput from '../../atoms/BaseInput.vue';
import BaseButton from '../../atoms/BaseButton.vue';

const store = useBadWordStore();

const newWord = ref('');
const addError = ref<string | null>(null);
const editingWord = ref<BadWord & { originalWord?: string } | null>(null);

onMounted(() => {
  store.fetchWords();
});

const handleAddWord = async () => {
  if (!newWord.value.trim()) return;
  addError.value = null;
  try {
    await store.addWord(newWord.value.trim());
    newWord.value = '';
  } catch (e: any) {
    addError.value = e.message;
  }
};

const handleDeleteWord = (id: number) => {
  if (confirm('Are you sure you want to delete this word?')) {
    store.deleteWord(id);
  }
};

const startEdit = (word: BadWord) => {
  editingWord.value = { ...word, originalWord: word.word };
};

const cancelEdit = () => {
  editingWord.value = null;
};

const handleUpdateWord = async () => {
  if (!editingWord.value || !editingWord.value.word.trim()) return;
  
  // No change
  if (editingWord.value.word.trim() === editingWord.value.originalWord) {
    editingWord.value = null;
    return;
  }

  try {
    await store.updateWord(editingWord.value.id, editingWord.value.word.trim());
    editingWord.value = null;
  } catch (e: any) {
    alert(e.message); // Show error in an alert for simplicity
  }
};
</script>