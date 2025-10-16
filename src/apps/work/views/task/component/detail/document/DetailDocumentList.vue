<template>
  <DataTable
    v-model:selection='selectedRow'
    class='h-full'
    data-key='id'
    :loading='loading'
    removable-sort
    row-hover
    :selection-mode="'single'"
    sort-field='createdTime'
    :sort-order='-1'
    v-bind='DEFAULT_DATATABLE_CONFIG'
    :value='taskAttachmentsOrdered'
    @row-dblclick='rowDbClickEvent'
    @sort='sort'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: toLower(t('tài liệu')) })
      }}</span>
    </template>
    <template #loading>
      <i
        class='pi pi-spin pi-spinner'
        style='font-size: 2rem'></i>
    </template>
    <Column
      class='col-6'
      field='name'
      :header='t("work.task.fileName")'
      sortable>
      <template
        #body='{data: data}'>
        <div class='align-items-center flex gap-2'>
          <img
            alt=''
            class='file-extension-icon h-2rem w-2rem'
            draggable='false'
            :src='getFileIcon(data?.extension == null ? "folder": data?.extension )'
            @error='handleFileImageError'/>
          <span class='text-ellipsis white-space-normal word-break-break-word'>
            {{ data?.name }}
          </span>
        </div>
      </template>
    </Column>

    <Column
      body-class='text-right'
      field='size'
      :header='t("work.task.fileSize")'
      sortable>
      <template #body='{data}'>
        {{ convertFileSize(data?.size) }}
      </template>
    </Column>

    <Column
      body-class='text-center'
      field='origin'
      :header='t("work.task.origin")'
      sortable>
      <template #body='{data}'>
        {{ data?.originType ? t(`work.task.originType.${data?.originType?.toLowerCase()}`) : '' }}
      </template>
    </Column>

    <Column
      body-class='text-center'
      field='createdTime'
      :header='t("work.task.createdTime")'
      sortable>
      <template #body='{data}'>
        {{ formatDateTime(data?.createdTime) }}
      </template>
    </Column>
    <Column
      :header='t("work.task.createdBy")'>
      <template #body='{data}'>
        <AppUser
          overlay-visible
          :user-id='data?.createdBy'>
        </AppUser>
      </template>
    </Column>

    <Column
      v-if='!disableModify'
      body-class='text-center'
      :header='t("common.action")'>
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.top="t('common.action')"
          class='text-color'
          icon='more_horiz'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu({ event: $event, data: data })'/>
      </template>
    </Column>
  </DataTable>
</template>

<script lang='ts' setup>
import { toLower } from 'lodash';
import DataTable, { type DataTableRowDoubleClickEvent, type DataTableSortEvent } from 'primevue/datatable';
import { inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { type TaskAttachment } from '@/apps/work/model/taskAttachment';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';
import { formatDateTime } from '@/common/helpers/time-util';

const props = defineProps({
  taskAttachments: {
    type: Array as PropType<TaskAttachment[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: true
  }
});
const emits = defineEmits<{
  (e: 'toggleActionMenu', payload: { event: Event, data: TaskAttachment }): void
  (e: 'viewFile', selectedRow: TaskAttachment): void
}>();
const taskAttachmentsOrdered = ref<TaskAttachment[]>([]);
watch(() => props.taskAttachments, value => {
  taskAttachmentsOrdered.value = value;
}, {
  immediate: true,
  deep: true
});
const selectedRow = defineModel<TaskAttachment>('selection', { default: undefined });

const { t } = useI18n();
const disableModify = inject('disableModify', ref<boolean>());

function toggleActionMenu(payload: {
  event: Event;
  data: TaskAttachment;
}) {
  emits('toggleActionMenu', payload);
}

function sort(event: DataTableSortEvent) {
  const fieldName = event.sortField;
  const sortOrder = event.sortOrder;
  if (sortOrder == null) {
    return;
  }

  taskAttachmentsOrdered.value.sort((a, b) => {
    if (a[fieldName as keyof TaskAttachment] < b[fieldName as keyof TaskAttachment]) {
      return -sortOrder;
    }
    if (a[fieldName as keyof TaskAttachment] > b[fieldName as keyof TaskAttachment]) {
      return sortOrder;
    }
    return 0;
  });
}

function rowDbClickEvent(event: DataTableRowDoubleClickEvent) {
  selectedRow.value = event.data;
  emits('viewFile', event.data);
}

</script>

<style scoped>
:deep(.group-avatar-container) {
  justify-content: center;
}

:deep(.avatar-container) {
  justify-content: center;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>