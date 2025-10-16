<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("ecm.share.sharedListOfPeople")'
    @close='emits("hide-dialog")'>
    <div
      class='border-bottom-1 border-gray-100 col-12 list-header p-0'>
      <div class='flex flex-row'>
        <div
          class='col-3 font-bold'>
          {{ t('ecm.share.userName') }}
        </div>
        <div class='col-3 font-bold'>
          {{ t('ecm.share.fullName') }}
        </div>
        <div class='col-3 font-bold'>
          {{ t('ecm.share.email') }}
        </div>
        <div class='col-3 font-bold'>
          {{ t('ecm.share.permission') }}
        </div>
      </div>
    </div>

    <DataView
      data-key='userId'
      :value='sharedUsers'>
      <template #list='{items}'>
        <div
          v-for='d in items'
          :key='d.userId'
          class='align-items-center border-bottom-1 col-12 flex'>
          <div class='col-3'>{{ d.username }}</div>
          <div class='col-3'>{{ d.fullName }}</div>
          <div class='col-3'>{{ d.email }}</div>
          <div class='col-3'>{{ d.permission }}</div>
        </div>
      </template>
    </DataView>
    <template #footer>
      <div class='flex flex-row justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          @click='emits("hide-dialog")'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getSharedInformation } from '@/apps/ecm/api/graphql/share';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = withDefaults(defineProps<ShareProps>(), {
  visibleDialog: false,
  data: undefined
});

const emits = defineEmits(['hide-dialog', 'reload']);

interface ShareProps {
    visibleDialog: boolean,
    data: EcmFolder | EcmFile
}

const sharedUsers = ref([]);
getSharedInformation(props.data.id, !('extension' in props.data)).onResult((res) => {
  sharedUsers.value = res.data.getSharedInformation;
});

const visible = ref(props.visibleDialog);
const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'SharedListOfPeople' };
</script>
