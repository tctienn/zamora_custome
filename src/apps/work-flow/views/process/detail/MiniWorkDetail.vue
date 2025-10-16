<template>
  <div class='border-round grid grid-nogutter p-2 surface-ground'>
    <div class='col-12 p-1'>
      <label class='font-semibold'>{{ t('work-flow.work.name') }}:</label>
      {{ work.name }}
    </div>
    <div class='col-12 p-1'>
      <label class='font-semibold'>{{ t('work-flow.work.description') }}:</label>
      {{ work.description }}
    </div>
    <div class='align-items-center col-6 flex gap-2 p-1'>
      <label class='font-semibold'>{{ t('work-flow.work.createdBy') }}:</label>
      <AppUser
        name-visible
        :user-id='work.createdBy'/>
    </div>
    <div class='col-6 p-1'>
      <label class='font-semibold'>{{ t('work-flow.work.status') }}:</label>
      {{ t('work-flow.status.' + camelCase(work.status)) }}
    </div>

    <div class='col-6 p-1'>
      <label class='font-semibold'>{{ t('work-flow.work.startTime') }}:</label>
      {{ moment(work?.startTime).format('HH:mm:ss DD/MM/YYYY') }}
    </div>
    <div
      v-if='work?.deadLine'
      class='col-6 p-1'>
      <label class='font-semibold'>{{ t('work-flow.work.deadLine') }}:</label>
      {{ work?.deadLine ? moment(work?.deadLine).format('HH:mm:ss DD/MM/YYYY') : '' }}
    </div>
    <div
      v-if='work?.endTime'
      class='col-6 p-1'>
      <label class='font-semibold'>{{ t('work-flow.work.endTime') }}:</label>
      {{ work?.endTime ? moment(work?.endTime).format('HH:mm:ss DD/MM/YYYY') : '' }}
    </div>
  </div>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Work } from '@/apps/work-flow/model/process/work';
import AppUser from '@/common/components/app/AppUser.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  work: {
    type: Object as PropType<Work>,
    required: true
  }
});

const { moment } = useMoment();
const { t } = useI18n();
</script>

<style scoped>

</style>