<template>
  <Dialog
    v-model:visible='visible'
    header='Lịch sử hoạt động'
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 35vw'
    @hide="emits('hide-dialog')">
    <div>
      <div
        v-for='(log, i) of logs'
        :key='i'
        class='flex hover:surface-hover justify-content-between p-2'>
        <AppUser
          avatar-size='3'
          info-visible
          :infos="['positionName', 'departments']"
          name-visible
          :user-id='log?.createdBy'/>
        <div class='align-items-center flex font-bold text-blue-600'>
          {{ t(`document.file.${log?.actionType}`) }}
        </div>
        <div>{{ moment(log?.createdTime).format("DD/MM/YYYY HH:mm") }}</div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findLogByObjectId } from '@/apps/document/api/graphql/log';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const { moment } = useMoment();
const visible = ref(props.visibleDialog);
const logs = ref();

const { onResult: getLogResult } = findLogByObjectId(props.id);
getLogResult((res) => {
  logs.value = res.data.findLogByObjectId;
});
</script>

<style scoped>
:deep(.p-dialog-content) {
  padding-top: unset !important;
}
</style>
