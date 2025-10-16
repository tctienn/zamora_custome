<template>
  <div class='flex justify-content-between mb-1'>
    <TabView
      v-model:active-index='currentTab'
      class='wrapper-tab'>
      <TabPanel header='Danh sách công việc'></TabPanel>
      <TabPanel header='Files'></TabPanel>
    </TabView>

    <div
      v-if='currentTab === 0'
      class='flex gap-2'>
      <Menubar :model='menuFilter'/>
      <div class='w-20rem'>
        <InputText
          v-model='searchText'
          class='w-full'
          placeholder='Nhập tên'/>
      </div>
    </div>
  </div>

  <JobTable
    v-if='currentTab === 0'
    :current-sort='currentSort'
    :list-jobs='filterJob'
    @toggle-action-menu='toggleActionMenu'/>
  <AttachFileMission
    v-if='currentTab === 1'
    v-model:receiving-docs='attachments'
    class='mt-2'
    :is-detail='true'/>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <SidebarDocDetail
    v-if='showDocDetail'
    :job-id='selectedRow.id'
    :visible-dialog='showDocDetail'
    @hide-dialog='hideDialogFn'/>
  <Sidebar
    v-model:visible='visibleForm'
    :dismissable='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {"width": "80rem"}}'
    :header="`${isDetail
      ? `${t('mission.job.common.job')}`
      : formId ? t('mission.job.common.update') : t('mission.job.common.create')}`"
    :modal='true'
    position='right'
    @hide='()=> visibleForm = false'>
    <FormJob
      :id='formId'
      :is-detail='isDetail'
      :job-type='currentJobType'
      @hide-dialog='visibleForm = false'/>
  </Sidebar>
</template>

<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import { computed, type PropType, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { SORT_TYPE } from '@/apps/document/model/file';
import { deleteJobInFolder } from '@/apps/mission/api/graphql/folder';
import { findAllJobAttachmentByJobIdIn } from '@/apps/mission/api/graphql/job-api';
import type { JobType } from '@/apps/mission/model/job/job';
import type { FileAttachmentInterface } from '@/apps/mission/model/mission/mission';
import JobTable from '@/apps/mission/views/folder/component/JobTable.vue';
import SidebarDocDetail from '@/apps/mission/views/folder/component/SidebarDocDetail.vue';
import AttachFileMission from '@/apps/mission/views/mission/component/AttachFileMission.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

import FormJob from '../../mission/component/FormJob.vue';

const props = defineProps({
  listJobs: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  id: {
    type: String,
    default: null,
  },
  folder: {
    type: Object as PropType<any>,
    default: undefined,
  },
});
const emits = defineEmits(['reload']);
const currentTab = ref(0);
const { t } = useI18n();
const menuRef = ref();
const selectedRow = ref<any>();
const confirm = useConfirm();
const showDocDetail = ref(false);
const isDetail = ref();
const formId = ref();
const currentJobType = ref<JobType | undefined>();
const visibleForm = ref<boolean>(false);

const hideDialogFn = () => {
  showDocDetail.value = false;
};

function toggleActionMenu(event: any) {
  menuRef.value.toggle(event[0]);
  selectedRow.value = event[1];
}

const searchText = ref('');
const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const filterJob = computed(() => {
  const searchValue = removeAccents(searchText.value.toLowerCase().trim());
  return props.listJobs.filter((job) => {
    const jobName = removeAccents(job.jobName?.toLowerCase() || '');
    return jobName.includes(searchValue);
  });
});

const attachments = ref<any>(null);
const {
  onResult: findAllJobAttachmentByJobIdInResult,
  refetch: findAllJobAttachmentByJobIdInRefetch
} = findAllJobAttachmentByJobIdIn(props.folder.jobIds || []);

watch(() => props.id, val => {
  findAllJobAttachmentByJobIdInRefetch(props.folder.jobIds || []);
});

watch(() => props.listJobs, val => {
  findAllJobAttachmentByJobIdInRefetch({ jobIds: props.listJobs?.map((item: any) => item.id) || [] });
}, { immediate: true });

findAllJobAttachmentByJobIdInResult((res) => {
  attachments.value = res.data.findAllJobAttachmentByJobIdIn?.map((att: FileAttachmentInterface) => ({
    quote: att.quote || '',
    attachment: {
      name: att.attachment,
      size: att.size
    },
    downloadPath: att.downloadPath,
    id: att.id
  }));
});

const {
  mutate: deleteDocInFileMutate,
  onDone: deleteDocInFileOnDone
} =
  deleteJobInFolder();
const menuActions = [
  {
    key: 'detail',
    label: 'Xem công việc',
    icon: 'visibility',
    command: () => {
      openFormForJobType(selectedRow.value?.jobType, selectedRow.value?.id, true);
    }
  },
  {
    key: 'detail',
    label: 'Xem tài liệu',
    icon: 'visibility',
    command: function showDetail() {
      showDocDetail.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'delete',
    command: function handleDeleteJobInFile() {
      confirm.require({
        message: t('common.confirmDelete', {
          itemType: 'công việc',
          itemName: selectedRow.value?.jobName,
        }),
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          deleteDocInFileMutate({
            id: props.id,
            idJob: selectedRow.value?.id,
          });
        },
      });
    },
  },
];

deleteDocInFileOnDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: 'Công việc',
      itemName: selectedRow.value?.jobName,
    }),
  });
  confirm.close();
  emits('reload');
});

const currentSort = ref(SORT_TYPE.DOC_NUM);
const menuFilter = computed(() => [
  {
    label: 'Sắp xếp',
    icon: 'pi pi-sort-alt',
    items: [
      {
        label: 'Tên tài liệu',
        icon: currentSort.value === SORT_TYPE.DOC_QUOTE ? 'pi pi-check' : '',
        class: currentSort.value === SORT_TYPE.DOC_QUOTE ? '' : 'margin-icon',
        command: () => {
          currentSort.value = SORT_TYPE.DOC_QUOTE;
        },
      },
    ],
  },
]);

function openFormForJobType( jobType?:JobType, id?: string, checkDetail?:boolean) {
  formId.value = id;
  currentJobType.value = jobType;
  isDetail.value = checkDetail;
  visibleForm.value = true;
}
provide('openFormForJobType', openFormForJobType);
</script>

<style lang='scss' scoped>
:deep(.p-menubar) {
  padding: 0 !important;
}

:deep(.margin-icon) {
  .p-menuitem-text {
    margin-left: 24px !important;
  }
}

:deep(.wrapper-tab .p-tabview-nav-link) {
  padding: 0.75rem !important;
}

:deep(.wrapper-tab .p-tabview-panels) {
  padding: 0 !important;
}

:deep(.p-submenu-list) {
  z-index: 10 !important;
}
</style>
