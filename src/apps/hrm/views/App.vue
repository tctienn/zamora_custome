<template>
  <AppHome/>
</template>

<script>
import '@/apps/hrm/assets/style.scss';

import { defineComponent } from 'vue';

import AppHome from '@/common/views/AppHome.vue';

export default defineComponent({ components: { AppHome } });
</script>