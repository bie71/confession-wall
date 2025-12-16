<template>
  <div class="flex h-screen bg-slate-950 text-white">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 border-r border-white/10">
      <div class="flex h-full flex-col p-4">
        <h1 class="text-xl font-bold">Admin Panel</h1>
        <nav class="mt-8 flex flex-col gap-2">
          <router-link to="/admin/confessions" class="nav-link">Confessions</router-link>
          <router-link to="/admin/users" class="nav-link">Users</router-link>
          <router-link to="/admin/bad-words" class="nav-link">Bad Words</router-link>
        </nav>
        <div class="mt-auto">
          <router-link to="/" class="text-sm text-emerald-400 hover:underline">Back to Main Site</router-link>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.nav-link {
  @apply rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white;
}
.router-link-exact-active {
  @apply bg-emerald-500/20 text-emerald-300;
}
</style>
