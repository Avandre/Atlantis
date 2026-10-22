import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from './stores/session';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'lobby', component: () => import('./views/LobbyView.vue') },
    {
      path: '/room/:id',
      name: 'room',
      component: () => import('./views/RoomView.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useSessionStore().player) {
    return { name: 'lobby', query: { redirect: to.fullPath } };
  }
});
