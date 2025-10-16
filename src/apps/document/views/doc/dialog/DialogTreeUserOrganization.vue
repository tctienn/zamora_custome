<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='openDialog'
    class='h-full'
    :header="t('Chọn người dùng')"
    @hide='emits("hide-dialog")'>
    <UserSelectFromNodePopup
      v-model:map-id-name='mapIdName'
      v-model:select-id='selectId'
      class='h-full overflow-auto'
      display-mode='tree'
      :org-type='OrganizationType.PARTY'
      selection-mode='multiple'
      :users='allUsers'
      @select-option='getOptions'/>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          @click='emits("hide-dialog")'/>
        <Button
          icon='pi pi-check'
          :label='t("common.save")'
          @click='submitOptions'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { OrganizationType } from '@/apps/document/model/organization';
import UserSelectFromNodePopup
  from '@/apps/work-flow/views/components/UserSelectFromNodePopup/UserSelectFromNodePopup.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['hide-dialog', 'get-options-and-close']);
const { t } = useI18n();
const openDialog = ref(props.visible);
const options = ref([]);
const { allUsers, fetchAllUsers } = useUserMoreInfoStore();
const mapIdName = defineModel<Record<string, string>>('mapIdName', { default: {} });
const selectId = defineModel<Record<string, string>>('selectId', { default: {} });
onMounted(() => {
  fetchAllUsers();
});

function getOptions(optionsEmit: any) {
  options.value = optionsEmit;
}

function submitOptions() {
  emits('get-options-and-close', options.value);
  emits('hide-dialog');
}
</script>

<script lang="ts">
export default { name: 'DialogTreeUserOrganization' };
</script>

<style scoped>
</style>