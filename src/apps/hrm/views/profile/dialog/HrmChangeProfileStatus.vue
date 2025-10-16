<template>
  <Dialog
    v-model:visible='visible'
    class='w-20rem'
    :header='t("hrm.profile.employeeActionOptions.setStatus")'
    modal>
    <div class='flex flex-column gap-3'>
      <div
        v-for='s in Object.keys(EmployeeWorkingStatus)'
        :key='s'
        class='align-items-center flex'>
        <RadioButton
          v-model='statusRef'
          :input-id='s'
          name='status'
          :value='s'/>
        <label
          class='ml-2'
          :for='s'>{{ t(`hrm.profile.employeeStatusOptions.${camelcase(s)}`) }}</label>
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
import camelcase from 'camelcase';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { changeEmployeeWorkingStatus } from '@/apps/hrm/api/graphql/employee';
import { EmployeeWorkingStatus } from '@/apps/hrm/model/employee';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const props = defineProps({
  employeeId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  }
});
const visible = defineModel('visible', {
  type: Boolean,
  default: false
});
const { t } = useI18n();
const statusRef = ref('');
const { callRefetchCountTable, callRefetchCountTree } = useHrmProfileStore();
watch(() => [props.status, props.employeeId], () => {
  statusRef.value = props.status;
}, { immediate: true });

const needRefresh = inject('needRefresh', ref(false));

function submit() {
  changeEmployeeWorkingStatus().mutate({
    id: props.employeeId,
    status: statusRef.value
  }).then(() => {
    toastSuccess();
    callRefetchCountTable();
    callRefetchCountTree();
    needRefresh.value = true;
    visible.value = false;
  }).catch(() => {
    toastError();
  });
}
</script>

<style scoped>

</style>