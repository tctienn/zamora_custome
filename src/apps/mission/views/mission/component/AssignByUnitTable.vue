<template>
  <div>
    <label
      class='field font-semibold text-xl'>{{ t('mission.job.tableHeaderPersonal.titleUnit') }}</label>
    <DataTable
      class='mt-2 overflow-auto w-full'
      scroll-height='400px'
      scrollable
      show-gridlines
      striped-rows
      style='max-height: unset'
      :value='listOrganizations'>
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
        field='name'
        :header='t(`mission.job.properties.hostName`)'>
      </Column>
      <Column
        v-if='!isDetail'
        class='col-1 text-center'
        :header='t(`mission.job.properties.nameUnit`)'
        style='min-width: 10vw'>
        <template #body='{ data }'>
          <Checkbox
            :binary='true'
            :model-value='selectedIndexes[0] === data.id'
            @change='() => toggleSingleSelect(data.id)' />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { computed, type PropType, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { EnhancedOrganization } from '@/apps/mission/model/job/job';

const props = defineProps({
  levelOneOrganizations: {
    type: Array as PropType<OrganizationInterface[]>,
    required: false,
    default: () => []
  },
  selectedUnits: {
    type: Array as PropType<EnhancedOrganization[]>,
    default: () => []
  },
  isDetail: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['selectedUnit']);
const { t } = useI18n();
const selectedIndexes = ref<string[]>([]);
const selectedData = ref<EnhancedOrganization[]>([]);
const initialized = ref(false);

const initSelectedData = () => {
  if (
    !initialized.value
    && props.selectedUnits.length
    && props.levelOneOrganizations.length
  ) {
    selectedIndexes.value = props.selectedUnits.map((unit) => unit.assignId);
    selectedData.value = [...props.selectedUnits];
    emit('selectedUnit', selectedData.value);
    initialized.value = true;
  }
};

watchEffect(() => {
  if (!initialized.value) {
    initSelectedData();
  }
});

const toggleSingleSelect = (id: string) => {
  if (selectedIndexes.value[0] === id) {
    selectedIndexes.value = [];
  } else {
    selectedIndexes.value = [id];
  }
};
watch(selectedIndexes, (newSelectedIds) => {
  selectedData.value = props.levelOneOrganizations
    .filter((org) => newSelectedIds.includes(org.id))
    .map((org) => ({
      assignId: org.id,
      isMainHandle: true,
      isFollower: false
    }));
  emit('selectedUnit', selectedData.value);
});

const listOrganizations = computed(() => {
  return props.isDetail
    ? props.levelOneOrganizations.filter(org => selectedIndexes.value.includes(org.id))
    : props.levelOneOrganizations;
});
</script>

<style scoped>

:deep(.p-column-header-content) {
  display: inline-block;
}
</style>