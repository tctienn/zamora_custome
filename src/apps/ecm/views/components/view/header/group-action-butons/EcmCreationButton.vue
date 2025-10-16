<template>
  <ButtonIcon
    v-if='hasCreatePermission(serviceType, path)'
    class='px-3 py-2'
    icon='add'
    icon-size='1.5'
    :label='t("ecm.storage.create")'
    @click='toggleCreationMenu($event, false)'/>
  <FileFolderCreateMenu ref='creationMenu'/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { hasCreatePermission } from '@/apps/ecm/service/permission_helper';
import { useBreadcrumbStore } from '@/apps/ecm/store/breadcrumb';
import { useStorageStore } from '@/apps/ecm/store/storage';

const { serviceType } = storeToRefs(useStorageStore());
const { path } = storeToRefs(useBreadcrumbStore());

const { t } = useI18n();

const creationMenu = ref();

function toggleCreationMenu(event: Event, isContextMenu: boolean) {
  creationMenu.value.toggleCreationMenu(event, isContextMenu);
}
</script>

<script lang='ts'>
import FileFolderCreateMenu from '@/apps/ecm/views/components/contextMenu/FileFolderCreationMenu.vue';

export default {
  name: 'EcmCreationButton',
  components: { FileFolderCreateMenu }
};
</script>

<style scoped lang='scss'>
</style>