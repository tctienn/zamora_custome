<template>
  <div class='flex flex-column w-full'>
    <div class='flex justify-content-between'>
      <EcmGroupAction/>
      <EcmQuickAction/>

      <div class='column-gap-2 flex flex-wrap justify-content-end row-gap-2'>
        <EcmStorageSort/>

        <div class='column-gap-2 flex flex-row'>
          <DataViewLayoutOptions v-model='layout'/>

          <div class='relative'>
            <Button
              v-tooltip.bottom='t("common.filter")'
              class='px-3'
              :outlined='!showFilter'
              type='button'
              @click='toggleFilterMenu'>
              <AppIcon name='filter_list'/>
            </Button>
            <Badge
              v-if='fileTypeFilter || lastModifiedFilter || sharedFilter'
              class='-m-1 absolute right-0 top-0'
              severity='danger'
              value=''></Badge>
          </div>
        </div>

      </div>
    </div>

    <div class='flex justify-content-end'>
      <EcmStorageFilter
        v-if='showFilter'
        class='pt-2'/>
    </div>
  </div>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import Badge from 'primevue/badge';
import { useI18n } from 'vue-i18n';

import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmQuickAction from '@/apps/ecm/views/components/view/header/EcmQuickAction.vue';
import EcmStorageFilter from '@/apps/ecm/views/components/view/header/EcmStorageFilter.vue';
import EcmStorageSort from '@/apps/ecm/views/components/view/header/EcmStorageSort.vue';
import EcmGroupAction from '@/apps/ecm/views/components/view/header/group-action-butons/EcmGroupAction.vue';

const {
  layout,
  showFilter,
  fileTypeFilter,
  lastModifiedFilter,
  sharedFilter
} = storeToRefs(useStorageStore());
const { t } = useI18n();

function toggleFilterMenu() {
  showFilter.value = !showFilter.value;
}
</script>

<script lang='ts'>

export default { name: 'EcmStorageHeader', };
</script>