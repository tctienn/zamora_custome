<template>
  <div class='col-6 item-grid p-2 pl-0 pt-0'>
    <div class='border-1 border-round-sm p-2 surface-border'>
      <div class='border-bottom-1 flex gap-2 justify-content-between surface-border'>
        <div
          class='font-medium mb-2'
          :class="{ 'text-red-300': decision.decisionType === 'DISCIPLINE', 'text-green-500': decision.decisionType === 'COMMENDATION' }">
          {{ formatDate(decision.decisionDate, 'DD/MM/YYYY') }}
          <span class='font-bold ml-2 text-lg'>{{ getDecisionTypes(decision.decisionType) }}</span>
        </div>
        <DecisionGridItemActions
          :decision='decision'
          @view-detail='viewDetail'/>
      </div>
      <div class='p-4'>
        <div
          v-for='(field, idx) in infoFields'
          :key='idx'
          class='col-12 flex gap-2 pb-1 pl-0'>
          <div class='font-medium w-12rem'>{{ field.label }}</div>
          <div class='font-semibold'>: {{ field.value }}</div>
        </div>
        <div class='mt-3'>
          <div class='font-medium mb-2'>Tệp đính kèm :</div>
          <div class='flex flex-wrap gap-4'>
            <div
              v-for='(file, index) in decision.files'
              :key='index'
              class='align-items-center border-1 border-round cursor-pointer file-item flex flex-column p-2 surface-border w-8rem'
              @click="emit('view-detail-file', file)">
              <i class='mb-1 pi pi-file-pdf text-3xl text-red-500'></i>
              <div class='text-600 text-center text-xs truncate w-full'>{{ file.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DecisionGridItemActions
  from '@/apps/hrm/views/profile/detail/detailComponent/decisionByEmployee/DecisionGridItemActions.vue';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps<{
  decision: any;
  getDecisionTypes: (type: string) => string | undefined;
}>();
const emit = defineEmits(['view-detail', 'view-detail-file']);

const infoFields = [
  {
    label: 'Số quyết định',
    value: props.decision.noDecision
  },
  {
    label: 'Ngày quyết định',
    value: props.decision.decisionDate
  },
  {
    label: 'Loại quyết định',
    value: props.getDecisionTypes(props.decision.decisionType)
  },
  {
    label: 'Cấp ra quyết định',
    value: props.decision.decisionMakingLevelName
  },
  {
    label: 'Ngày hiệu lực',
    value: formatDate(props.decision.effectStartDate, 'DD/MM/YYYY')
  },
  {
    label: 'Ngày hết hạn',
    value: formatDate(props.decision.effectEndDate, 'DD/MM/YYYY')
  },
  {
    label: 'Người ký',
    value: props.decision.signerId
  },
];
const viewDetail = () => {
  emit('view-detail', props.decision);
};
</script>

<style scoped>
.file-item:hover {
  background-color: #E5F3FF;
}
</style>
