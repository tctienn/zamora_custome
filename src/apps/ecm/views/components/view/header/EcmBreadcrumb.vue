<template>
  <Breadcrumb
    v-if='!isSearch'
    class='bg-transparent ecm-breadcrumb px-2 py-0'
    :model='items'>
    <template #item='{item}'>
      <router-link
        class='font-semibold hover:text-primary'
        :to='item["to"]'>
        {{ item.label }}
      </router-link>
    </template>
  </Breadcrumb>
  <div
    v-else
    class='bg-transparent ecm-breadcrumb font-semibold px-2 py-0'>
    Kết quả tìm kiếm
  </div>

  <div class='align-items-center column-gap-2 flex flex-row'>
    <span>
      {{ `${t('ecm.capacity.usageStatistics')}` }}
      <span
        class='font-bold'>
        {{ `(${percentDisk}%/${convertFileSize(totalCapacity)})` }}
      </span>
    </span>

    <ProgressBar
      v-tooltip='percentTooltip'
      class='h-1rem mr-3 w-20rem'
      :value='percentDisk'>
      <!--      <span v-if='percentDisk > 10'>-->
      <!--        {{`${percentDisk}%/${convertFileSize(totalCapacity)}`}}-->
      <!--      </span>-->
      <span></span>
    </ProgressBar>
  </div>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { useBreadcrumbStore } from '@/apps/ecm/store/breadcrumb';
import { useStorageStore } from '@/apps/ecm/store/storage';
import { convertFileSize } from '@/common/helpers/file-utils';

const { t } = useI18n();
const { rootFolderId } = storeToRefs(useStorageStore());
const {
  path,
  pathId,
  usedCapacity,
  totalCapacity,
} = storeToRefs(useBreadcrumbStore());

const percentDisk = computed(() => {
  return parseFloat((usedCapacity.value / totalCapacity.value * 100 > 100 ? 100 : usedCapacity.value / totalCapacity.value * 100).toFixed(2));
});

const percentTooltip = computed(() => ({
  'value': `${t('ecm.capacity.tooltipUsed') + convertFileSize(usedCapacity.value) + '/' + t('ecm.capacity.tooltipTotal') + convertFileSize(totalCapacity.value)}
            <br>${t('ecm.capacity.tooltipPercent') + percentDisk.value}%`,
  'escape': true
}));

const items = computed<MenuItem[]>(() => {
  if (path.value) {
    const paths = path.value.split('/');
    const pathIds = pathId.value.split('/');
    let currentFolderIndex = pathIds.findIndex((id: string) => id == rootFolderId.value);
    let i = Math.max(currentFolderIndex, 0);
    const arr: MenuItem[] = [];
    for (; i < pathIds.length; i++) {
      if (pathIds[i]) {
        arr.push({
          label: pathIds[i] == rootFolderId.value ? t('ecm.menu.ecm') : paths[i],
          to: pathIds[i] == rootFolderId.value ? { query: {} } : { query: { folderId: pathIds[i] } }
        });
      }
    }
    return arr;
  } else {
    return [
      {
        label: t('ecm.menu.ecm'),
        to: { query: {} }
      }
    ];
  }
});

onMounted(() => {
  if (!path.value) {
    useBreadcrumbStore().createBreadcrumb();
  }

  if (!usedCapacity.value) {
    useBreadcrumbStore().getCapacityFn();
  }
});

const isSearch = ref(false);
const searchTerm = inject('searchTerm', ref(''));
watch(searchTerm, (value) => {
  if (value) {
    isSearch.value = true;
  } else {
    isSearch.value = false;
  }
});
</script>

<script lang='ts'>
export default { name: 'EcmBreadcrumb' };
</script>