import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueKonva from 'vue-konva';

createApp(App)
.use(VueKonva)
.use(router)
.mount('#app')
