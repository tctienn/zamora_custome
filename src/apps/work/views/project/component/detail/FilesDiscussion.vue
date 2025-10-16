<template>
  <Listbox
    class='bg-gray-200 border-none border-noround w-full'
    list-style='height:48rem'
    option-group-children='items'
    option-group-label='label'
    option-label='label'
    :options='filesOnDate'
    :pt="{
      itemGroup:{
        class:'my-2 '
      },
      list:{
        class:'p-0'
      }
    }">
    <template #empty>
      <span class='block font-bold py-3 text-600 text-center'>{{
        t('common.emptyRecords', {itemType: toLower(t('tài liệu'))})
      }}</span>
    </template>
    <template #optiongroup='slotProps'>
      <h6 class='m-0'>Ngày {{ moment(slotProps.option.date).format('DD MMMM') }}</h6>
      <div class='align-items-center gap-2'>
        <div
          v-for='file in slotProps.option.workAttachments'
          :key='file.id'>
          <div
            class='att-tiles border-round cursor-pointer flex gap-2 hover:surface-hover p-2'
            @click='openAtt(file)'>
            <div>
              <img
                alt=''
                class='file-extension-icon h-2rem w-2rem'
                draggable='false'
                :src='getFileIcon(file.extension)'
                @error='handleFileImageError'/>
            </div>
            <div class='w-full'>
              <div class='flex justify-content-between w-full'>
                <span>
                  {{ file.name }}
                </span>
                <div
                  class='action-button'
                  @click.stop='openAttMenu(file,$event)'>
                  <AppIcon
                    name='more_vert'
                    size='1.2'>
                  </AppIcon>
                </div>
              </div>
              <div class='font-normal'>
                {{ file.size ? convertFileSize(file.size) : convertFileSize(0) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Listbox>
  <Menu
    ref='menuAtt'
    :model='menuItems'
    popup>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <SaveToEcmDialog
    ref='saveToEcmDialogRef'
    v-model:visible='visibleSaveToEcm'
    :filename='selectedAtt?.name'
    @chosen='saveToEcm'>
  </SaveToEcmDialog>
  <Dialog
    v-model:visible='visiblePreview'
    :header='selectedAtt?.name'
    maximizable
    modal
    :style='stylePreview'>
    <FilePreview
      v-if='selectedAtt'
      :name='selectedAtt.name'
      :url='(generateDownloadUrl(selectedAtt.downloadPath as string )||"").replace("/download/","/preview/")'/>
  </Dialog>
</template>

<script setup lang="ts">

import { toLower } from 'lodash';
import moment from 'moment/moment';
import type Menu from 'primevue/menu';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FilePreview from '@/apps/document/views/doc/preview/FilePreview.vue';
import { AUDIO_FILE_TYPES_SUPPORTED, IMAGE_FILE_TYPES_SUPPORTED, VIDEO_FILE_TYPES_SUPPORTED } from '@/apps/ecm/constants';
import type SaveToEcmDialog from '@/apps/ecm/views/components/dialog/save/SaveToEcmDialog.vue';
import { downloadTaskAttachment } from '@/apps/work/api/rest/task-attachment';
import { downloadFolder } from '@/apps/work/api/rest/workAttachment';
import type { WorkAttachmentByDate } from '@/apps/work/data/WorkAttachment';
import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import { toastError } from '@/common/helpers/custom-toast-service';
import {
  convertFileSize,
  downloadFile,
  generateDownloadUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';

const props = defineProps({
  filesOnDate: {
    type: Array as PropType<WorkAttachmentByDate[]>,
    default: null
  }
});
const emits = defineEmits<{
  (e: 'scrollToComment', commentId: string): void
}>();

const { t } = useI18n();

function downloadFileFn(downloadPath: string, projectId: string, name: string) {
  downloadFolder(downloadPath, projectId).then((res) => {
    if (res) {
      downloadFile(res, name);
    }
  });
}

const selectedAtt = ref<WorkAttachment>();

function openAttMenu(file: WorkAttachment, event: Event) {
  menuAtt.value?.toggle(event);
  selectedAtt.value = file;
}

const visiblePreview = ref<boolean>(false);

function openAtt(att: WorkAttachment) {
  selectedAtt.value = att;
  if (
    att?.extension
      && (IMAGE_FILE_TYPES_SUPPORTED.includes(att.extension)
          || AUDIO_FILE_TYPES_SUPPORTED.includes(att.extension)
          || VIDEO_FILE_TYPES_SUPPORTED.includes(att.extension) || 'pdf' == att.extension)
  ) {
    visiblePreview.value = true;
  } else {
    downloadFileFn(att.downloadPath, att?.objectId, att.name);
  }
}

const menuAtt = ref<InstanceType<typeof Menu> | null>(null);
const menuItems = [
  {
    label: t('Mở tài liệu'),
    command: () => {
      if (selectedAtt.value) {
        openAtt(selectedAtt.value);
      }
    },
  },
  {
    label: t('Xem chi tiết tin nhắn'),
    command: () => {
      showDetailMessage();
    },
  }, {
    label: t('Lưu vào thư mục cá nhân'),
    command: () => {
      visibleSaveToEcm.value = true;
    },
  },
];

//Save to ecm
const visibleSaveToEcm = ref<boolean>(false);
const saveToEcmDialogRef = ref<InstanceType<typeof SaveToEcmDialog> | null>();

async function saveToEcm() {
  // const url = generateUrl(selectedRow.value);
  const blob = await downloadTaskAttachment(selectedAtt.value?.path || '');
  if (blob) {
    saveToEcmDialogRef.value?.save(blob);
  }
  // const response = await baseApi(url, { method: 'GET', });
}

//Show detail message
function showDetailMessage() {
  if (selectedAtt.value?.objectId) {
    emits('scrollToComment', selectedAtt.value?.objectId);
  } else {
    toastError({ message: 'Thảo luận không tồn tại' });
  }
}

const stylePreview = computed(() => {
  if (selectedAtt.value?.extension === 'pdf') {
    return {
      width: '70vw',
      height: '100%'
    };
  }
  return undefined;
});
</script>

<script lang="ts">
export default { name: 'FilesDiscussion' };
</script>

<style scoped>
.att-tiles {
  &:hover {
    .action-button {
      opacity: 1;
    }
  }
}

.action-button {
  opacity: 0;
}
</style>