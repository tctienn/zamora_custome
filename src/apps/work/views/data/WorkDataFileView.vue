<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    data-key='tenant'
    :lazy='true'
    :loading='searchLoading'
    :total-records='totalRecords'
    :value='attachmentTasks'
    @page='onPage($event)'
    @sort='onSort($event)'>
    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <div class='align-items-center flex'>
          <span class='font-bold ml-2 text-primary text-white text-xl'>{{
            t('work.taskAttachment.tableTitle') + ' (' + totalRecords + ')'
          }}</span>
        </div>

        <div class='flex'>
          <span class='block p-input-icon-left'>
            <i class='pi pi-search'/>
            <InputText
              v-model='searchKeyword'
              :placeholder='t("common.search")'
              @keyup.enter='search'/>
          </span>
        </div>
      </div>
    </template>

    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: toLower(t('work.taskAttachment.objectName')) })
      }}</span>
    </template>

    <Column
      header='#'>
      <template #body='slotProps'>
        {{ pageable.page * pageable.size + slotProps.index + 1 }}
      </template>
    </Column>

    <Column
      field='name'
      :header='t("work.taskAttachment.name")'
      :sortable='true'>
    </Column>

    <Column
      field='path'
      :header='t("work.taskAttachment.path")'
      :sortable='true'>
      <template #body='{data : {name, id, path}}'>
        <router-link
          v-tooltip.bottom='name'
          class='font-bold overflow-x-hidden text-center text-overflow-ellipsis w-full white-space-nowrap'
          target='_blank'
          :to='{name: "WorkFileViewer", params: {fileId: id ? id : 0 }}'>{{ path }}
        </router-link>
      </template>
    </Column>

    <Column
      field='taskName'
      :header='t("work.taskAttachment.taskName")'
      :sortable='true'>
      <template #body='{data : {taskId, taskName}}'>
        <p @click='showTask(taskId)'>{{ taskName }}</p>
      </template>
    </Column>

    <Column
      field='createdBy'
      :header='t("work.taskAttachment.createdBy")'
      :sortable='true'>
      <template #body='{data: {createdBy, createdName}}'>
        <AppGroupAvatar
          v-if='createdBy'
          :users='[{id: createdBy, fullName: createdName }]'/>
        <template v-else>
          -
        </template>
      </template>
    </Column>

    <Column
      field='createdTime'
      :header='t("work.taskAttachment.createdTime")'
      :sortable='true'>
      <template #body='{data: {createdTime}}'>
        {{ moment(createdTime).format('DD/MM/YYYY HH:mm:ss') }}
      </template>
    </Column>

    <!--    <Column-->
    <!--      field='status'-->
    <!--      :header='t("common.status")'-->
    <!--      :sortable='true'>-->
    <!--      <template #body='{data: {status}}'>-->
    <!--        <span-->
    <!--          class='status-badge'-->
    <!--          :class='`status-${toLower(status)}`'>{{-->
    <!--            t(`common.statuses.${toLower(status)}`)-->
    <!--          }}</span>-->
    <!--      </template>-->
    <!--    </Column>-->

    <Column
      :header='t("work.taskAttachment.action")'>
      <template #body='slotProps'>
        <ButtonIcon
          v-tooltip.top='t("common.action")'
          class='text-color'
          icon='list'
          rounded
          text
          @click='toggleActionMenu($event,slotProps.data)'/>
      </template>
    </Column>
  </DataTable>
  <Menu
    ref='menu'
    :model='actions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <FileFolderInformation
    v-if='informationVisible'
    :is-folder='false'
    :item='attachmentTask'
    :visible-dialog='informationVisible'
    @hide-dialog='hideDialogInfo'/>

  <WorkDetailComponent
    v-if='workDetailDialogVisible'
    :dialog-visible='workDetailDialogVisible'
    :task='task'
    @hide-dialog='workDetailDialogVisible = false'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, toLower } from 'lodash';
import Column from 'primevue/column';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { searchAttachmentsMyWorkGraphql } from '@/apps/work/api/graphql/attachment-api';
import { getTaskGraphql } from '@/apps/work/api/graphql/task-api';
import type { AttachmentEdge, AttachmentInterface } from '@/apps/work/model/attachmentTask';
import type { Task, Work } from '@/apps/work/model/task';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import WorkDetailComponent from '@/apps/work/views/actions/WorkDetail.vue';
import FileFolderInformation from '@/apps/work/views/component/view-file/FileFolderInformation.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { generateFileDownloadUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Pageable } from '@/common/model/query';

const workDetailDialogVisible = ref(false);

const { t } = useI18n() || {};
let actions = ref<object[]>([]);
const menu = ref();
const attachmentTasks = ref<AttachmentInterface[]>([]);
const attachmentTask = ref();
const searchLoading = ref(true);
const searchKeyword = ref('');
const totalRecords = ref(0);
const router = useRouter();
const task = ref();
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
});
const { moment } = useMoment();

const defaultParam = {
  searchCondition: '',
  pageable: pageable
};
const {
  refetch: searchAttachmentsMyWorkRefetch,
  onResult: searchAttachmentsMyWorkOnResult
} = searchAttachmentsMyWorkGraphql(defaultParam);

searchAttachmentsMyWorkOnResult((result) => {
  const {
    loading,
    data
  } = result;
  searchLoading.value = loading;
  attachmentTasks.value = data.searchAttachmentsMyWork.edges.map((edge: AttachmentEdge) => ({ ...edge.node, }));
  totalRecords.value = data.searchAttachmentsMyWork.totalCount;
});

let currentParam = { ...defaultParam };

let showCreateOrUpdateDialog = ref(false);

function toggleActionMenu(event: Event, data: any) {
  menu.value.toggle(event);
  attachmentTask.value = data;
  actions.value = [{
    label: t('common.info'),
    icon: 'info',
    command: () => {
      showInfo();
    }
  },
  {
    label: t('common.download'),
    icon: 'download',
    command: () => {
      const a = document.createElement('a');
      a.href = generateFileDownloadUrl(attachmentTask.value.path);
      a.click();
    }
  },
  {
    label: t('common.view'),
    icon: 'preview',
    command: () => {
      const route = router.resolve({
        name: 'WorkFileViewer',
        params: { fileId: attachmentTask.value.id ? attachmentTask.value.id : '' }
      });

      window.open(route.href, '_blank');

    }
  },
  {
    label: t('work.detail'),
    icon: 'work',
    command: () => {
      showTask(attachmentTask.value.taskId || '');
    }
  }
  ];
}

const informationVisible = ref(false);

function showInfo() {
  informationVisible.value = true;
}

function hideDialogInfo() {
  informationVisible.value = false;
}

function search() {
  currentParam = {
    ...currentParam,
    searchCondition: searchKeyword.value
  };
  searchAttachmentsMyWorkRefetch(currentParam);
}

function onPage(event: { page: number, rows: number }) {
  const {
    page,
    rows
  } = event;
  assign(pageable, {
    page,
    size: rows,
  });
  assign(currentParam, pageable);
  searchAttachmentsMyWorkRefetch(currentParam);
}

function onSort(event: any) {
  const {
    sortField,
    sortOrder
  } = event;
  assign(pageable, {
    page: 0,
    sort: [
      {
        property: sortField,
        direction: sortOrder === 1 ? 'ASC' : 'DESC'
      }
    ]

  });
  assign(currentParam, pageable);
  searchAttachmentsMyWorkRefetch(currentParam);
}

function hideDialog(value: boolean) {
  showCreateOrUpdateDialog.value = value;
  searchAttachmentsMyWorkRefetch(currentParam);
}

function showTask(taskId: string) {
  getTaskGraphql(taskId || '')
    .onResult(a => {
      useTaskDetailStore().task = cloneDeep<Work>(a.data.task);
      task.value = cloneDeep<Task>(a.data.task);
      workDetailDialogVisible.value = true;
    });
}

</script>

<script lang='ts'>
export default { name: 'WorkDataFileView' };
</script>