import DashboardLayout from '@/views/Layout/DashboardLayout.vue';
import AuthLayout from '@/views/Pages/AuthLayout.vue';
import NotFound from '@/views/GeneralViews/NotFoundPage.vue';

const Composer = () => import('@/views/Composer.vue');
const EvergreenQueue = () => import('@/views/EvergreenQueue.vue');
const History = () => import('@/views/History.vue');
const Login = () => import('@/views/Pages/Login.vue');
const Queue = () => import('@/views/Queue.vue');
const Settings = () => import('@/views/Settings.vue');
const School = () => import('@/views/School.vue');
const Timezone = () => import('@/views/Setup.vue');

function routes() {
  return [
    {
      path: '/login',
      component: AuthLayout,
      children: [
        {
          path: '/',
          name: 'Login',
          component: Login,
          meta: {
            id: 'login',
          },
        },
        { path: '*', component: NotFound }
      ]
    },
    {
      path: '/',
      component: DashboardLayout,
      redirect: '/queue',
      name: 'Dashboard layout',
      children: [
        {
          path: '/setup',
          component: Timezone,
          name: 'Welcome to Hypefury!',
          meta: {
            id: 'setup',
            requiresAuth: true,
          },
        },
        {
          path: '/',
          redirect: '/queue',
        },
        {
          path: '/queue',
          name: 'Queue',
          component: Queue,
          meta: {
            id: 'queue',
            requiresAuth: true,
          },
        },
        {
          path: '/evergreen-posts',
          name: 'Evergreen Posts',
          component: EvergreenQueue,
          meta: {
            id: 'evergreen_posts',
            requiresAuth: true,
          },
        },
        {
          path: '/composer',
          name: 'Composer',
          component: Composer,
          meta: {
            id: 'composer',
            requiresAuth: true,
          },
        },
        {
          path: '/history',
          name: 'History',
          component: History,
          meta: {
            id: 'history',
            requiresAuth: true,
          },
        },
        {
          path: '/history/:threadId',
          name: 'History',
          component: History,
          meta: {
            id: 'history',
            requiresAuth: true,
          },
        },
        {
          path: '/new',
          redirect: '/queue',
        },
        {
          path: '/scheduled',
          redirect: '/queue',
        },
        {
          path: '/settings',
          name: 'Settings',
          component: Settings,
          meta: {
            id: 'settings',
            requiresAuth: true,
          },
        },
        {
          path: '/school',
          name: 'Hypefury School',
          component: School,
          meta: {
            id: 'school',
            requiresAuth: true,
          },
        },
        { path: '*', component: NotFound }
      ]
    },
  ];
}

export default routes;
