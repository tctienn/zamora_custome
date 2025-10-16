<template>
  <div>
    <label
      class='field font-semibold text-xl'>{{ t('mission.job.tableHeaderPersonal.titlePersonal') }}</label>
    <div class='field mt-2'>
      <InputText
        v-model='searchQuery'
        class='p-component p-inputtext w-full'
        placeholder='Nhập tên nhân sự...' />
    </div>

    <DataTable
      class='overflow-y-auto w-full'
      scroll-height='400px'
      scrollable
      show-gridlines
      striped-rows
      :value='filteredList'>
      <Column
        class='text-center'
        header='STT'
        style='width: 5%'>
        <template #body='slotProps'>
          <div class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>

      <Column
        class='text-center'
        :header='t("mission.job.tableHeaderPersonal.mainHandler")'
        style='width: 15%'>
        <template #body='{ data }'>
          <Checkbox
            :binary='true'
            :disabled='isDetail'
            :model-value='selectedAssignments[data.id]?.isMainHandle || false'
            @change="() => toggleAssignment(data.id, 'main')" />
        </template>
      </Column>

      <Column
        class='text-center'
        :header='t("mission.job.tableHeaderPersonal.follower")'
        style='width: 20%'>
        <template #body='{ data }'>
          <Checkbox
            :binary='true'
            :disabled='isDetail'
            :model-value='selectedAssignments[data.id]?.isFollower || false'
            @change="() => toggleAssignment(data.id, 'follower')" />
        </template>
      </Column>

      <Column
        class='text-left'
        field='fullName'
        :header='t("mission.job.tableHeaderPersonal.fullName")'
        style='width: 25%' />
      <Column
        class='text-left'
        field='positionName'
        :header='t("mission.job.tableHeaderPersonal.positionName")'
        style='width: 18%' >
        <template #body='{ data }'>
          <div
            v-for='(item, index) in data.positionName'
            :key='index'>
            <span>{{ item }}</span>
          </div>
        </template>
      </Column>
      <Column
        class='text-left'
        field='departmentName'
        :header='t("mission.job.tableHeaderPersonal.departmentName")'
        style='width: 18%' />
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import { computed, ref } from 'vue';
import { type PropType } from 'vue';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { EnhancedOrganization, PersonalInterface } from '@/apps/mission/model/job/job';

const props = defineProps({
  listPersonal: {
    type: Array as PropType<PersonalInterface[]>,
    default: () => []
  },
  selectedPersonal: {
    type: Array as PropType<EnhancedOrganization[]
    >,
    default: () => []
  },
  isDetail: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['selectedPersonal']);
const { t } = useI18n();
const searchQuery = ref('');
const selectedAssignments = ref<Record<string, { isMainHandle: boolean; isFollower: boolean }>>({});

watch(
  () => props.selectedPersonal,
  () => initAssignmentsFromProps(),
  { immediate: true }
);

function initAssignmentsFromProps() {
  const result: Record<string, { isMainHandle: boolean; isFollower: boolean }> = {};
  props.selectedPersonal.forEach((item) => {
    result[item.assignId] = {
      isMainHandle: item.isMainHandle,
      isFollower: item.isFollower
    };
  });
  selectedAssignments.value = result;
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const filteredList = computed(() =>
  props.listPersonal.filter((person) =>
    removeVietnameseTones(person.fullName).toLowerCase().includes(
      removeVietnameseTones(searchQuery.value).toLowerCase()
    )
  )
);

const toggleAssignment = (id: string, type: 'main' | 'follower') => {
  const current = selectedAssignments.value[id] || {
    isMainHandle: false,
    isFollower: false 
  };

  if (type === 'main') {
    Object.keys(selectedAssignments.value).forEach(key => {
      selectedAssignments.value[key].isMainHandle = false;
      if (
        !selectedAssignments.value[key].isMainHandle
      && !selectedAssignments.value[key].isFollower
      ) {
        delete selectedAssignments.value[key];
      }
    });
    selectedAssignments.value[id] = {
      isMainHandle: !current.isMainHandle,
      isFollower: false
    };
    if (!selectedAssignments.value[id].isMainHandle) {
      delete selectedAssignments.value[id];
    }
  } else if (type === 'follower') {
    selectedAssignments.value[id] = {
      isMainHandle: false,
      isFollower: !current.isFollower
    };
  }

  if (
    !selectedAssignments.value[id].isMainHandle
    && !selectedAssignments.value[id].isFollower
  ) {
    delete selectedAssignments.value[id];
  }

  emitSelected();
};

const emitSelected = () => {
  const result = Object.entries(selectedAssignments.value).map(([id, flags]) => ({
    assignId: id,
    ...flags
  }));
  emit('selectedPersonal', result);
};
</script>

<style scoped>
:deep(.p-column-header-content) {
  display: inline-block;
}

:deep(.p-datatable-wrapper){
  margin-top: -0.5px;
}
</style>
