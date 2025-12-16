import { defineStore } from "pinia";
import { ref } from "vue";
import { badWordApiRepository } from "../repositories/BadWordApiRepository";
import { useAuthStore } from "./authStore";

export interface BadWord {
    id: number;
    word: string;
    createdAt: string;
}

export const useBadWordStore = defineStore("bad-words", () => {
    const words = ref<BadWord[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const auth = useAuthStore();

    async function fetchWords() {
        if (!auth.token) return;
        loading.value = true;
        error.value = null;
        try {
            words.value = await badWordApiRepository.getAll(auth.token);
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }

    async function addWord(word: string) {
        if (!auth.token) return;
        loading.value = true;
        error.value = null;
        try {
            const newWord = await badWordApiRepository.add(word, auth.token);
            words.value.push(newWord);
        } catch (e: any) {
            error.value = e.message;
            throw e; // re-throw for form handling
        } finally {
            loading.value = false;
        }
    }

    async function updateWord(id: number, word: string) {
        if (!auth.token) return;
        loading.value = true;
        error.value = null;
        try {
            await badWordApiRepository.update(id, word, auth.token);
            const index = words.value.findIndex(w => w.id === id);
            if (index !== -1) {
                words.value[index] = { ...words.value[index], word };
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function deleteWord(id: number) {
        if (!auth.token) return;
        loading.value = true;
        error.value = null;
        try {
            await badWordApiRepository.remove(id, auth.token);
            words.value = words.value.filter(w => w.id !== id);
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }

    return { words, loading, error, fetchWords, addWord, updateWord, deleteWord };
});
