<template>
  <div class='mt-2 p-3 pl-0'>
    <h4 class='p-card-title'>{{ t('hrm.contract.attachment') }}</h4>
    <div class='grid'>
      <div
        v-for='(file, index) in oldFiles'
        :key='index'
        class='col-12 lg:col-4 md:col-6'>
        <Card class='h-full pl-3'>
          <template #header>
            <div
              class='align-items-center cursor-pointer flex gap-2 p-2'
              @click='viewDetail(file)'>
              <img
                :alt='`${file.extension} icon`'
                :src='`/images/file-extension-icons/${file.extension}.svg`'
                style='width: 2rem; height: 2rem'/>
              <div class='font-medium text-lg'>{{ file.name }}</div>
            </div>
          </template>

          <template #content>
            <div class='mb-2 text-color-secondary text-sm'>
              {{ convertFileSize(file.size || 0) }}
            </div>
            <a
              class='text-primary text-sm underline'
              :href='generateDownloadUrl(file.path)'
              rel='noopener noreferrer'
              target='_blank'>
              {{ t('common.download') }}
            </a>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';
import type { Attachment } from '@/apps/hrm/views/planning/model';
import { convertFileSize, generateDownloadUrl, generatePreviewFileUrl } from '@/common/helpers/file-utils';

defineProps({
  oldFiles: {
    type: Array as PropType<EmployeeAttachment[]>,
    default: () => []
  }
});

function viewDetail(file: EmployeeAttachment) {
  if (!file?.path) {
    return;
  }

  const fileUrl = generatePreviewFileUrl(file.path);
  if (!fileUrl) {
    return;
  }
  const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
  const isViewable = file.extension ? viewableExtensions.includes(file.extension?.toLowerCase()) : false;

  if (isViewable) {
    window.open(fileUrl, '_blank');
  } else {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

const { t } = useI18n();
</script>

<style scoped>
:deep(.p-card-body) {
  padding: 10px !important;
}

:deep(.p-card-content) {
  padding: 10px !important;
}
</style>
