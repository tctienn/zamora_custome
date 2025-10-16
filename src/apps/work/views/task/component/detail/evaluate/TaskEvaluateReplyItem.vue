<template>
  <div
    v-if='evaluation'
    class='flex gap-2 mt-3'>
    <AppUser
      overlay-visible
      :user-id='evaluation.createdBy'/>
    <div class='border-round flex justify-content-between p-3 pb-1 task-evaluate-item w-full'>
      <div class='flex flex-column gap-1 w-full'>
        <span class='text-gray-600'>{{ formatDateTime(evaluation.createdTime) }}</span>
        <span class='white-space-pre-wrap word-break-break-word'>{{ evaluation.description }}</span>
        <div>
          <div class='flex gap-2'>
            <Image
              v-for='(image) in listImages'
              :key='image.id'
              :alt='image.name'
              class='align-items-center flex justify-content-center max-w-10rem p-1'
              :class='{"border-round": evaluation.attachments && evaluation.attachments.length > 1}'
              image-class='max-w-9rem'
              preview
              :src='generatePreviewFileUrl(image.path)'>
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
                <span>
                  {{ file.name }}
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class='h-full'>
        <slot name='percent-rate'>
          <div class='flex flex-column justify-content-between w-full'>
            <ProgressRing
              :progress='evaluation.percent'>
            </ProgressRing>
          </div>
          <StarRate
            :model-value='evaluation.starRating'
            size='1'
            view-only>
          </StarRate>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue';

import { EDITABLE_FILE_TYPES, IMAGE_FILE_TYPES_SUPPORTED } from '@/apps/ecm/constants';
import type { TaskEvaluation } from '@/apps/work/model/taskEvaluation';
import StarRate from '@/apps/work/views/task/component/detail/evaluate/StarRate.vue';
import { GATEWAY_URL } from '@/common/api/configService';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import {
  downloadFileUrl,
  generateDownloadUrl,
  generatePreviewFileUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

import { formatDateTime } from '../../../../../../../common/helpers/time-util';

const props = defineProps({
  evaluation: {
    type: Object as PropType<TaskEvaluation>,
    default: undefined
  }
});
const { moment } = useMoment();
const listImages = computed(() => {
  return props.evaluation?.attachments?.filter(e => IMAGE_FILE_TYPES_SUPPORTED.includes(e.extension));
});
const listOther = computed(() => {
  return props.evaluation?.attachments?.filter(e => !IMAGE_FILE_TYPES_SUPPORTED.includes(e.extension));
});

function viewDetail(filePath: string, extension: string, fileName: string) {
  if (EDITABLE_FILE_TYPES.includes(extension)) {
    downloadFileUrl(generateDownloadUrl(filePath) || '', fileName);
  } else {
    window.open(GATEWAY_URL + '/files/preview/' + filePath);
  }
}

</script>

<style scoped>

</style>