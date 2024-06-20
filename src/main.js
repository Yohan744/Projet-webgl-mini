import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import './assets/scss/main.css';
import SoundManager from './assets/js/SoundManager';

createApp(App)
    .use(router)
    .mount('#app');
    

export const useSoundManager = new SoundManager()
