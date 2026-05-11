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
 
// --- Search & Filter state ---
const searchQuery = ref('');
const debouncedQuery = ref('');
const activeFilter = ref<'all' | 'upcoming' | 'past'>('all');
let debounceTimer: ReturnType<typeof setTimeout>;
 
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val.trim().toLowerCase();
  }, 220);
});
 
// --- Date helpers ---
function isPickupInPast(pickupTime: string): boolean {
  const t = new Date(pickupTime).getTime();
  return !Number.isNaN(t) && t <= Date.now();
}
 
function formatDate(value: string): string {
  const date = new Date(value);
  return (
    date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' at ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
}
 
// --- Filtered reservations ---
function matchesSearch(r: Reservation): boolean {
  if (!debouncedQuery.value) return true;
  const q = debouncedQuery.value;
  return (
    `${r.riderFirstName} ${r.riderLastName}`.toLowerCase().includes(q) ||
    r.pickupLocation.toLowerCase().includes(q) ||
    r.dropoffLocation.toLowerCase().includes(q) ||
    r.phoneNumber.toLowerCase().includes(q)
  );
}
 
const filteredReservations = computed(() => {
  return reservations.value.filter((r) => {
    const past = isPickupInPast(r.pickupTime);
    if (activeFilter.value === 'upcoming' && past) return false;
    if (activeFilter.value === 'past' && !past) return false;
    return matchesSearch(r);
  });
});
 
const upcomingReservations = computed(() =>
  filteredReservations.value.filter((r) => !isPickupInPast(r.pickupTime))
);
 
const pastReservations = computed(() =>
  [...filteredReservations.value.filter((r) => isPickupInPast(r.pickupTime))].sort(
    (a, b) => new Date(b.pickupTime).getTime() - new Date(a.pickupTime).getTime()
  )
);
 
const reservationSections = computed(() => {
  const sections = [];
  if (activeFilter.value !== 'past') {
    sections.push({ id: 'upcoming', title: 'Upcoming Reservations', items: upcomingReservations.value });
  }
  if (activeFilter.value !== 'upcoming') {
    sections.push({ id: 'past', title: 'Past Reservations', items: pastReservations.value, muted: true });
  }
  return sections;
});
 
const totalVisible = computed(() => filteredReservations.value.length);
const hasActiveFilters = computed(() => debouncedQuery.value !== '' || activeFilter.value !== 'all');
 
function clearFilters() {
  searchQuery.value = '';
  debouncedQuery.value = '';
  activeFilter.value = 'all';
}
 
// --- Data loading ---
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
 
// --- Actions ---
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
 
watch(
  () => route.path,
  (path) => {
    if (path === '/reservations') loadReservations();
  },
  { immediate: true }
);
</script>
 
<template>
  <section class="container">
    <p v-if="isLoading" class="state-msg">Loading...</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="reservations.length === 0" class="state-msg">No reservations found.</p>
 
    <template v-else>
      <!-- ── Search & Filter bar ── -->
      <div class="controls">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input v-model="searchQuery" class="search-input"
            type="text" placeholder="     Search…" autocomplete="off"
          />
          <button
            v-if="searchQuery"
            class="clear-search"
            type="button"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >✕</button>
        </div>
 
        <div class="filter-pills">
          <button
            v-for="opt in [
              { key: 'all',      label: 'All' },
              { key: 'upcoming', label: '🕐 Upcoming' },
              { key: 'past',     label: '✅ Past' },
            ]"
            :key="opt.key"
            :class="['pill', activeFilter === opt.key && 'pill--active']"
            type="button"
            @click="activeFilter = opt.key as 'all' | 'upcoming' | 'past'"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
 
      <!-- ── Result summary / clear ── -->
      <div v-if="hasActiveFilters" class="results-bar">
        <span class="results-count">{{ totalVisible }} result{{ totalVisible !== 1 ? 's' : '' }}</span>
        <button class="clear-all" type="button" @click="clearFilters">Clear filters ✕</button>
      </div>
 
      <!-- ── Empty state for filtered view ── -->
      <div v-if="totalVisible === 0" class="empty-filtered">
        <span class="empty-icon">🔎</span>
        <p>No reservations match your search.</p>
        <button class="clear-all" type="button" @click="clearFilters">Clear filters</button>
      </div>
 
      <!-- ── Reservation sections ── -->
      <template v-else>
        <div
          v-for="section in reservationSections"
          :key="section.id"
          class="list-section"
        >
          <div class="header">
            <h2>{{ section.title }}</h2>
            <span class="section-count">{{ section.items.length }}</span>
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
                    🚗 <strong>{{ res.pickupLocation }}</strong> → <strong>{{ res.dropoffLocation }}</strong>
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
                    {{ res.specialRequirements?.length ? res.specialRequirements.join(', ') : 'None' }}
                  </small>
                </div>
              </div>
 
              <div class="card-actions" :class="{ 'card-actions--past': section.muted }">
                <button v-if="!section.muted" type="button" class="btn-edit" @click="handleEdit(res)">Edit ✏️</button>
                <button v-if="!section.muted" type="button" class="btn-delete" @click="handleDelete(res.id)">Delete 🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </section>
</template>