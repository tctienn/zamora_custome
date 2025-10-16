<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div
          v-ripple
          class='align-items-center cursor-pointer flex justify-content-center p-ripple'
          style='height: 2.75rem; width: 2.75rem'
          @click='showReports = !showReports'>
          <i class='pi pi-bars'></i>
        </div>
        <div class='font-bold'>
          {{ t(`work.menu.${lastSegment}`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <ButtonGroup>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-sort'
            :label='t("common.quickFilter")'
            severity='secondary'
            @click='viewTypeRef?.toggle'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-export'
            :label='t("common.export")'
            severity='secondary'
            @click='exportDialogVisible = true'>
          </Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-refresh'
            :label='t("common.refresh")'
            severity='secondary'>
          </Button>
        </ButtonGroup>
      </div>
    </template>
  </Toolbar>
  <div class='flex gap-2 h-full mt-2 overflow-hidden w-full'>
    <div
      v-show='showReports'
      class='flex-shrink-0 h-full transition-all transition-duration-500 transition-ease-out w-25rem'>
      <Listbox
        v-model='selectedReport'
        option-value='code'
        :options='Reports'>
        <template #option='slotProps'>
          <router-link
            v-ripple
            :to='`/work/report/${slotProps.option.code}`'>
            <div :style='{color: selectedReport == slotProps.option?.code ? "#0d99ff" : ""}'>
              {{ slotProps.index + 1 }}. {{ t(`work.menu.${slotProps.option?.code}`) }}
            </div>
          </router-link>
        </template>
      </Listbox>
    </div>
    <div
      class='flex-1 h-full overflow-auto'
      style='border-radius: 6px'>
      <router-view/>
    </div>
  </div>

</template>

<script setup lang='ts'>
import type Menu from 'primevue/menu';
import { computed, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { Reports } from '@/apps/work/data/report';

const { t } = useI18n();
const showReports = ref(true);
const lastSegment = computed(() => {
  const parts = route.path.split('/');
  return parts[parts.length - 1];
});

const selectedReport = ref(lastSegment);

const exportDialogVisible = ref(false);
provide('exportDialogVisible', exportDialogVisible);

const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
provide('viewTypeRef', viewTypeRef);

const route = useRoute();

</script>

<style scoped>
:deep(.p-listbox) {
  height: 100%;
  border-radius: 4px;
}

:deep(.p-datatable .p-datatable-thead > tr > th ) {
  background: #F3F3F3 !important;
  font-weight: 800;
}

:deep(.p-datatable.p-datatable-hoverable-rows .p-datatable-tbody > tr:not(.p-highlight):hover) {
  background: #E5F3FF !important;
}

:deep(.p-datatable.p-datatable-hoverable-rows .p-datatable-tbody > tr:not(.p-highlight):hover .numDayExtend ) {
  background: #E5F3FF !important;
}

:deep(.p-datatable.p-datatable-hoverable-rows .p-datatable-tbody > tr:not(.p-highlight):hover .statusName) {
  background: #E5F3FF !important;
}

:deep(.p-datatable.p-datatable-hoverable-rows .p-datatable-tbody > tr:not(.p-highlight):hover .percent) {
  background: #E5F3FF !important;
}
</style>