<template>
  <div>
    <div class='flex justify-content-between'>
      <span class='align-items-center flex gap-1'>
        <AppIcon
          name='schedule'
          size='1.4'/>
        <span class='font-semibold text-blue-400'>
          {{ formatDateTime(deadline.createdTime) }}
        </span>
      </span>
      <span
        class='status-badge'
        :style="{'background-color':statusColor[deadline?.status || '' ]}">
        {{ t(`work.taskDeadlineExtension.status.${camelCase(deadline.status)}`) }}
      </span>
    </div>
    <div>
      <div class='flex gap-2 ml-3 mt-2'>
        <AppUser
          overlay-visible
          :user-id='deadline.createdBy'>
        </AppUser>
        <div class='w-full'>
          <div class='border-round flex item justify-content-between p-3 pb-1 w-full'>
            <div>
              <div class='font-semibold'>
                Lý do:
              </div>
              <div class='pb-2 white-space-pre-wrap word-break-break-word'>
                {{ deadline.reason }}
              </div>
              <div class='flex flex-column gap-2'>
                <div class='flex gap-2'>
                  <Image
                    v-for='(image) in listImages'
                    :key='image.id'
                    class='align-items-center flex justify-content-center max-w-10rem p-1'
                    :class='{"border-round": deadline.attachments && deadline.attachments.length > 1}'
                    image-class='max-w-9rem'
                    preview
                    :src='generatePreviewFileUrl(image.path)'
                    style='min-height:2rem;min-width:2rem'>
                  </Image>
                </div>
                <div class='flex gap-3'>
                  <template
                    v-for='file in listOther'
                    :key='file.id'>
                    <div
                      class='align-items-center border-round cursor-pointer flex gap-2 hover:surface-hover p-2'
                      @click='viewDetail(file.path || "" ,file.extension,file.name||"")'>
                      <img
                        v-if='file.name'
                        alt=''
                        class='file-extension-icon h-2rem w-2rem'
                        draggable='false'
                        :src='getFileIcon(file.extension)'
                        @error='handleFileImageError'/>
                      <div>
                        <span class='flex flex-column'>
                          {{ file.name }}
                        </span>
                        <span>
                          {{ convertFileSize(file.size) }}
                        </span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div>
              <div class='font-semibold'>
                Hạn mới:
              </div>
              {{ formatDateTime(deadline?.newDeadline, 'DD/MM/YYYY') }}
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { camelCase } from 'lodash';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { EDITABLE_FILE_TYPES, IMAGE_FILE_TYPES_SUPPORTED } from '@/apps/ecm/constants';
import { DeadlineExtensionStatus, type TaskDeadlineExtension } from '@/apps/work/model/taskDeadlineExtension';
import { GATEWAY_URL } from '@/common/api/configService';
import {
  convertFileSize,
  downloadFileUrl,
  generateDownloadUrl,
  generatePreviewFileUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { formatDateTime } from '@/common/helpers/time-util';

const props = defineProps({
  deadline: {
    type: Object as PropType<TaskDeadlineExtension>,
    default: () => ({})
  }
});
const listImages = computed(() => {
  return props.deadline?.attachments?.filter(e => IMAGE_FILE_TYPES_SUPPORTED.includes(e.extension));
});
const listOther = computed(() => {
  return props.deadline?.attachments?.filter(e => !IMAGE_FILE_TYPES_SUPPORTED.includes(e.extension));
});

const { moment } = useMoment();
const { t } = useI18n();

function viewDetail(filePath: string, extension: string, fileName: string) {
  if (EDITABLE_FILE_TYPES.includes(extension)) {
    downloadFileUrl(generateDownloadUrl(filePath) || '', fileName);
  } else {
    window.open(GATEWAY_URL + '/files/preview/' + filePath);
  }
}

const statusColor: Record<DeadlineExtensionStatus, string> = {
  REJECTED: '#F36F24',
  ACCEPTED: '#4af63a',
  WAITING_ACCEPT: '#69A0DC'

};

</script>

<style scoped>
.item {
  background-color: #FEFBEF
}

:deep(.avatar-container) {
  height: fit-content;
}
</style>