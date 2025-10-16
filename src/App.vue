<template>
  <RouterView/>
  <AppUploadProgress :percent='per'/>
</template>

<script setup lang='ts'>
import { onMounted, onUnmounted, ref } from 'vue';

import AppUploadProgress from '@/common/components/app/upload/AppUploadProgress.vue';
import EventBus from '@/common/helpers/event-bus';

const per = ref(-1);

function changeUploadProgress(n: number) {
  per.value = n;
}

onMounted(() => {
  EventBus.on('changeUploadProgress', changeUploadProgress);
});
onUnmounted(() => {
  EventBus.off('changeUploadProgress', changeUploadProgress);
});
</script>