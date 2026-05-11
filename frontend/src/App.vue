<template>
  <div class="layout">

    <!-- ── Navbar ── -->
    <nav class="navbar">
      <span class="navbar-brand"><h1>Tap. Book. Go.</h1>
        Getting a RIDE should be this easy!
      </span>

      <div class="navbar-links">
        <RouterLink v-if="$route.path !== '/reservations/new'"
          to="/reservations/new" class="create-btn">New Ride Reservation
        </RouterLink>

        <!-- Business dropdown -->
        <div class="nav-item" @mouseenter="openMenu = 'business'" @mouseleave="openMenu = null">
          <button class="nav-link">Business <span class="arrow">▾</span></button>
          <div v-if="openMenu === 'business'" class="dropdown">
            <a class="dropdown-item">Business Rides</a>
            <a class="dropdown-item">Pricing</a>
          </div>
        </div>

        <!-- Contact dropdown -->
        <div class="nav-item" @mouseenter="openMenu = 'contact'" @mouseleave="openMenu = null">
          <button class="nav-link">Contact Us<span class="arrow">▾</span></button>
          <div v-if="openMenu === 'contact'" class="dropdown">
            <a class="dropdown-item">📞 Call us</a>
            <a class="dropdown-item">✉️ Email us</a>
          </div>
        </div>
      </div>
    </nav>
    <RouterView/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const openMenu = ref<string | null>(null);
</script>