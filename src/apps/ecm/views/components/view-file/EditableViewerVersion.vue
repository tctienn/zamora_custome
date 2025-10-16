<template>
  <object
    class='h-full w-full'
    :data='href'>
    <div class='align-items-center flex flex-column h-full justify-content-center'>
      <img
        :alt='name'
        class='w-10rem'
        :src='getFileIcon(extension)'/>
      <h3>{{ t("ecm.storage.error.unablePreviewFile") }}</h3>
    </div>
    <!--      <a-->
    <!--        :download='name'-->
    <!--        :href='generateFileDownloadUrl(treePath)'>{{t("ecm.storage.fileFolderActions.download")}}</a>-->

  </object>
</template>

<script setup lang='ts'>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFileIcon, viewPreVersion } from '@/common/helpers/file-utils';

const props = defineProps({
  md5: {
    type: String,
    default: ''
  },
  treePath: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: true
  }
});
const href = ref();
viewPreVersion(props.treePath, props.md5).then((res) => {
  if (res) {
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    href.value = window.URL.createObjectURL(blob);
  }
});
const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'EditableViewer' };
</script>