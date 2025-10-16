<template>
  <div class='flex flex-column gap-2'>
    <div class='flex justify-content-between'>
      <p>Task Manager</p>
    </div>
    <div>
      <TabMenu
        v-model:activeIndex='activeTabIndex'
        :model='tabMenus'
        @tab-change='refresh'>
        <template #item='{item, active}'>
          <a
            v-ripple
            class='align-items-center border-bottom-2 border-transparent flex font-bold gap-2 p-2 surface-card transition-duration-200 transition-linear'
            :class='{"text-primary": active, "border-primary": active}'>
            <i :class='item.icon'></i>
            {{ item.label }}
            <Avatar
              class='line-height-1'
              :label='item?.count?.toString() || "0"'
              shape='circle'/>
          </a>

        </template>
      </TabMenu>
      <DataTable
        v-model:selection='selectedTasks'
        data-key='id'
        highlight-on-select
        selection-mode='multiple'
        :value='tasks'
        v-bind='{...DEFAULT_DATATABLE_CONFIG, stripedRows: true}'>
        <template #empty>
          <EmptyResult>
            <h4>{{ t('work-flow.task.emptyMessage') }}</h4>
          </EmptyResult>
        </template>
        <Column
          body-class='text-center'
          class='w-4rem'
          selection-mode='multiple'/>
        <Column
          field='name'
          :header='t("work-flow.task.name")'>
          <template #body='{data}'>
            <div
              class='hover:text-primary w-full'
              @click='viewDetail(data.id)'>{{ data.name }}
            </div>
          </template>
        </Column>
        <Column
          field='work.name'
          :header='t("work-flow.work.name")'>
          <template #body='{data}'>
            <div
              class='hover:text-primary w-full'
              @click='viewDetail(data.id)'>{{ data.work.name }}
            </div>
          </template>
        </Column>
        <Column
          body-class='text-center'
          class='w-12rem'
          field='startTime'
          :header='t("work-flow.task.startTime")'>
          <template #body='{data}'>
            {{ data.startTime ? moment(data.startTime).format('HH:mm:ss DD/MM/YYYY') : '' }}
          </template>
        </Column>
        <Column
          body-class='text-center'
          class='w-12rem'
          field='endTime'
          :header='t("work-flow.task.endTime")'>
          <template #body='{data}'>
            {{ data.endTime ? moment(data.endTime).format('HH:mm:ss DD/MM/YYYY') : '' }}
          </template>
        </Column>
        <Column
          body-class='text-center'
          class='w-10rem'
          field='priority'
          :header='t("work-flow.work.priority")'>
          <template #body='{data}'>
            <div class='align-items-center flex gap-2'>
              <AppIcon
                :class='getPriorityDisplay(data.work.priority)?.iconClass'
                :name='getPriorityDisplay(data.work.priority)?.icon'/>
              {{ getPriorityDisplay(data.work.priority)?.label }}
            </div>
          </template>
        </Column>
        <Column
          body-class='text-center'
          class='w-10rem'
          field='status'
          :header='t("common.status")'></Column>
        <Column
          v-if='activeTabIndex===1'
          body-class='text-center'
          class='w-10rem'
          field='result'
          :header='t("work-flow.task.result")'></Column>
      </DataTable>
    </div>

    <div>

    </div>
  </div>
</template>

<script lang='ts' setup>

import type { MenuItem } from 'primevue/menuitem';
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { activeTasks, completedTasks } from '@/apps/work-flow/api/graphql/task';
import type { Task } from '@/apps/work-flow/model/process/work';
import { getPriorityDisplay } from '@/apps/work-flow/views/process/priority';
import { viewDetail } from '@/apps/work-flow/views/process/task-menu';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Connection } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n();
const { moment } = useMoment();
const selectedTasks = ref<Task[]>([]);
const tasks = ref<Task[]>([]);
const pageable = reactive<Pageable>({
  page: 0,
  size: 20,
  sort: [
    {
      property: 'lastModifiedTime',
      direction: Direction.DESC
    }
  ]
});
const {
  result: activeResult,
  onResult: onActiveResult,
  refetch: reFetchActive,
  load: loadActive
} = activeTasks(pageable);
const {
  result: completedResult,
  onResult: onCompletedResult,
  refetch: reFetchCompleted,
  load: loadCompleted
} = completedTasks(pageable);
let reset = false;
const totalActive = computed((): number => (activeResult.value?.activeTasks as Connection<Task>)?.totalCount || 0);
const totalCompleted = computed((): number => (completedResult.value?.completedTasks as Connection<Task>)?.totalCount || 0);
const tabMenus = computed((): MenuItem[] => [
  {
    label: t('work-flow.task.activeTasks'),
    icon: 'pi pi-play',
    count: totalActive.value
  },
  {
    label: t('work-flow.task.completedTasks'),
    icon: 'pi pi-check',
    count: totalCompleted.value
  }
]);
const activeTabIndex = ref(0);

function refresh() {
  reset = true;
  if (pageable.page === 0) {
    reFetchActive({ pageable });
    reFetchCompleted({ pageable });
  } else {
    pageable.page = 0;
  }
}

onActiveResult((param) => {
  if (activeTabIndex.value !== 0) {
    return;
  }
  const data = param.data?.activeTasks as Connection<Task>;
  if (data) {
    if (reset) {
      tasks.value = data.edges.map(edge => edge.node);
      reset = false;
    } else {
      tasks.value = [...tasks.value, ...data.edges.map(edge => edge.node)
        .filter(task => !tasks.value.find(t => t.id === task.id))];
    }
  }
});

onCompletedResult((param) => {
  if (activeTabIndex.value !== 1) {
    return;
  }
  const data = param.data?.completedTasks as Connection<Task>;
  if (data) {
    if (reset) {
      tasks.value = data.edges.map(edge => edge.node);
      reset = false;
    } else {
      tasks.value = [...tasks.value, ...data.edges.map(edge => edge.node)
        .filter(task => !tasks.value.find(t => t.id === task.id))];
    }
  }
});

onMounted(() => {
  loadActive() && loadCompleted() || refresh();
});
</script>

<style scoped>

</style>