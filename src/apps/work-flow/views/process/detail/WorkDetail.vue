<template>
  <div class='flex flex-column gap-3 h-full relative'>
    <Toolbar class='p-2 z-1'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <Button
            v-tooltip.bottom='t("common.back")'
            :disabled='$router.getRoutes().length === 0'
            icon='pi pi-arrow-left'
            rounded
            text
            @click='$router.back()'/>
          <span class='text-lg'>
            {{ t('work-flow.work.name') }}:
            <span class='font-semibold'>
              {{ work?.name }}
            </span>
          </span>
        </div>

      </template>
      <template #end>
        <Button>View Flow</Button>
      </template>
    </Toolbar>
    <div
      class='grid overflow-y-auto'
      :style='`max-height: ${viewHeight}`'>
      <div class='col-8 flex flex-column gap-2'>
        <div class='border-round grid m-0 p-2 surface-card'>
          <div class='col-12'>
            <div class='font-semibold mb-2'>{{ t('work-flow.work.description') }}</div>
            <div class='mb-2'>{{ work?.description }}</div>
          </div>
          <div class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.work.createdBy') }}</div>
            <AppUser
              name-visible
              :user-id='work?.createdBy'/>
          </div>
          <div class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.work.status') }}</div>
            <div class='mb-2'>{{ work?.status ? t('work-flow.status.' + camelCase(work?.status)) : '' }}</div>
          </div>
          <div class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.work.startTime') }}</div>
            <div class='mb-2'>{{ work?.startTime ? moment(work?.startTime).format('HH:mm:ss DD/MM/YYYY') : '' }}</div>
          </div>
          <div
            v-if='work?.deadLine'
            class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.work.deadLine') }}</div>
            <div class='mb-2'>{{ work?.deadLine ? moment(work?.deadLine).format('HH:mm:ss DD/MM/YYYY') : '' }}</div>
          </div>
          <div
            v-if='work?.endTime'
            class='col-6'>
            <div class='font-semibold mb-2'>{{ t('work-flow.work.endTime') }}</div>
            <div class='mb-2'>{{ work?.endTime ? moment(work?.endTime).format('HH:mm:ss DD/MM/YYYY') : '' }}</div>
          </div>
        </div>
        <div
          v-if='work?.currentTasks'
          class='border-round p-2 surface-card'>
          <div class='font-semibold p-2 text-lg'>
            {{ t('work-flow.work.currentTasks') }}
          </div>
          <div
            class='bg-black-alpha-40 border-round gap-2 p-2 task-wrapper'>
            <MiniTaskDetail
              v-for='task in work?.currentTasks'
              :key='task.id'
              :task='task'
              @reload='refetch'/>
          </div>
        </div>

        <div
          v-if='work?.stepHistories'
          class='border-round p-2 surface-card'>
          <div class='font-semibold p-2 text-lg'>
            {{ t('work-flow.work.history') }}
          </div>
          <ProcessHistory :histories='work?.stepHistories'/>
        </div>
      </div>
      <div class='col-4'>
        <div class='border-round grid m-0 p-2 surface-card'>
          <div class='font-semibold p-2 text-lg'>
            {{ t('work-flow.work.objectInfo') }}
          </div>
          <DynamicObjectInfo
            v-if='work?.objectInfo'
            class='p-2'
            :model-value='work?.objectInfo'/>
        </div>

      </div>

      <div
        class='absolute flex gap-2 justify-content-center w-full'
        style='bottom: 0; left: 0'>
        <Button
          v-for='action in actions'
          :key='action.code'
          :class='action.class'
          :icon='action.icon'
          :label='action.label'
          @click='action?.command?.()'></Button>
      </div>
    </div>

  </div>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { computed, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getWork } from '@/apps/work-flow/api/graphql/work';
import type { Work } from '@/apps/work-flow/model/process/work';
import DynamicObjectInfo from '@/apps/work-flow/views/process/detail/object/DynamicObjectInfo.vue';
import ProcessHistory from '@/apps/work-flow/views/process/detail/ProcessHistory.vue';
import MiniTaskDetail from '@/apps/work-flow/views/process/detail/task/MiniTaskDetail.vue';
import {
  actionsMapping,
  cancelWorkFlow,
  deleteWorkFlow,
  resumeWorkFlow,
  startWorkFlow
} from '@/apps/work-flow/views/process/work-menu';
import AppUser from '@/common/components/app/AppUser.vue';
import { confirm } from '@/common/helpers/custom-confirmation-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { moment } = useMoment();
const id = computed(() => route.params['id'] as string);
const {
  result,
  refetch
} = getWork(id.value);
const work = computed(() => result.value?.work as Work);
provide('work', work);
const allActions = [
  {
    label: t('work-flow.work.startWorkFlow'),
    icon: 'pi pi-play',
    class: 'p-button-success',
    command: () => startWorkFlow(work.value?.id).then(() => refetch()),
    code: 'start',
  },
  {
    label: t('work-flow.work.cancelWorkFlow'),
    icon: 'pi pi-times',
    class: 'p-button-warning',
    command: confirmCancel,
    code: 'cancel',
  },
  {
    label: t('work-flow.work.resumeWorkFlow'),
    icon: 'pi pi-step-forward',
    class: 'p-button-success',
    command: () => resumeWorkFlow(work.value?.id).then(() => refetch()),
    code: 'resume',
  },
  {
    label: t('common.delete'),
    icon: 'pi pi-trash',
    class: 'p-button-danger',
    command: confirmDelete,
    code: 'delete',
  },
];

const actions = computed(() => allActions.filter(menu => actionsMapping[menu.code]?.includes(work.value?.status || '')));

const viewHeight = ref(calculateHeight());
window.onresize = () => viewHeight.value = calculateHeight();

function calculateHeight() {
  const height = window.innerHeight - 190;
  return `${height}px`;
}

function confirmDelete() {
  confirm({
    message: t('common.confirmDelete', {
      itemType: t('work-flow.work.process'),
      itemName: work.value?.name
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteWorkFlow(work.value?.id).then(() => router.back())
  });
}

function confirmCancel() {
  confirm({
    message: t('common.confirmCancel', {
      itemType: t('work-flow.work.process'),
      itemName: work.value?.name
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => cancelWorkFlow(work.value?.id).then(() => router.back())
  });

}
</script>

<style scoped>
.task-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
}
</style>