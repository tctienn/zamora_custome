<template>
  <Listbox
    class='bg-gray-300 border-none border-noround w-full'
    list-style='height:calc(100vh - 15rem)'
    option-group-children='items'
    option-group-label='label'
    option-label='label'
    :options='Object.entries(groupTaskAttachments)'
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
    <template #optiongroup='{option}'>
      <h6 class='m-0'>Ngày {{ moment(option[0]).format('DD MMMM') }}</h6>
      <div class='align-items-center gap-2'>
        <div
          v-for='file in option[1]'
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
                    name='more_horiz'
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
    :pt="{
      content:{
        class:'h-full'
      }
    }"
    :style='stylePreview'>
    <FilePreview
      v-if='selectedAtt'
      :name='selectedAtt.name'
      :url='(generateDownloadUrl(selectedAtt.path as string )||"").replace("/download/","/preview/")'/>
  </Dialog>
</template>

<script lang="ts" setup>
import { cloneDeep, toLower } from 'lodash';
import type Menu from 'primevue/menu';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FilePreview from '@/apps/document/views/doc/preview/FilePreview.vue';
import { AUDIO_FILE_TYPES_SUPPORTED, VIDEO_FILE_TYPES_SUPPORTED } from '@/apps/ecm/constants';
import SaveToEcmDialog from '@/apps/ecm/views/components/dialog/save/SaveToEcmDialog.vue';
import { searchAttachment } from '@/apps/work/api/graphql/task-attachment';
import { downloadTaskAttachment } from '@/apps/work/api/rest/task-attachment';
import { IMAGE_FILE_TYPES_SUPPORTED } from '@/apps/work/constants';
import { type AttachmentSearch, OriginType, type TaskAttachment } from '@/apps/work/model/taskAttachment';
import { DEFAULT_PAGE } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import {
  convertFileSize,
  downloadFileUrl,
  generateDownloadUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Edge } from '@/common/model/page';
import { Direction } from '@/common/model/query';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});

const emits = defineEmits<{
  (e: 'scrollToComment', commentId: string): void
}>();
const { t } = useI18n();
const { moment } = useMoment();
const searchRequest = reactive<AttachmentSearch>({
  taskId: props.taskId || '',
  origin: [OriginType.COMMENT]
});
const page = cloneDeep({
  ...DEFAULT_PAGE,
  size: 999999,
  sort: [{
    property: 'createdTime',
    direction: Direction.DESC
  }, {
    property: 'extension',
    direction: Direction.DESC
  },

  ]
});
const taskAttachments = ref<TaskAttachment[]>([]);
const selectedAtt = ref<TaskAttachment>();
const formatToDateString = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Extract date part in 'YYYY-MM-DD' format
};
const groupTaskAttachments = computed(() => {
  return taskAttachments.value.reduce<Record<string, TaskAttachment[]>>((acc, attachment) => {
    const dateKey = formatToDateString(new Date(attachment.createdTime));
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(attachment);
    return acc;
  }, {});
});

const { onResult: attOnResult, load, refetch } = searchAttachment(searchRequest, page);

function reloadAtt() {
  refetch();
}

attOnResult(res => {
  taskAttachments.value = res.data?.searchAttachment?.edges?.map((e: Edge<TaskAttachment>) => {
    return e.node;
  }) || [];
});

load();

function downloadFile(file: TaskAttachment) {
  downloadFileUrl(generateDownloadUrl(file.path) || '', file.name);
}

function openAttMenu(file: TaskAttachment, event: Event) {
  menuAtt.value?.toggle(event);
  selectedAtt.value = file;
}

const visiblePreview = ref<boolean>(false);

function openAtt(att: TaskAttachment) {
  selectedAtt.value = att;
  if (
    att?.extension
      && (IMAGE_FILE_TYPES_SUPPORTED.includes(att.extension)
          || AUDIO_FILE_TYPES_SUPPORTED.includes(att.extension)
          || VIDEO_FILE_TYPES_SUPPORTED.includes(att.extension) || 'pdf' == att.extension)
  ) {
    visiblePreview.value = true;
  } else {
    downloadFile(att);
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
defineExpose({ reloadAtt });
</script>

<style lang="scss" scoped>
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