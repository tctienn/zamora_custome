<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='px-3'>
          Camera Device
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
      <Column
        class='text-center'
        :header='t("common.ordinalNumber")'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>
      <Column
        field='name'
        :header='t("common.name")'></Column>
      <Column
        field='placeName'
        :header='t("hrm.camera.device.place")'></Column>
      <Column
        class='text-center'
        field='useForCheckin'
        :header='t("hrm.camera.device.useForCheckin")'>
        <template #body='{data}'>
          <i
            v-if='data["useForCheckin"]'
            class='pi pi-check'></i>
        </template>
      </Column>
      <Column
        class='text-center'
        :header="t('common.action')"
        style='min-width: 7vw'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_horiz'
            icon-size='1.7'
            rounded
            text
            @click='toggleActionMenu($event, data)'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script lang='ts' setup>

import Column from 'primevue/column';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { cameraDevices, setUseForCheckin, syncCameraDevices } from '@/apps/hrm/api/graphql/camera';
import type { CameraDevice } from '@/apps/hrm/model/camera';
import type { IBookingCar } from '@/apps/vehicle/model/bookingCar';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const {
  result,
  refetch
} = cameraDevices();
const data = computed(() => result.value?.cameraDevices as CameraDevice[] || []);
const isSyncing = ref(false);
const menuRef = ref();
const selectedRow = ref<any>();

function sync() {
  isSyncing.value = true;
  syncCameraDevices().mutate()
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

const {
  mutate: setUseForCheckinMutate,
  onDone: setUseForCheckinDone,
} =
  setUseForCheckin();

const setCamUseForCheckin = (id: string) => {
  setUseForCheckinMutate({ id });
};

setUseForCheckinDone(() => {
  refetch();
  toastSuccess();
});

function toggleActionMenu(event: Event, data: IBookingCar) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const menuActions = [
  {
    key: 'setUseForCheckin',
    label: 'Dùng để chấm công',
    icon: 'edit',
    command: () => {
      setCamUseForCheckin(selectedRow.value.id);
    },
  },
];
</script>

<style scoped>

</style>