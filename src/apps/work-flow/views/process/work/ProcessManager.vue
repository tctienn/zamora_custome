<template>
  <div class='flex flex-column gap-2'>
    <div class='align-items-center flex justify-content-between'>
      <div class='font-semibold text-lg'>{{ t('work-flow.process.manage') }}</div>
      <ButtonIcon
        icon='add'
        :label='t("common.create")'
        @click='creatorVisible=true'></ButtonIcon>
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
        v-model:selection='selectedWorks'
        data-key='id'
        highlight-on-select
        selection-mode='multiple'
        :value='works'
        v-bind='{...DEFAULT_DATATABLE_CONFIG, stripedRows: true}'>
        <template #empty>
          <EmptyResult>
            <h4>{{ t('work-flow.work.emptyMessage') }}</h4>
          </EmptyResult>
        </template>
        <Column
          body-class='text-center'
          class='w-4rem'
          selection-mode='multiple'/>
        <Column
          field='name'
          :header='t("work-flow.process.name")'>
          <template #body='{data}'>
            <div
              class='hover:text-primary w-full'
              @click='viewDetail(data.id)'>{{ data.name }}
            </div>
          </template>
        </Column>
        <Column
          body-class='text-center'
          class='w-10rem'
          field='priority'
          :header='t("work-flow.process.priorityName")'>
          <template #body='{data}'>
            <div class='align-items-center flex gap-2'>
              <AppIcon
                :class='getPriorityDisplay(data.priority)?.iconClass'
                :name='getPriorityDisplay(data.priority)?.icon'/>
              {{ getPriorityDisplay(data.priority)?.label }}
            </div>
          </template>
        </Column>
        <Column
          body-class='text-center'
          class='w-12rem'
          field='startTime'
          :header='t("work-flow.process.startTime")'>
          <template #body='{data}'>
            {{ data.startTime ? moment(data.startTime).format('HH:mm:ss DD/MM/YYYY') : '' }}
          </template>
        </Column>
        <Column
          body-class='text-center'
          class='w-12rem'
          field='deadLine'
          :header='t("work-flow.process.deadline")'>
          <template #body='{data}'>
            {{ data.deadLine ? moment(data.deadLine).format('HH:mm:ss DD/MM/YYYY') : '' }}
          </template>
        </Column>
        <Column
          field='description'
          :header='t("common.description")'></Column>
        <Column
          body-class='text-center'
          class='w-10rem'
          field='status'
          :header='t("common.status")'>
          <template #body='{data}'>
            <Badge
              class='uppercase'
              :severity='statusSeverity(data.status)'
              :value='t(`work-flow.status.${camelCase(data.status)}`)'>
            </Badge>
          </template>
        </Column>
        <Column
          body-class='text-center'
          class='w-8rem'
          :header='t("common.action")'>
          <template #body='{data}'>
            <ButtonIcon
              icon='more_vert'
              rounded
              text
              @click='openActionsMenu($event, data)'>
            </ButtonIcon>
          </template>
        </Column>
      </DataTable>
    </div>

  </div>
  <ProcessCreator
    v-model:visible='creatorVisible'
    @reload='refresh'/>
  <WorkAction
    ref='actionRef'
    :work-status='selectedWorks[0]?.status'
    @cancel-work-flow='confirmCancelWorkFlow'
    @delete-work-flow='confirmDeleteWorkFlow'
    @resume-work-flow='resume'
    @start-work-flow='startWorkFlow(selectedWorks[0]?.id as string).then(refresh)'
    @view-detail-work-flow='viewDetail(selectedWorks[0]?.id as string)'/>
</template>

<script lang='ts' setup>

import { camelCase } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { activeWorks, completedWorks } from '@/apps/work-flow/api/graphql/work';
import { type Work, WorkStatus } from '@/apps/work-flow/model/process/work';
import { getPriorityDisplay } from '@/apps/work-flow/views/process/priority';
import ProcessCreator from '@/apps/work-flow/views/process/work/ProcessCreator.vue';
import WorkAction from '@/apps/work-flow/views/process/work/WorkAction.vue';
import {
  cancelWorkFlow,
  deleteWorkFlow,
  resumeWorkFlow,
  startWorkFlow,
  viewDetail
} from '@/apps/work-flow/views/process/work-menu';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { confirm } from '@/common/helpers/custom-confirmation-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Connection } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const { moment } = useMoment();
const { t } = useI18n();
const creatorVisible = ref(false);
const works = ref<Work[]>([]);
const selectedWorks = ref<Work[]>([]);
const totalActive = computed((): number => (activeResult.value?.activeWorks as Connection<Work>)?.totalCount || 0);
const totalCompleted = computed((): number => (completedResult.value?.completedWorks as Connection<Work>)?.totalCount || 0);
const actionRef = ref<InstanceType<typeof WorkAction>>();

const tabMenus = computed((): MenuItem[] => [
  {
    label: t('work-flow.work.activeWorks'),
    icon: 'pi pi-play',
    count: totalActive.value
  },
  {
    label: t('work-flow.work.completedWorks'),
    icon: 'pi pi-check',
    count: totalCompleted.value
  }
]);
const activeTabIndex = ref(0);
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
} = activeWorks(pageable);
const {
  result: completedResult,
  onResult: onCompletedResult,
  refetch: reFetchCompleted,
  load: loadCompleted
} = completedWorks(pageable);
let reset = false;

function loadMore() {
  if (works.value.length >= totalActive.value) {
    return;
  }
  pageable.page++;
}

function refresh() {
  selectedWorks.value = [];
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
  const data = param.data?.activeWorks as Connection<Work>;
  if (data) {
    if (reset) {
      works.value = data.edges.map(edge => edge.node);
      reset = false;
    } else {
      works.value = [...works.value, ...data.edges.map(edge => edge.node)
        .filter(work => !works.value.find(w => w.id === work.id))];
    }
  }
});

onCompletedResult((param) => {
  if (activeTabIndex.value !== 1) {
    return;
  }
  const data = param.data?.completedWorks as Connection<Work>;
  if (data) {
    if (reset) {
      works.value = data.edges.map(edge => edge.node);
      reset = false;
    } else {
      works.value = [...works.value, ...data.edges.map(edge => edge.node)
        .filter(work => !works.value.find(w => w.id === work.id))];
    }
  }
});

function statusSeverity(status: WorkStatus): 'secondary' | 'info' | 'success' | 'warning' | 'danger' | 'contrast' {
  switch (status) {
  case WorkStatus.CREATED:
    return 'info';
  case WorkStatus.IN_PROGRESS:
    return 'warning';
  case WorkStatus.COMPLETED:
    return 'success';
  case WorkStatus.CANCELLED:
    return 'danger';
  default:
    return 'secondary';
  }
}

function openActionsMenu(event: Event, data: Work) {
  selectedWorks.value = [data];
  nextTick(() => actionRef.value?.showMenu(event));
}

function confirmDeleteWorkFlow() {
  if (selectedWorks.value.length !== 1) {
    return;
  }
  confirm({
    message: t('common.confirmDelete', {
      itemType: t('work-flow.work.process'),
      itemName: selectedWorks.value[0].name
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteWorkFlow(selectedWorks.value[0].id).then(refresh)
  });
}

function confirmCancelWorkFlow() {
  if (selectedWorks.value.length !== 1) {
    return;
  }
  confirm({
    message: t('common.confirmCancel', {
      itemType: t('work-flow.work.process'),
      itemName: selectedWorks.value[0].name
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => cancelWorkFlow(selectedWorks.value[0].id).then(refresh)
  });
}

function resume() {
  if (selectedWorks.value.length !== 1) {
    return;
  }
  resumeWorkFlow(selectedWorks.value[0].id).then(refresh);
}

onMounted(async () => {
  loadActive();
  loadCompleted();
  refresh();
});
</script>

<style scoped>

</style>