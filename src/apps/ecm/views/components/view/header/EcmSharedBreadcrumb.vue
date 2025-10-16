<template>
  <Breadcrumb
    class='ecm-breadcrumb'
    :model='items'>
    <template #item='{item}'>
      <router-link
        class='font-semibold hover:text-primary'
        :to='item["to"]'>
        {{ item.label }}
      </router-link>
    </template>
  </Breadcrumb>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBreadcrumbStore } from '@/apps/ecm/store/breadcrumb';
import { useStorageStore } from '@/apps/ecm/store/storage';

const { rootFolderId } = storeToRefs(useStorageStore());

const {
  path,
  pathId,
} = storeToRefs(useBreadcrumbStore());
const { t } = useI18n();
const items = computed<MenuItem[]>(() => {
  let arr = [];
  if (path.value) {
    const paths = path.value.split('/');
    const pathIds = pathId.value.split('/');
    let currentFolderIndex = pathIds.findIndex((id: string) => id == rootFolderId.value);
    let i = Math.max(currentFolderIndex, 0);
    for (; i < pathIds.length; i++) {
      if (pathIds[i]) {
        arr.push({
          label: paths[i],
          to: { query: { folderId: pathIds[i] } }
        });
      }
    }
  }
  arr = [{
    label: t('ecm.storage.sharedDocuments'),
    to: { query: {} }
  }, ...arr];
  return arr;
});

</script>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({ name: 'EcmSharedBreadcrumb' });
</script>

<style scoped>

</style>