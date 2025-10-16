<template>
  <Dialog
    v-model:visible='visible'
    class='w-20rem'
    :header='t("hrm.profile.employeeActionOptions.setStatus")'
    modal>
    <div class='flex flex-column gap-3'>
      <div
        v-for='s in planStatusOption'
        :key='s.value'
        class='align-items-center flex'>
        <RadioButton
          v-model='statusRef'
          :input-id='s.value'
          name='status'
          :value='s.value'/>
        <label
          class='ml-2'
          :for='s.value'>{{ s.label }}</label>
      </div>
    </div>
    <template #footer>
      <Button
        :label='t("common.close")'
        severity='danger'
        @click='visible = false'/>
      <Button
        :label='t("common.confirm")'
        @click='submit'/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { settingPlanStatus } from '@/apps/hrm/api/graphql/planing';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  planingId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  }
});
const emits = defineEmits([ 'fetchData']);
const visible = defineModel('visible', {
  type: Boolean,
  default: false
});
const { t } = useI18n();
const statusRef = ref('');
const planStatusOption = [
  {
    label: 'Chờ duyệt',
    value: 'DRAFT'
  },
  {
    label: 'Đã duyệt',
    value: 'APPROVED'
  }
];

watch(() => [props.status, props.planingId], () => {
  statusRef.value = props.status;
}, { immediate: true });

function submit() {
  settingPlanStatus().mutate({
    id: props.planingId,
    status: statusRef.value
  }).then(() => {
    toastSuccess();
    emits('fetchData');
    visible.value = false;
  }).catch(() => {
    toastError();
  });
}
</script>

<style scoped>

</style>