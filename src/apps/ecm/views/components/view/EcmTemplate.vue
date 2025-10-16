<template>
  <div
    v-if='!serviceCanDelete && !loading && !error'
    class='align-items-center content-header flex flex-row flex-wrap justify-content-between py-1'>
    <slot name='breadcrumb'>
      <EcmBreadcrumb />
    </slot>
  </div>

  <AppLoader v-if='loading'/>
  <div
    v-else-if='error'
    class='align-items-center ecm-exception flex h-full justify-content-center'>
    <NoPermissionPanel v-if='error==="no-permission"'/>
    <NotFound v-else/>
  </div>
  <EcmStorage v-else/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';

import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmStorage from '@/apps/ecm/views/components/view/EcmStorage.vue';
import EcmBreadcrumb from '@/apps/ecm/views/components/view/header/EcmBreadcrumb.vue';
import { useEcmErrorStore } from '@/common/store/ecm-error';
import NoPermissionPanel from '@/common/views/error/403Panel.vue';
import NotFound from '@/common/views/error/404Panel.vue';

const {
  loading,
  error,
} = storeToRefs(useEcmErrorStore());
const { serviceCanDelete } = storeToRefs(useStorageStore());
</script>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({ name: 'EcmTemplate' });
</script>