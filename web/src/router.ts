import { createRouter, createWebHistory } from 'vue-router';
import WallPage from './ui/pages/WallPage.vue';
import LoginPage from './ui/pages/LoginPage.vue';
import RegisterPage from './ui/pages/RegisterPage.vue';
import { useAuthStore } from './data/stores/authStore';

// Admin Pages
import AdminDashboardPage from './ui/pages/Admin/DashboardPage.vue';
import AdminBadWordsPage from './ui/pages/Admin/BadWordsPage.vue';
import AdminUserManagementPage from './ui/pages/Admin/UserManagementPage.vue';
import AdminConfessionManagementPage from './ui/pages/Admin/ConfessionManagementPage.vue';


const routes = [
  { path: '/', name: 'Wall', component: WallPage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  {
    path: '/admin',
    component: AdminDashboardPage,
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore();
      if (auth.isAdmin) {
        next();
      } else {
        next({ name: 'Wall' });
      }
    },
    redirect: '/admin/confessions',
    children: [
      {
        path: 'confessions',
        name: 'AdminConfessions',
        component: AdminConfessionManagementPage,
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUserManagementPage,
      },
      {
        path: 'bad-words',
        name: 'AdminBadWords',
        component: AdminBadWordsPage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
