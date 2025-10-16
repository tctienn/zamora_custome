<template>
  <div class='loading-container'>
    <!-- Toolbar Skeleton -->
    <div class='toolbar-skeleton'>
      <Skeleton
        height='2rem'
        width='200px'/>
      <div class='flex gap-2'>
        <Skeleton
          height='2rem'
          width='100px'/>
        <Skeleton
          height='2rem'
          width='100px'/>
      </div>
    </div>

    <!-- Header Section Skeleton -->
    <div class='header-skeleton'>
      <Skeleton
        shape='circle'
        size='4rem'/>
      <div class='header-info'>
        <Skeleton
          height='1.5rem'
          width='250px'/>
        <Skeleton
          height='1.25rem'
          width='200px'/>
      </div>
    </div>

    <!-- Content Section Skeleton -->
    <div class='content-skeleton'>
      <Skeleton
        height='2rem'
        width='50%'/>
      <Skeleton
        height='8rem'
        width='100%'/>
      <Skeleton
        height='8rem'
        width='90%'/>
      <Skeleton
        height='2rem'
        width='100%'/>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
</script>

<style scoped>
.loading-container {
  width: 100%;
  padding: 1rem 0;
  text-align: center;
}

.toolbar-skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.header-skeleton {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.content-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
