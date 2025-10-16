<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='px-3'>
          Camera Location
        </div>
      </template>
      <template #end>
        <div class='align-items-center btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            class='btn-create focus:shadow-none font-medium p-2'
            :icon='"pi pi-sync " + (isSyncing ? "pi-spin": "")'
            :label='t("common.sync")'
            @click='sync'></Button>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            icon='pi pi-refresh'
            label='Refresh'
            severity='secondary'
            @click='refetch'></Button>
        </div>
      </template>
    </Toolbar>
    <DataTable :value='data'>
      <Column :header='t("common.ordinalNumber")'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>
      <Column
        field='name'
        :header='t("common.name")'></Column>
      <Column
        field='address'
        :header='t("common.address")'></Column>
    </DataTable>
  </div>
</template>

<script lang='ts' setup>

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { cameraPlaces, syncCameraPlaces } from '@/apps/hrm/api/graphql/camera';
import type { Place } from '@/apps/hrm/model/camera';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const {
  result,
  refetch
} = cameraPlaces();
const data = computed(() => result.value?.cameraPlaces as Place[] || []);
const isSyncing = ref(false);

function sync() {
  isSyncing.value = true;
  syncCameraPlaces().mutate()
    .then(() => {
      isSyncing.value = false;
      refetch();
      toastSuccess();
    })
    .catch(() => {
      isSyncing.value = false;
      toastError();
    });
}
</script>

<style scoped>

</style>