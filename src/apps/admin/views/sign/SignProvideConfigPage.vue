<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.sign.title') }}
        </div>
      </div>
    </template>

  </Toolbar>
  <div
    class='align-items-start border-round-sm flex flex-column gap-2 h-full p-2 surface-0 w-full'>
    <div class='align-items-center flex gap-3'>
      {{ t('admin.sign.chooseProviderDescription') }}:
      <NamedDropdown
        v-model='provider'
        class='w-12rem'
        name='caName'
        option-label='label'
        option-value='code'
        :options='caProviders'/>
      <Button
        icon='pi pi-save'
        :label='t("common.save")'
        @click='save'></Button>
    </div>

  </div>

</template>

<script lang='ts' setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getSignProvideConfig, saveSignProvideConfig } from '@/apps/admin/api/rest/sign-provide-config';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();

const caProviders = [
  {
    label: 'Esign NEAC',
    code: 'E_SIGN'
  },
  {
    label: 'Viettel CA',
    code: 'VIETTEL_CA'
  },
];
const provider = ref<string>(caProviders[0].code);
getSignProvideConfig()
  .then(a => {
    if (a) {
      provider.value = a;
    }
  });

function save() {
  saveSignProvideConfig(provider.value)
    .then(() => toastSuccess())
    .catch(() => toastError());
}
</script>

<style scoped>

</style>