<template>
  <div
    v-if='data'
    class='border-round-xl formgrid gap-2 grid grid-nogutter health-info hover:surface-100 mb-1 p-3'>
    <div class='align-items-center col-12 flex justify-content-between'>
      <div class='bg-pink-50 border-round-2xl flex gap-2 px-3 py-2'>
        <span style='color: black'>{{ t('hrm.health.updateDate') }}: </span>
        <span class='font-bold text-blue-400'>{{
          data.updateDate && moment(data.updateDate).format('DD/MM/YYYY')
        }}</span>
      </div>
      <div
        v-if='!isView'
        class='cursor-pointer flex gap-1 gr-btn'>
        <AppIcon
          v-tooltip.top='"Sửa"'
          name='edit'
          size='1.5'
          @click='showForm = true'/>
        <AppIcon
          v-tooltip.top="t('common.delete')"
          class='text-red-400'
          name='delete'
          size='1.5'
          @click='confirmDeleteWorkProcess'/>
      </div>
    </div>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.height')"
      :value='data.height'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.weight')"
      :value='data.weight'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.bloodType')"
      :value='data.bloodType'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.bloodPressure')"
      :value='data.bloodPressure'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.heartRate')"
      :value='data.heartRate'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.healthStatus')"
      :value='data.healthStatus'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.cholesterol')"
      :value='data.cholesterol'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.triglycerid')"
      :value='data.triglycerid'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.bloodSugarLevel')"
      :value='data.bloodSugarLevel'/>
    <LabelDisplay
      class='col-4'
      :label="t('hrm.health.waist')"
      :value='data.waist'/>
  </div>

  <HealthForm
    v-if='showForm'
    :data='data'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>

import { useConfirm } from 'primevue/useconfirm';
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteEmployeeHealth } from '@/apps/hrm/api/graphql/employee-health';
import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeeHealth } from '@/apps/hrm/model/employee';
import HealthForm from '@/apps/hrm/views/profile/form/health/HealthForm.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  data: {
    type: Object as PropType<EmployeeHealth>,
    required: true,
  },
  isView: {
    type: Boolean,
    default: false,
  },
});
const { moment } = useMoment();
const { t } = useI18n();
const showForm = ref(false);
const injectedRefreshTable = inject('refreshHealthFormTab', ref(false));

function hideDialogFn() {
  showForm.value = false;
  injectedRefreshTable.value = true;
}

const {
  mutate: deleteEmployeeHealthMutate,
  onDone: deleteEmployeeHealthDone,
} =
    deleteEmployeeHealth();
const confirm = useConfirm();
const confirmDeleteWorkProcess = () => {
  confirm.require({
    message: t('common.confirmDelete'),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteWorkProcess();
    },
  });
};

const handleDeleteWorkProcess = () => {
  deleteEmployeeHealthMutate({ id: props.data.id });
};

deleteEmployeeHealthDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  injectedRefreshTable.value = true;
});
</script>

<style scoped>
:deep(.col-12) {
  padding: unset !important;
}

.gr-btn {
  visibility: hidden;
}

.health-info:hover {
  .gr-btn {
    visibility: visible;
  }
}
</style>