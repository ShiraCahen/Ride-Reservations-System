<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { deleteReservation, getReservations } from '../api';
import type { Reservation } from '../types';

const route = useRoute();
const router = useRouter();
const RESERVATION_EDIT_DRAFT_KEY = 'hq-reservation-edit-draft';

const reservations = ref<Reservation[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');

function isPickupInPast(pickupTime: string): boolean {
  const t = new Date(pickupTime).getTime();
  return !Number.isNaN(t) && t <= Date.now();
}

/** Next rides first, same chronological order as the API (pickup ascending). */
const upcomingReservations = computed(() =>
  reservations.value.filter((r) => !isPickupInPast(r.pickupTime))
);

/** Most recently finished first. */
const pastReservations = computed(() =>
  [...reservations.value.filter((r) => isPickupInPast(r.pickupTime))].sort(
    (a, b) => new Date(b.pickupTime).getTime() - new Date(a.pickupTime).getTime()
  )
);

const reservationSections = computed(() => [
  { id: 'upcoming', title: 'Upcoming Reservations', items: upcomingReservations.value },
  {
    id: 'past',
    title: 'Past reservations',
    items: pastReservations.value,
    muted: true
  }
]);

async function loadReservations() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    reservations.value = await getReservations();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load reservations.';
  } finally {
    isLoading.value = false;
  }
}

function handleEdit(reservation: Reservation) {
  sessionStorage.setItem(RESERVATION_EDIT_DRAFT_KEY, JSON.stringify(reservation));
  router.push('/reservations/new');
}

async function handleDelete(id: number) {
  if (!confirm('Are you sure you want to delete this?')) return;
  errorMessage.value = '';
  try {
    await deleteReservation(id);
    reservations.value = reservations.value.filter((r) => r.id !== id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to delete reservation.';
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' at ' + date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

watch(
  () => route.path,
  (path) => {
    if (path === '/reservations') {
      loadReservations();
    }
  },
  { immediate: true }
);
</script>

<template>
  <section class="container">
    <p v-if="isLoading">Loading...</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="reservations.length === 0">No reservations found.</p>

    <template v-else>
      <div
        v-for="section in reservationSections"
        :key="section.id"
        class="list-section"
      >
        <div class="header">
          <h2>{{ section.title }}</h2>
        </div>

        <p v-if="section.items.length === 0" class="section-empty">
          {{ section.id === 'past' ? 'No past reservations yet.' : 'No upcoming reservations.' }}
        </p>

        <div v-else class="cards-list">
          <div
            v-for="res in section.items"
            :key="res.id"
            :class="['res-card', section.muted && 'res-card--past']"
          >
            <div class="card-body">
              <div class="row main-info">
                <span class="name">{{ res.riderFirstName }} {{ res.riderLastName }}</span>
                <span class="passengers">{{ res.passengerCount }} Pass.</span>
              </div>

              <div class="row route-info">
                <div class="location">
                  <strong>{{ res.pickupLocation }}</strong> → <strong>{{ res.dropoffLocation }}</strong>
                </div>
                <div class="time">
                  <span>{{ formatDate(res.pickupTime) }}</span>
                </div>
              </div>

              <div class="row contact-info">
                <small>Phone: {{ res.phoneNumber }}</small>
              </div>

              <div class="special-req-row">
                <small>
                  <strong>Special requirements:</strong>
                  {{
                    res.specialRequirements?.length
                      ? res.specialRequirements.join(', ')
                      : 'None'
                  }}
                </small>
              </div>
            </div>

            <div
                class="card-actions":class="{ 'card-actions--past': section.muted }">
              <button v-if="!section.muted" type="button" class="btn-edit" @click="handleEdit(res)">
                  Edit
              </button>
              <button v-if="!section.muted" type="button" class="btn-delete" @click="handleDelete(res.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>