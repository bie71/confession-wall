import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/material-symbols-outlined/400.css";

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';

import router from './router';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount('#app');
