import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { useConfigStore } from "./stores/configStore";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// 初始化Pinia
app.use(createPinia());
// 初始化路由
app.use(router);

// 加载初始配置
useConfigStore().loadConfig();

app.mount("#app");
