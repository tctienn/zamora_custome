<template>
  <div
    class='align-items-center ecm-quick-action flex flex-row flex-wrap justify-content-center'>
    <template v-if='storage.selectedFileFolders.length'>
      <div class='align-items-center flex'>
        <ButtonIcon
          class='mr-1 text-red-600'
          icon='cancel'
          icon-size='1.5'
          rounded
          text
          @click='() => storage.selectedFileFolders = []'>
        </ButtonIcon>
        <span class='font-bold'>
          {{ t('common.selectedItems', { count: storage.selectedFileFolders.length }) }}
        </span>
      </div>
      
      <FileFolderMultiselectAction/>
    </template>
  </div>
</template>

<script setup lang='ts'>
import { useI18n } from 'vue-i18n';

import { useStorageStore } from '@/apps/ecm/store/storage';

const { t } = useI18n();
const storage = useStorageStore();

</script>

<script lang='ts'>
import FileFolderMultiselectAction
  from '@/apps/ecm/views/components/view/header/dropdown-action/FileFolderMultiselectAction.vue';

export default {
  name: 'EcmQuickAction',
  components: { FileFolderMultiselectAction }
};
</script>

<style scoped lang='scss'>
@media screen and (max-width: 1024px) {
  .ecm-quick-action {
    display: none !important;
  }
}
</style>
