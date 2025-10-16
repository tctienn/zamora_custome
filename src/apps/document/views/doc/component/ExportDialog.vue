<template>
  <Dialog
    v-model:visible='visible'
    :header='header'
    modal
    @hide="emits('hide-dialog')">
    <div class='dialog-body'>
      <div class='flex justify-content-between'>
        <div
          v-for='option in exportOptions as any[]'
          :key='option.label'
          class='export-option hover:surface-200'
          :class='{ disabled: option.disabled }'
          :style="{ cursor: isExporting ? 'wait' : 'pointer' }"
          @click='handleExport(option.exportFunction, option.fileName)'>
          <img
            :alt='`Export ${option.label}`'
            class='export-icon'
            :src='option.icon'/>
          <span>{{ option.label }}</span>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { downloadFile } from '@/common/helpers/file-utils';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  header: {
    type: String,
    default: 'Chọn định dạng tệp để kết xuất',
  },
  exportOptions: {
    type: Array,
    required: true,
    default: () => [],
  },
  search: {
    type: Object,
    default: null,
  },
  docStatus: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog']);
const visible = ref(props.visibleDialog);
const isExporting = ref<boolean>(false);

function setExporting(status: boolean) {
  isExporting.value = status;
}

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

function handleExport(exportFunction: any, fileName: string) {
  if (isExporting.value) {
    return;
  }

  setExporting(true);
  exportFunction(userDeptRole.value, props.search, props.docStatus)
    .then((value: any) => {
      if (value) {
        downloadFile(value.data, fileName);
      }
      setExporting(false);
    })
    .catch(() => {
      setExporting(false);
    });
}
</script>

<style scoped>
.dialog-body {
  display: flex;
  justify-content: center;
}

.export-option {
  text-align: center;
  padding: 1rem;
  border-radius: 5px;
}

.export-icon {
  width: 50px;
  height: 50px;
}

.export-option span {
  display: block;
  margin-top: 0.5rem;
  font-weight: bold;
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
