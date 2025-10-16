<template>
  <div class='flex flex-column gap-3'>
    <div class='flex flex-column gap-2'>
      <label>{{ t('common.signature') }}</label>
      <AvatarUploadOnly
        :avatar-upload-size='{ width: 18, height: 10, emptyIconSize: 8, border: 0.25 }'
        :avatar-url='model.signature'
        generate-check-name-by-input-name
        input-name='signature'
        preserve-aspect-ratio
        shape='rectangle'
        :show-remove-button='false'
        :tooltip='t("common.signature")'/>
    </div>
    <div class='flex flex-column gap-2'>
      <label>{{ t('admin.user.userDetail.caName') }}</label>
      <NamedDropdown
        v-model='model.caName'
        name='caName'
        option-label='label'
        option-value='code'
        :options='caProviders'/>

    </div>
    <div class='flex flex-column gap-2'>
      <label>{{ t('admin.user.userDetail.caUserId') }}</label>
      <InputText
        v-model='model.caUserId'
        name='caUserId'/>
    </div>
    <div class='flex flex-column gap-2'>
      <label>{{ t('admin.user.userDetail.caSerialNumber') }}</label>
      <InputText
        v-model='model.caSerialNumber'
        disabled/>
    </div>
  </div>

</template>

<script lang='ts' setup>
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ISignConfig } from '@/apps/admin/model/sign-config';
import AvatarUploadOnly from '@/common/components/custom/AvatarUploadOnly.vue';

const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<ISignConfig>,
  default: {} as ISignConfig,
});

const caProviders = [
  {
    label: 'Công ty Cổ phần Bkav',
    code: 'BkavCA'
  },
  {
    label: 'Công ty Cổ phần MISA',
    code: 'MISA-CA'
  },
  {
    label: 'Tập đoàn Công nghiệp - Viễn thông Quân đội',
    code: 'Viettel-CA'
  },
  {
    label: 'Công ty Cổ phần Công nghệ thẻ Nacencomm',
    code: 'CA2'
  },
  {
    label: 'Công ty TNHH FPT IS',
    code: 'FPT-CA'
  },
  {
    label: 'Công ty cổ phần Intrust',
    code: 'INTRUSTCA'
  },
  {
    label: 'Công ty Cổ phần Công nghệ SAVIS',
    code: 'TrustCA'
  },
  {
    label: 'Công ty Cổ phần Đầu tư công nghệ và thương mại Softdreams',
    code: 'EASYCA'
  },
  {
    label: 'Tập đoàn Bưu chính Viễn thông Việt Nam',
    code: 'VNPT-CA'
  }
];
</script>

<style scoped>

</style>
