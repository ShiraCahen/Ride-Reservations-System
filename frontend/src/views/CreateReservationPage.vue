<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createReservation, updateReservation } from '../api';
import type { Reservation } from '../types';
 
const router = useRouter();
const RESERVATION_EDIT_DRAFT_KEY = 'hq-reservation-edit-draft';
 
type FormFieldKey =
  | 'riderFirstName'
  | 'riderLastName'
  | 'pickupLocation'
  | 'dropoffLocation'
  | 'pickupTime'
  | 'passengerCount'
  | 'phoneNumber';
 
// ── Favorite Locations ──────────────────────────────────────────────────────
interface FavoriteLocation {
  key: string;
  label: string;
  icon: string;
  riderFirstName: string;
  riderLastName: string;
  dropoffLocation: string;
  phoneNumber: string;
}
 
const favoriteLocations: FavoriteLocation[] = [
  {
    key: 'home',
    label: 'Home',
    icon: '🏠',
    riderFirstName: 'Shira',
    riderLastName: 'Cahen',
    dropoffLocation: 'Modiin',
    phoneNumber: '0502152251',
  },
  {
    key: 'office',
    label: 'Office',
    icon: '🏢',
    riderFirstName: 'Shira',
    riderLastName: 'Cahen',
    dropoffLocation: 'HQ Rehovot',
    phoneNumber: '0502152251',
  },
  {
    key: 'airport',
    label: 'Airport',
    icon: '✈️',
    riderFirstName: 'Shira',
    riderLastName: 'Cahen',
    dropoffLocation: 'Ben Gurion Airport',
    phoneNumber: '0502152251',
  },
];
 
const activeFavorite = ref<string | null>(null);
 
function applyFavorite(fav: FavoriteLocation) {
  // Toggle off if already active
  if (activeFavorite.value === fav.key) {
    activeFavorite.value = null;
    return;
  }
 
  activeFavorite.value = fav.key;
  form.riderFirstName = fav.riderFirstName;
  form.riderLastName = fav.riderLastName;
  form.dropoffLocation = fav.dropoffLocation;
  form.phoneNumber = fav.phoneNumber;
 
  // Clear errors for affected fields
  clearFieldError('riderFirstName');
  clearFieldError('riderLastName');
  clearFieldError('dropoffLocation');
  clearFieldError('phoneNumber');
}
 
// ── Form setup ──────────────────────────────────────────────────────────────
const nowPlusOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
 
function pickupIsoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
 
const SAME_ORIGIN_DEST_MSG = 'Origin and destination must be different.';
 
const specialRequirementsOptions = [
  'Baby seat',
  'Wheelchair accessible vehicle',
  'Extra luggage',
  'Pet friendly ride',
];
 
const form = reactive({
  riderFirstName: '',
  riderLastName: '',
  pickupLocation: '',
  dropoffLocation: '',
  pickupTime: nowPlusOneHour,
  passengerCount: 1,
  phoneNumber: '',
  specialRequirements: [] as string[],
});
 
const editingReservationId = ref<number | null>(null);
const fieldErrors = ref<Partial<Record<FormFieldKey, string>>>({});
const generalFormError = ref('');
const isSubmitting = ref(false);
 
const pageTitle = computed(() =>
  editingReservationId.value !== null ? 'Edit Reservation' : 'Create Reservation'
);
 
function submitActionLabel(busy: boolean): string {
  const isEdit = editingReservationId.value !== null;
  if (busy) return isEdit ? 'Updating...' : 'Creating...';
  return isEdit ? 'Save changes' : 'Create Reservation';
}
 
function clearFieldError(field: FormFieldKey) {
  const err = fieldErrors.value;
  if (!(field in err)) return;
  const next = { ...err };
  delete next[field];
  fieldErrors.value = next;
}
 
function clearPickupLocationFeedback() {
  clearFieldError('pickupLocation');
  if (fieldErrors.value.dropoffLocation === SAME_ORIGIN_DEST_MSG) clearFieldError('dropoffLocation');
}
 
function clearDropoffLocationFeedback() {
  clearFieldError('dropoffLocation');
  if (fieldErrors.value.pickupLocation === SAME_ORIGIN_DEST_MSG) clearFieldError('pickupLocation');
}
 
function validateFormFields(): Partial<Record<FormFieldKey, string>> {
  const errors: Partial<Record<FormFieldKey, string>> = {};
  if (form.riderFirstName.trim().length < 1) errors.riderFirstName = "First name can't be empty";
  if (form.riderLastName.trim().length < 1) errors.riderLastName = "Last name can't be empty";
 
  const pickupTrim = form.pickupLocation.trim();
  const dropTrim = form.dropoffLocation.trim();
 
  if (pickupTrim.length < 1) errors.pickupLocation = "Pickup location can't be empty.";
  if (dropTrim.length < 1) errors.dropoffLocation = "Dropoff location can't be empty.";
  if (
    pickupTrim.length > 0 &&
    dropTrim.length > 0 &&
    pickupTrim.toLowerCase() === dropTrim.toLowerCase()
  ) {
    errors.pickupLocation = SAME_ORIGIN_DEST_MSG;
    errors.dropoffLocation = SAME_ORIGIN_DEST_MSG;
  }
 
  if (!form.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required.';
 
  const passengerCountNum = Number(form.passengerCount);
  if (Number.isNaN(passengerCountNum) || passengerCountNum < 1 || passengerCountNum > 6) {
    errors.passengerCount = 'Passenger count must be between 1 and 6.';
  }
 
  const pickupDate = new Date(form.pickupTime);
  if (Number.isNaN(pickupDate.getTime()) || pickupDate.getTime() <= Date.now()) {
    errors.pickupTime = 'Pickup time must be in the future.';
  }
 
  return errors;
}
 
onMounted(() => {
  const raw = sessionStorage.getItem(RESERVATION_EDIT_DRAFT_KEY);
  if (!raw) return;
  try {
    const res = JSON.parse(raw) as Reservation;
    editingReservationId.value = res.id;
    form.riderFirstName = res.riderFirstName ?? '';
    form.riderLastName = res.riderLastName ?? '';
    form.pickupLocation = res.pickupLocation ?? '';
    form.dropoffLocation = res.dropoffLocation ?? '';
    form.pickupTime = pickupIsoToDatetimeLocal(res.pickupTime) || nowPlusOneHour;
    form.passengerCount =
      typeof res.passengerCount === 'number' && res.passengerCount >= 1 && res.passengerCount <= 6
        ? res.passengerCount
        : 1;
    form.phoneNumber = res.phoneNumber ?? '';
    form.specialRequirements = [...(res.specialRequirements ?? [])];
  } catch {
    // ignore malformed draft
  } finally {
    sessionStorage.removeItem(RESERVATION_EDIT_DRAFT_KEY);
  }
});
 
async function submitForm() {
  fieldErrors.value = {};
  generalFormError.value = '';
  fieldErrors.value = validateFormFields();
  if (Object.keys(fieldErrors.value).length > 0) return;
 
  isSubmitting.value = true;
  try {
    const payload = {
      riderFirstName: form.riderFirstName.trim(),
      riderLastName: form.riderLastName.trim(),
      pickupLocation: form.pickupLocation.trim(),
      dropoffLocation: form.dropoffLocation.trim(),
      pickupTime: new Date(form.pickupTime).toISOString(),
      passengerCount: Number(form.passengerCount),
      phoneNumber: form.phoneNumber.trim(),
      specialRequirements: form.specialRequirements,
    };
 
    const id = editingReservationId.value;
    if (id !== null) {
      await updateReservation(id, payload);
    } else {
      await createReservation(payload);
    }
 
    await router.push('/reservations');
  } catch (error) {
    const fallback =
      editingReservationId.value !== null
        ? 'Failed to update reservation.'
        : 'Failed to create reservation.';
    generalFormError.value = error instanceof Error ? error.message : fallback;
  } finally {
    isSubmitting.value = false;
  }
}
</script>
 
<template>
  <section class="card">
    <h2>{{ pageTitle }}</h2>
 
    <!-- ── Favorite Locations ── -->
    <div class="favorites-section">
      <p class="favorites-label">⚡ Quick fill </p>
      <div class="favorites-row">
        <button
          v-for="fav in favoriteLocations"
          :key="fav.key"
          type="button"
          :class="['fav-btn', activeFavorite === fav.key && 'fav-btn--active']"
          @click="applyFavorite(fav)"
        >
          <span class="fav-icon">{{ fav.icon }}</span>
          <span class="fav-label">{{ fav.label }}</span>
          <span class="fav-dest">- {{ fav.dropoffLocation }}</span>
        </button>
      </div>
      <p v-if="activeFavorite" class="favorites-hint">
        ✓ Details pre-filled. You can still edit any field below.
      </p>
    </div>
 
    <div class="divider" />
 
    <!-- ── Form ── -->
    <form @submit.prevent="submitForm" class="form-grid">
      <label>
        <span class="label-text">First Name <span class="required-marker">*</span></span>
        <input
          v-model="form.riderFirstName"
          type="text"
          minlength="1"
          :class="{ 'input-invalid': fieldErrors.riderFirstName }"
          @input="clearFieldError('riderFirstName')"
        />
        <span v-if="fieldErrors.riderFirstName" class="field-error-msg">{{ fieldErrors.riderFirstName }}</span>
      </label>
 
      <label>
        <span class="label-text">Last Name <span class="required-marker">*</span></span>
        <input
          v-model="form.riderLastName"
          type="text"
          minlength="1"
          :class="{ 'input-invalid': fieldErrors.riderLastName }"
          @input="clearFieldError('riderLastName')"
        />
        <span v-if="fieldErrors.riderLastName" class="field-error-msg">{{ fieldErrors.riderLastName }}</span>
      </label>
 
      <label>
        <span class="label-text">Pickup Location <span class="required-marker">*</span></span>
        <input
          v-model="form.pickupLocation"
          type="text"
          minlength="1"
          :class="{ 'input-invalid': fieldErrors.pickupLocation }"
          @input="clearPickupLocationFeedback"
        />
        <span v-if="fieldErrors.pickupLocation" class="field-error-msg">{{ fieldErrors.pickupLocation }}</span>
      </label>
 
      <label>
        <span class="label-text">Destination Location <span class="required-marker">*</span></span>
        <input
          v-model="form.dropoffLocation"
          type="text"
          minlength="1"
          :class="{ 'input-invalid': fieldErrors.dropoffLocation }"
          @input="clearDropoffLocationFeedback"
        />
        <span v-if="fieldErrors.dropoffLocation" class="field-error-msg">{{ fieldErrors.dropoffLocation }}</span>
      </label>
 
      <label>
        <span class="label-text">Pickup Time <span class="required-marker">*</span></span>
        <input
          v-model="form.pickupTime"
          type="datetime-local"
          :class="{ 'input-invalid': fieldErrors.pickupTime }"
          @input="clearFieldError('pickupTime')"
        />
        <span v-if="fieldErrors.pickupTime" class="field-error-msg">{{ fieldErrors.pickupTime }}</span>
      </label>
 
      <label>
        <span class="label-text">Passenger Count <span class="required-marker">*</span></span>
        <input
          v-model.number="form.passengerCount"
          type="number"
          min="1"
          max="6"
          step="1"
          :class="{ 'input-invalid': fieldErrors.passengerCount }"
          @input="clearFieldError('passengerCount')"
        />
        <span v-if="fieldErrors.passengerCount" class="field-error-msg">{{ fieldErrors.passengerCount }}</span>
      </label>
 
      <label>
        <span class="label-text">Phone Number <span class="required-marker">*</span></span>
        <input
          v-model="form.phoneNumber"
          type="tel"
          :class="{ 'input-invalid': fieldErrors.phoneNumber }"
          @input="clearFieldError('phoneNumber')"
        />
        <span v-if="fieldErrors.phoneNumber" class="field-error-msg">{{ fieldErrors.phoneNumber }}</span>
      </label>
 
      <div class="full-width">
        <span>Special Requirements</span>
        <div class="checkbox-group">
          <label v-for="option in specialRequirementsOptions" :key="option" class="checkbox-option">
            <input v-model="form.specialRequirements" type="checkbox" :value="option" />
            {{ option }}
          </label>
        </div>
      </div>
 
      <p v-if="generalFormError" class="field-error-msg form-submit-error">{{ generalFormError }}</p>
 
      <button type="submit" class="submit-reservation-btn" :disabled="isSubmitting">
        {{ submitActionLabel(isSubmitting) }}
      </button>
    </form>
  </section>
</template>