<template>
  <div class="layout">
    <header class="topbar">
      <div class="title-section">
         <h1>Tap. Book. Go.</h1>
        <h2>Getting a ride should be this easy.</h2>
      </div>
      
      <RouterLink
        v-if="$route.path !== '/reservations/new'"
        to="/reservations/new"
        class="create-btn">
        Create Reservation
      </RouterLink>
      
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
