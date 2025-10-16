<template>
  <ProjectComponentManager :component='ProjectComponent.TYPE'/>
</template>

<script setup lang="ts">

import { ProjectComponent } from '@/apps/work/model/project';
import ProjectComponentManager from '@/apps/work/views/project/component/ProjectComponentManager.vue';
</script>

<style scoped>

</style>