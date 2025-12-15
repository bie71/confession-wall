<template>
    <div :class="['relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300', themeClasses.root]">
        <div class="pointer-events-none absolute inset-0">
            <div :class="['absolute -top-24 -right-10 h-80 w-80 rounded-full blur-[120px]', themeClasses.accentTop]"></div>
            <div :class="['absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-[120px]', themeClasses.accentBottom]"></div>
        </div>

        <main class="relative z-10 w-full max-w-md px-6">
             <BaseCard :theme="theme" class="!p-8">
                <div class="space-y-3 mb-6 text-center">
                    <h1 :class="['text-3xl font-semibold md:text-4xl', themeClasses.heading]">
                        <slot name="title">Authentication</slot>
                    </h1>
                    <p :class="themeClasses.muted">
                        <slot name="subtitle">Welcome to Confession Wall</slot>
                    </p>
                </div>

                <slot name="form"></slot>

                <div class="mt-6 text-center text-sm" :class="themeClasses.subtle">
                    <slot name="footer-link"></slot>
                </div>
            </BaseCard>
        </main>
    </div>
</template>

<script setup lang="ts">
import BaseCard from '../atoms/BaseCard.vue';
import { useTheme } from '../composables/useTheme';

const { theme, themeClasses } = useTheme();
</script>
