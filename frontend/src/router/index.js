import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../components/pages/Index.vue'),
    },
    {
      path: '/users',
      component: () => import('../components/ui/UserGrid.vue'),
    },
    {
      path: '/taskAssignments',
      component: () => import('../components/ui/TaskAssignmentGrid.vue'),
    },
    {
      path: '/calendars',
      component: () => import('../components/ui/CalendarGrid.vue'),
    },
    {
      path: '/notifications',
      component: () => import('../components/ui/NotificationGrid.vue'),
    },
    {
      path: '/posts',
      component: () => import('../components/ui/PostGrid.vue'),
    },
    {
      path: '/attachments',
      component: () => import('../components/ui/AttachmentGrid.vue'),
    },
    {
      path: '/comments',
      component: () => import('../components/ui/CommentGrid.vue'),
    },
  ],
})

export default router;
