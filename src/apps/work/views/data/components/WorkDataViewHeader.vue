<template>
  <div class='flex flex-column row-gap-2'>
    <div class='align-items-center column-gap-2 flex flex-row'>
      <ButtonIcon
        v-tooltip='t("work.create")'
        class='p-1'
        icon='add_circle'
        rounded
        text
        @click='actionMenu.toggle($event)'/>
      <h5 class='m-0'>{{ t('work.myWork') }}</h5>
      <div class='align-items-center column-gap-3 flex flex-row flex-wrap justify-content-end ml-auto'>
        <div class='col-xl-10'></div>
        <div class='actions mr-2'>
          <ButtonIcon
            v-tooltip.top='t("common.import")'
            icon='Publish'
            icon-size='1.7'
            rounded
            text
            @click='importExcelTask'/>
        </div>
        <div class='actions mr-4'>
          <ButtonIcon
            v-tooltip.top='t("common.export")'
            icon='Download'
            icon-size='1.7'
            rounded
            text
            @click='exportExcelTask'/>
        </div>
      </div>
    </div>

    <div class='align-items-center flex flex-row flex-wrap justify-content-between'>
      <div class='column-gap-2 column-gap-5 flex flex-row'>
        <span
          v-for='viewerType in viewerTypes'
          :key='viewerType.value'
          class='cursor-pointer hover:text-primary py-1'
          :class='{"font-bold text-primary": type === viewerType.value}'
          @click='emits("update-viewer-type", viewerType.value)'>
          {{ viewerType.label }}
        </span>
      </div>

      <div class=''>
        <InputText
          v-model='searchKeyword'
          class='bg-transparent border-round-3xl py-2 w-20rem'
          :placeholder='t("work.search")'/>
      </div>
    </div>

    <div class='align-items-center flex flex-row flex-wrap justify-content-between'>
      <div
        v-if='["WorkDataListView", "WorkDataCalendarView"].includes(type)'
        class='column-gap-5 flex flex-row flex-wrap'>
        <div
          class='align-items-center cursor-pointer flex gap-1 py-1'
          :class='{"text-primary font-bold": filterStatusId === "ALL"}'
          @click="handleChangeStatus('ALL')">
          <p>{{ t('common.all') }} ({{ sumBy(statusesCount, 'count') }})</p>
        </div>
        <div
          v-for='status in statusesCount'
          :key='status.id'
          class='align-items-center cursor-pointer flex gap-1 py-1'
          :class='{"text-primary font-bold": filterStatusId === status.id}'
          @click='handleChangeStatus(status.id)'>
          <p>{{ status.name }} ({{ status.count }})</p>
        </div>
      </div>

      <div class='align-items-center column-gap-3 flex flex-row flex-wrap justify-content-end ml-auto'>
        <div class='align-items-center column-gap-2 flex flex-row'>
          <label>{{ t('common.time') }}</label>
          <div class='align-items-center flex flex-row'>
            <Calendar
              v-model='dates.fromDate'
              class='p-0 w-7rem'
              input-class='text-sm bg-transparent border-none border border-bottom-1 shadow-none'
              input-id='searchFromDate'
              :manual-input='true'
              placeholder='dd/mm/yyyy'
              :show-button-bar='true'
              @update:model-value='updateDates($event, "from")'/>
            -
            <Calendar
              v-model='dates.toDate'
              class='p-0 w-7rem'
              input-class='text-sm bg-transparent border-none border border-bottom-1 shadow-none'
              input-id='searchFromDate'
              :manual-input='true'
              placeholder='dd/mm/yyyy'
              :show-button-bar='true'
              @update:model-value='updateDates($event, "to")'/>
          </div>
        </div>

        <div class=''>
          <Dropdown
            v-model='filter'
            class='py-0'
            option-label='label'
            :options='searchFilters'
            :placeholder='t("common.filter")'
            show-clear
            @change='searchFilterCondition'/>
        </div>
      </div>
    </div>
  </div>

  <ContextMenu
    ref='actionMenu'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </ContextMenu>
</template>

<script lang='ts' setup>
import { camelCase, map, sumBy } from 'lodash';
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { TASK_FILTER_HEADER } from '@/apps/work/constants';
import { ShowTypes } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { mapEnum } from '@/common/helpers/utils';

const props = defineProps({
  searchFromDate: {
    type: Date,
    default: new Date()
  },
  searchToDate: {
    type: Date,
    default: new Date()
  },
  type: {
    type: String,
    default: 'WorkDataListView'
  },
  columns: {
    type: Array as PropType<{ code: string, name: string }[]>,
    default: () => []
  },
  selectedColumns: {
    type: Array as PropType<{ code: string, name: string }[]>,
    default: () => []
  }
});
const emits = defineEmits(['update-viewer-type', 'update-range', 'open-save-task-dialog', 'open-quick-save-task-dialog', 'update-show-type']);

const router = useRouter();

const {
  filterStatusId,
  filterCondition,
  searchKeyword,
  statusesCount
} = storeToRefs(useTaskStore());

const { t } = useI18n();
const dates = ref({
  fromDate: props.searchFromDate,
  toDate: props.searchToDate
});

const actionMenu = ref();
const menuActions: MenuItem[] = [
  {
    label: t('work.quickCreate'),
    icon: 'variables',
    command: () => emits('open-quick-save-task-dialog')
  },
  {
    label: t('work.create'),
    icon: 'add_circle',
    command: () => emits('open-save-task-dialog')
  }
];

const viewerTypes = [
  {
    label: t('work.list'),
    value: 'WorkDataListView'
  },
  {
    label: t('work.kanban'),
    value: 'WorkDataKanbanView'
  },
  {
    label: t('work.calendar'),
    value: 'WorkDataCalendarView'
  },
  {
    label: t('common.file'),
    value: 'WorkDataFileView'
  },
];

const filter = ref<{ label: string, value: string }>();
const searchFilters = [
  {
    label: t('work.filter.expireDays', { count: 1 }),
    value: TASK_FILTER_HEADER.expiresIn1Days
  },
  {
    label: t('work.filter.expireDays', { count: 3 }),
    value: TASK_FILTER_HEADER.expiresIn3Days
  },
  {
    label: t('work.filter.expireDays', { count: 7 }),
    value: TASK_FILTER_HEADER.expiresIn7Days
  },
  {
    label: t('work.filter.expire'),
    value: TASK_FILTER_HEADER.expire
  },
  {
    label: t('work.filter.done'),
    value: TASK_FILTER_HEADER.done
  },
  {
    label: t('work.filter.assign'),
    value: TASK_FILTER_HEADER.assign
  },
  {
    label: t('work.filter.implement'),
    value: TASK_FILTER_HEADER.implement
  },
  {
    label: t('work.filter.takePartIn'),
    value: TASK_FILTER_HEADER.takePartIn
  }
];
const showTypeOptions = map(mapEnum(ShowTypes), (type) => ({
  value: type,
  label: t(`work.showType.${camelCase(type)}`)
}));

function updateDates(date: Date | undefined, type: 'from' | 'to') {
  if (!date) {
    return;
  }
  if (type === 'from') {
    emits('update-range', {
      fromDate: date,
      toDate: dates.value.toDate
    });
  }
  if (type === 'to') {
    emits('update-range', {
      fromDate: dates.value.fromDate,
      toDate: date
    });
  }
}

function handleChangeStatus(statusId: string) {
  filterStatusId.value = statusId;
}

function searchFilterCondition() {
  filterCondition.value = filter.value ? filter.value.value : '';
}

function exportExcelTask() {
  router.push({ name: 'FormTaskExport' });
}

function importExcelTask() {
  router.push({ name: 'FormTaskImport', });
}

</script>

<script lang='ts'>
export default { name: 'WorkDataViewHeader' };
</script>