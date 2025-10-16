<template>
  <div
    class='align-items-center bg-blue-400 border-circle cursor-pointer flex h-4rem justify-content-center mic-container w-4rem'
    @click='emits("stop")'>
    <AppIcon
      class='text-white'
      name='mic'
      size='3'/>
  </div>

</template>

<script lang='ts' setup>

import AppIcon from '@/common/components/app/AppIcon.vue';

const emits = defineEmits(['stop']);
</script>

<style scoped>
.mic-container {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(5, 92, 255, 0.5);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(85, 139, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(85, 117, 255, 0);
  }
}

</style>