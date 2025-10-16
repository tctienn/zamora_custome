<template>
  <div
    class='align-items-center border-1 border-round content-header flex flex-row justify-content-between shadow-1 surface-border'>
    <AppBreadcrumb class='bg-transparent'/>
  </div>
</template>

<script setup lang='ts'>

import AppBreadcrumb from '@/common/components/app/AppBreadcrumb.vue';
</script>

<script lang='ts'>
export default { name: 'UserGroup' };
</script>