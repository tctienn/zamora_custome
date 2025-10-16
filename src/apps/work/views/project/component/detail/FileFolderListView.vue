<template>
  <DataTable
    ref='dataTable'
    v-model:selection='selectedRow'
    row-hover
    :value='workAttachments'
    @row-dblclick='goToFolder($event)'
    @sort='onSort($event)'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: toLower(t('work.project.document')) })
      }}</span>
    </template>
    <Column class='w-1rem'>
      <template #header>
        <AppIcon
          v-if='!isRoot'
          v-tooltip.top="t('common.back')"
          class='cursor-pointer'
          name='arrow_upward'
          @click='backFolderFn'/>
      </template>
      <template
        #body='{data: {extension}}'>
        <img
          alt=''
          class='file-extension-icon h-2rem w-2rem'
          draggable='false'
          :src='getFileIcon(extension == null ? "folder": extension )'
          @error='handleFileImageError'/>
      </template>
    </Column>
    <Column
      class='w-15rem'
      field='name'
      :header='t("work.project.fileName")'
      :sortable='true'>
      <template
        #body='{data: { name}}'>
        <div class='align-content-center flex'>{{ name }}</div>
      </template>
    </Column>

    <Column
      class='text-center w-15rem'
      field='size'
      :header='t("work.project.capacity")'
      :sortable='true'>
      <template #body='{data: {size}}'>
        {{ size ? convertFileSize(size) : convertFileSize(0) }}
      </template>
    </Column>

    <Column
      class='text-center w-15rem'
      field='extension'
      :header='t("work.project.extension")'
      :sortable='true'>
    </Column>

    <Column
      class='text-center w-15rem'
      field='createdTime'
      :header='t("work.project.createdDate")'
      :sortable='true'>
      <template #body='{data: {createdTime}}'>
        {{ createdTime ? moment(createdTime).format('DD/MM/YYYY HH:mm') : '' }}
      </template>
    </Column>

    <Column
      class='w-15rem'
      field='createdBy'
      :header='t("work.project.userCreate")'
      :sortable='true'>
      <template #body='{data: {createdBy}}'>
        <div class='flex justify-content-center'>
          <AppUser
            :user-id='createdBy'/>
        </div>
      </template>
    </Column>

    <Column
      v-if='!disableModify'
      class='text-center'>
      <template #body='{data}'>
        <ButtonIcon
          v-tooltip.top='t("common.action")'
          class='text-color'
          icon='more_vert'
          rounded
          text
          @click='toggleActionMenu({event : $event, data : data})'/>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang='ts'>

import { clone, toLower } from 'lodash';
import moment from 'moment/moment';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import { inject, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  workAttachmentsProp: {
    type: Array as PropType<WorkAttachment[]>,
    default: [] as WorkAttachment[]
  },
  isRootProp: {
    type: Boolean,
    default: true
  }
});
const emits = defineEmits(['go-to-folder', 'back-folder', 'toggleActionMenu']);
const selectedRow = ref();
const disableModify = inject('disableModifyInProject', ref<string>());
const workAttachments = ref();

const isRoot = ref();
const { t } = useI18n();

watch(props, () => {
  workAttachments.value = props.workAttachmentsProp;
  isRoot.value = props.isRootProp;
});

onMounted(() => {
  workAttachments.value = props.workAttachmentsProp;
  isRoot.value = props.isRootProp;
});

function goToFolder(event: any) {
  emits('go-to-folder', event);
}

function backFolderFn() {
  emits('back-folder');
}

function toggleActionMenu({
  event,
  data
}: { event: Event, data: WorkAttachment }) {
  emits('toggleActionMenu', {
    event,
    data
  });
  selectedRow.value = data;
}

function sortByField(items: WorkAttachment[], fieldName: string, sortOrder: 1 | 0 | -1 | undefined | null): WorkAttachment[] {
  if (sortOrder === undefined || sortOrder === null) {
    return items;
  }

  return items.sort((a, b) => {
    if (a.isFolder && !b.isFolder) {
      return -1;
    }
    if (!a.isFolder && b.isFolder) {
      return 1;
    }

    if (a[fieldName as keyof WorkAttachment] < b[fieldName as keyof WorkAttachment]) {
      return sortOrder;
    }
    if (a[fieldName as keyof WorkAttachment] > b[fieldName as keyof WorkAttachment]) {
      return -sortOrder;
    }
    return 0;
  });
}

function onSort(event: DataTableSortEvent) {
  workAttachments.value = sortByField(clone(workAttachments.value), event.sortField as string, event.sortOrder);
}
</script>

<script lang='ts'>
export default { name: 'FileFolderListView' };
</script>

<style scoped>

</style>