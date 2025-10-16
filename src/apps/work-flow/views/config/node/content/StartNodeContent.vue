<template>
  <AppIcon
    class='border-circle hover:text-green-600 node-base-start surface-overlay text-green-400 w-fit'
    name='play_arrow'
    size='2.5'/>
</template>

<style scoped>
.node-base-start {
  box-shadow: 0 0 1px rgba(37, 45, 91, .04), 0 0 1px rgba(84, 95, 111, .16);

  &:hover {
    box-shadow: 0 0 0 1px var(--blue-400), 0 0 10px 0 #d6d7e7;
  }
}

</style>

<script setup lang="ts">
</script>