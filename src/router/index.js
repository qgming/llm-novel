import { createRouter, createWebHistory } from "vue-router";
import BookList from "../views/BookList.vue";
import Settings from "@/views/Settings.vue";
import Writing from "@/views/Writing.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: BookList,
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
    },
    {
      path: "/writing/:bookName",
      name: "writing",
      component: Writing,
      props: true, // 启用props传参
    },
  ],
});

export default router;
