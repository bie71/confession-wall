import { createRouter, createWebHistory } from 'vue-router';
import WallPage from './ui/pages/WallPage.vue';
import LoginPage from './ui/pages/LoginPage.vue';
import RegisterPage from './ui/pages/RegisterPage.vue';

const routes = [
  {
    path: '/',
    name: 'Wall',
    component: WallPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
