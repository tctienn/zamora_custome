<template>
  <MediaPage :type='MediaType.NEWS'/>
</template>

<script lang='ts' setup>

import { MediaType } from '@/apps/media/model/media';
import MediaPage from '@/apps/media/views/media/MediaPage.vue';
</script>

<style scoped>

</style>