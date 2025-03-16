import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueKonva from 'vue-konva';
import { createPinia } from 'pinia';

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(router)
  .use(VueKonva)
  .mount('#app')
