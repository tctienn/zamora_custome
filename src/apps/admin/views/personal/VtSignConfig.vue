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
      <label>{{ t('admin.user.userDetail.caUserId') }}</label>
      <InputText
        v-model='model.caUserId'
        name='caUserId'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ISignConfig } from '@/apps/admin/model/sign-config';
import AvatarUploadOnly from '@/common/components/custom/AvatarUploadOnly.vue';

const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<ISignConfig>,
  default: {} as ISignConfig,
});
</script>

<style scoped>

</style>