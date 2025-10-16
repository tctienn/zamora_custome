<template>
  <div class='md:px-8 px-6 py-6 surface-card'>
    <div class='flex flex-column gap-4 items-center'>
      <div class='font-semibold text-2xl text-center'>HANET's Camera Access Token Configuration</div>
      <div class='grid'>
        <FormInputTextArea
          v-model='accessToken'
          class='w-full'
          label='Access Token'
          :readonly='!editing'/>
        <Button
          v-if='!editing && hasPermission("/HRM/HRM_CONFIG/HRM_CONFIG_CAMERA/CREATE")'
          icon='pi pi-pencil'
          :label='t("common.edit")'
          @click='editing=true'/>
        <Button
          v-else
          icon='pi pi-save'
          :label='t("common.save")'
          @click='save'/>

      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { getCameraAccessToken, saveCameraAccessToken } from '@/apps/hrm/api/graphql/camera';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const accessToken = ref('');
const editing = ref(true);
const hasPermission = usePermissionStore().hasPermission;
getCameraAccessToken().onResult((result) => {
  accessToken.value = result.data?.getCameraAccessToken || '';
  if (accessToken.value) {
    editing.value = false;
  }
});

function save() {
  saveCameraAccessToken().mutate({ token: accessToken.value })
    .then(() => {
      editing.value = false;
      toastSuccess();
    })
    .catch(() => {
      editing.value = true;
      toastError();
    });
}
</script>

<style scoped>

</style>