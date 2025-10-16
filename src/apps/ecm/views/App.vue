<template>
  <AppHome/>
</template>

<script lang='ts'>
import '@/apps/ecm/assets/sass/overrides/_custom_override.scss';

import { defineComponent } from 'vue';

import AppHome from '@/common/views/AppHome.vue';

export default defineComponent({ components: { AppHome } });

</script>