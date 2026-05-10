import { createRouter, createWebHistory } from 'vue-router';
import CreateReservationPage from './views/CreateReservationPage.vue';
import ReservationsListPage from './views/ReservationsListPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/reservations' },
    { path: '/reservations', component: ReservationsListPage },
    { path: '/reservations/new', component: CreateReservationPage }
  ]
});
