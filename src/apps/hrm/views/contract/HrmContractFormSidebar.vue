<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width: 70rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          <div class='p-sidebar-header-content'>
            {{ t('hrm.contract.title') }}
          </div>
        </div>

        <Button
          icon='pi pi-save'
          :label='t("common.save")'
          @click='save'/>
      </div>
    </template>
    <HrmContractForm
      ref='formRef'
      v-model='model'
      class='mt-2'/>
  </Sidebar>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import { inject, type PropType, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Contract } from '@/apps/hrm/model/contract';
import HrmContractForm from '@/apps/hrm/views/contract/form/HrmContractForm.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { scrollToError } from '@/common/helpers/errorHelper';

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const model = defineModel({ type: Object as PropType<Contract> });
const v$: Ref<Validation> = useVuelidate();
const formRef = ref<InstanceType<typeof HrmContractForm>>();
const needRefresh = inject('needRefresh', ref(false));
const resetData = inject('resetData', () => void {});

async function save() {
  v$.value.$touch();
  const isValid = await v$.value.$validate();
  if (!isValid) {
    scrollToError();
    return;
  }
  if (formRef.value) {
    formRef.value.submitForm().then(() => {
      toastSuccess();
      visible.value = false;
      needRefresh.value = true;
      resetData();
    }).catch(() => {
      toastError();
    });
  }
}

function hideForm() {
  visible.value = false;
  resetData();
}
</script>

<style scoped>

</style>
