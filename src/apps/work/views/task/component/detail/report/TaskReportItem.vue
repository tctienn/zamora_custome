<template>
  <div>
    <div class='flex justify-content-between'>
      <span class='align-items-center flex gap-1'>
        <AppIcon
          name='schedule'
          size='1.4'/>
        <span class='font-semibold text-blue-400'>
          {{ formatDateTime(report.createdTime) }}
        </span>
      </span>
      <span
        class='status-badge'
        :style="{'background-color':statusColor[report.status]}">
        {{ t(`work.taskReport.status.${camelCase(report.status)}`) }}
      </span>
    </div>
    <div>
      <div class='flex gap-2 ml-3 mt-2'>
        <AppUser
          overlay-visible
          :user-id='report.createdBy'>
        </AppUser>
        <div
          class='w-full'
          style='color: black'>
          <div class='border-round flex item justify-content-between p-3 pb-1 w-full'>
            <div>
              <div class='pb-2 white-space-pre-wrap word-break-break-word'>
                {{ report.description }}
              </div>
              <div class='flex flex-column gap-2'>
                <div class='flex gap-2'>
                  <Image
                    v-for='(image) in listImages'
                    :key='image.id'
                    class='align-items-center flex justify-content-center max-w-10rem p-1'
                    :class='{"border-round": report.attachments && report.attachments.length > 1}'
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
            <div class='align-items-center flex flex-column justify-content-between'>
              <ProgressRing
                :progress='report?.percent||0'>
              </ProgressRing>
              <AppIcon
                v-if='report.isAssignerSeen'
                v-tooltip='t("Người giao việc đã xem")'
                class='select-none text-green-400'
                name='done_all'
                size='1.5'>
              </AppIcon>
            </div>
          </div>
          <TaskReportReplyItem
            :report='report'></TaskReportReplyItem>

        </div>
      </div>

    </div>
  </div>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { EDITABLE_FILE_TYPES, IMAGE_FILE_TYPES_SUPPORTED } from '@/apps/ecm/constants';
import { ReportStatus, type TaskReport } from '@/apps/work/model/taskReport';
import TaskReportReplyItem from '@/apps/work/views/task/component/detail/report/TaskReportReplyItem.vue';
import { GATEWAY_URL } from '@/common/api/configService';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
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
  report: {
    type: Object as PropType<TaskReport>,
    default: () => ({})
  }
});
const listImages = computed(() => {
  return props.report?.attachments?.filter(e => IMAGE_FILE_TYPES_SUPPORTED.includes(e.extension));
});
const listOther = computed(() => {
  return props.report?.attachments?.filter(e => !IMAGE_FILE_TYPES_SUPPORTED.includes(e.extension));
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

const statusColor: Record<ReportStatus, string> = {
  EVALUATED: '#F36F24',
  REQUEST_RE_REPORT: '#F36F24',
  RE_REPORTED: '#eedb08',
  WAITING_EVALUATE: '#69A0DC'

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