<template>
  <Dialog
    v-model:visible='visible'
    class='w-20rem'
    :header='t("hrm.contract.actionOptions.setStatus")'
    modal>
    <div class='flex flex-column gap-3'>
      <div
        v-for='s in Object.keys(ContractStatus)'
        :key='s'
        class='align-items-center flex'>
        <RadioButton
          v-model='statusRef'
          :disabled='isDisabled(s)'
          :input-id='s'
          name='status'
          :value='s'/>
        <label
          class='ml-2'
          :for='s'>{{ t(`hrm.contract.statusOptions.${camelcase(s)}`) }}</label>
      </div>
    </div>
    <template #footer>
      <Button
        :label='t("common.close")'
        severity='danger'
        @click='visible = false'/>
      <Button
        :disabled='statusRef == status'
        :label='t("common.confirm")'
        @click='submit'/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import camelcase from 'camelcase';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { setContractStatus } from '@/apps/hrm/api/graphql/contract';
import { ContractStatus } from '@/apps/hrm/model/contract';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  contractId: {
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

watch(() => [props.status, props.contractId], () => {
  statusRef.value = props.status;
}, { immediate: true });

const needRefresh = inject('needRefresh', ref(false));

function submit() {
  setContractStatus().mutate({
    id: props.contractId,
    status: statusRef.value
  })
    .then(() => {
      toastSuccess();
      needRefresh.value = true;
      visible.value = false;
    })
    .catch(() => {
      toastError();
    });
}

function isDisabled(s: string) {
  if (props.status === ContractStatus.VALID) {
    return [ContractStatus.NOT_YET_VALID].includes(s as ContractStatus);
  }

  if (props.status === ContractStatus.EXPIRED || props.status === ContractStatus.LIQUIDATED) {
    return [ContractStatus.EXPIRED, ContractStatus.LIQUIDATED, ContractStatus.VALID, ContractStatus.NOT_YET_VALID].includes(s as ContractStatus);
  }

  return false;
}
</script>

<style scoped>

</style>