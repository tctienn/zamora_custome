<template>
  <MediaManager :media-type='MediaType.ANNOUNCEMENT'></MediaManager>
</template>

<script setup lang="ts">

import { MediaType } from '@/apps/media/model/media';
import MediaManager from '@/apps/media/views/media/MediaManager.vue';
</script>

<style scoped>

</style>