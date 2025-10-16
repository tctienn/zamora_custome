<template>
  <ButtonIcon
    icon='link'
    :label='t("ecm.share.copyLink")'
    severity='secondary'
    @click='copyLink'/>
  <ButtonIcon
    v-if='numberUserShared > 1'
    icon='close'
    :label='t("common.stopShare")'
    severity='danger'
    @click='stopShare'/>
  <ButtonIcon
    icon='check'
    :label='t("common.share")'
    @click='save'/>
</template>

<script setup lang='ts'>
import type { ComputedRef } from 'vue';
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EventBus from '@/common/helpers/event-bus';

const dialogRef = inject<ComputedRef>('dialogRef');
const _fileFolderId = ref('');
const _isFolder = ref(false);
const { t } = useI18n();
const numberUserShared = ref(0);

const shareLink = computed(() => window.location.host
  + `/ecm/shared-${ _isFolder.value ? 'folder' : 'file' }/${ _fileFolderId.value }`);

function copyLink() {
  navigator.clipboard.writeText(shareLink.value);
}

function stopShare() {
  EventBus.emit('stopShareInformation');
  dialogRef?.value.close();
}

function save() {
  EventBus.emit('saveShareInformation');
  dialogRef?.value.close();
}

onMounted(() => {
  const {
    id,
    isFolder
  } = dialogRef?.value.data || {
    fileFolderId: '',
    isFolder: false
  };
  _fileFolderId.value = id;
  _isFolder.value = isFolder;
  EventBus.on('usersShared', getTotalUserShared);
});

onUnmounted(() => {
  EventBus.off('usersShared', getTotalUserShared);
});

function getTotalUserShared(event: number) {
  numberUserShared.value = event;
}
</script>

<script lang='ts'>

export default { name: 'EcmSharedInfoButtons' };
</script>

<style scoped>

</style>