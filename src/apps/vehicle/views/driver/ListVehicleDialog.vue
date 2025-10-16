<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visibleForm'
    header='Danh sách xe'
    @hide="emits('hide-dialog')">
    <DataTable
      v-model:selection='selectedVehicles'
      class='mb-6'
      :pt='{
        header: {
          class: "pt-0"
        }
      }'
      selection-mode='multiple'
      :value='filteredVehicles'>
      <template #header>
        <div class='flex justify-content-start'>
          <IconField icon-position='left'>
            <InputIcon>
              <i class='pi pi-search'/>
            </InputIcon>
            <InputText
              v-model='filter'
              placeholder='Tìm xe'/>
          </IconField>
        </div>
      </template>
      <Column
        header-style='width: 3rem'
        selection-mode='multiple'></Column>
      <Column
        class='text-center'
        header='TT'
        style='width: 5%'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column
        class='text-center'
        field='licensePlate'
        header='Biển số'></Column>
      <Column
        class='text-center'
        header='Hãng xe/Dòng xe'>
        <template #body='{data}'>
          {{ data.vehicleBranch }}/{{ data.vehicleType }}
        </template>
      </Column>
      <Column
        class='text-center'
        field='numberOfSeats'
        header='Số chỗ ngồi'></Column>
      <Column
        class='text-center'
        field='yearOfManufacture'
        header='Năm SX'></Column>
    </DataTable>
    <div
      class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
      style='width: 96%'>
      <Button
        class='p-button-plain'
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-save'
        :label="t('common.save')"
        @click='submit'/>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllVehicle } from '@/apps/vehicle/api/graphql/vehicle';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  selectedVehicleIds: {
    type: Array,
    default: () => [],
  }
});
const emits = defineEmits(['hide-dialog', 'selected-vehicles']);
const filter = ref('');
const vehicles = ref();
const filteredVehicles = ref([]);
const { t } = useI18n();
const visibleForm = ref(props.visibleDialog);
const selectedVehicles = ref<any>([]);

const { onResult: getAllVehicleResult } = getAllVehicle();
getAllVehicleResult((res) => {
  vehicles.value = res.data.getAllVehicle;
  filteredVehicles.value = vehicles.value;
});

const vehicleIds = computed(() =>
  selectedVehicles.value.map((v: any) => v.id)
);

const submit = () => {
  emits('selected-vehicles', vehicleIds.value);
  emits('hide-dialog');
};

watch(
  () => [vehicles, props.selectedVehicleIds],
  () => {
    if (!vehicles.value || !props.selectedVehicleIds) {
      return;
    }
    selectedVehicles.value = vehicles.value.filter((v: any) =>
      props.selectedVehicleIds.includes(v.id)
    );
  },
  {
    immediate: true,
    deep: true
  }
);

watch(filter, (newKeyword) => {
  const value = newKeyword.toLowerCase().trim();
  filteredVehicles.value = vehicles.value.filter((v: any) =>
    v.licensePlate?.toLowerCase().includes(value)
    || v.vehicleBranch?.toLowerCase().includes(value)
    || v.vehicleType?.toLowerCase().includes(value)
  );
});

</script>

<style scoped>

</style>