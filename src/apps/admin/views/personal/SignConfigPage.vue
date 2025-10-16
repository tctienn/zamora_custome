<template>
  <TabView>
    <TabPanel header='Ký số'>
      <div>
        <h5>{{ t('admin.user.userDetail.signConfigCA') }}</h5>
      </div>
      <form
        ref='formRef'
        @submit.prevent='save'>
        <component
          :is='signConfigComponents[signConfigProvider as keyof typeof signConfigComponents]'
          v-model='signConfig'/>
        <div class='grid md:justify-content-center mt-5'>
          <Button
            class='ml-3'
            icon='pi pi-check'
            :label='t("common.save")'
            type='submit'/>
        </div>
      </form>
    </TabPanel>

    <TabPanel header='Ký điện tử'>
      <div>
        <h5>{{ t('admin.user.userDetail.signConfigDigital') }}</h5>
      </div>
      <form
        ref='formRef'
        @submit.prevent='saveSignature'>
        <div class='flex gap-8 justify-content-center'>
          <div class='field'>
            <label class='font-bold'>{{ t('admin.user.mainSign') }}</label>
            <LogoUpload
              :avatar-url='urlMainSign'
              name-image='mainSign'
              @is-change='changeMainSign'/>
            <input
              name='isMainSignChange'
              type='hidden'
              :value='isMainSignChange'/>
          </div>

          <div class='field'>
            <label class='font-bold'>{{
              t('admin.user.flashingSignature')
            }}</label>
            <LogoUpload
              :avatar-url='urlFlashingSignature'
              name-image='flashingSignature'
              @is-change='changeFlashingSignature'/>
            <input
              name='isFlashingSignatureChange'
              type='hidden'
              :value='isFlashingSignatureChange'/>
          </div>
        </div>
        <div class='grid md:justify-content-center mt-5'>
          <Button
            class='ml-3'
            icon='pi pi-check'
            :label='t("common.save")'
            type='submit'/>
        </div>
      </form>
    </TabPanel>
  </TabView>

</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findPersonal } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getSignConfig, saveSignConfig } from '@/apps/admin/api/rest/sign-config';
import { getSignProvideConfig } from '@/apps/admin/api/rest/sign-provide-config';
import { updateSignature } from '@/apps/admin/api/rest/userApi';
import { getVtSignConfig, saveVtSignConfig } from '@/apps/admin/api/rest/vt-sign-config';
import type { ISignConfig } from '@/apps/admin/model/sign-config';
import SignConfig from '@/apps/admin/views/personal/SignConfig.vue';
import VtSignConfig from '@/apps/admin/views/personal/VtSignConfig.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { getPreviewFile } from '@/common/helpers/file-utils';
import LogoUpload from '@/common/views/logo/LogoUpload.vue';

const { t } = useI18n();
const signConfig = ref<ISignConfig>({} as ISignConfig);
const formRef = ref<HTMLFormElement>();
const signConfigProvider = ref<string>('');
const person = ref();
let isMainSignChange = ref(false);
let isFlashingSignatureChange = ref(false);
const signConfigComponents = {
  'E_SIGN': SignConfig,
  'VIETTEL_CA': VtSignConfig
};

findPersonal().onResult((res) => {
  person.value = res.data.findPersonal;
});
const urlFlashingSignature = computed(() =>
  getPreviewFile(person.value?.flashingSignature ?? ''),
);

const urlMainSign = computed(() => getPreviewFile(person.value?.mainSign ?? ''));

getSignProvideConfig().then(rs => {
  if (rs) {
    signConfigProvider.value = rs;
  }
});

function saveSignature() {
  const data = new FormData(formRef.value);
  updateSignature(data).then(res => {
    if (res) {
      toastSuccess();
    }
  });
}

function changeFlashingSignature() {
  isFlashingSignatureChange.value = true;
}

function changeMainSign() {
  isMainSignChange.value = true;
}

function save() {
  const data = new FormData(formRef.value);
  let func;
  switch (signConfigProvider.value) {
  case 'E_SIGN':
    func = saveSignConfig;
    break;
  case 'VIETTEL_CA':
    func = saveVtSignConfig;
    break;
  }

  func && func(data).then(rs => {
    if (rs) {
      toastSuccess();
      signConfig.value = cloneDeep(rs);
    }
  })
    .catch(error => {
      switch (error.code) {
      case 'noData':
        toastError({ message: t('admin.user.userDetail.error.caNoData') });
        break;
      case 'signatureRequired':
        toastError({ message: t('admin.user.userDetail.error.signatureRequired') });
        break;
      default:
        toastError();
        break;
      }
    });
}

function getSignConfigByProvider() {
  let func;
  switch (signConfigProvider.value) {
  case 'E_SIGN':
    func = getSignConfig;
    break;
  case 'VIETTEL_CA':
    func = getVtSignConfig;
    break;
  }

  func && func().then(rs => rs && (signConfig.value = cloneDeep(rs)));
}

watch(signConfigProvider, getSignConfigByProvider);

</script>

<style scoped>

</style>
