<template>
  <DetailDocumentList
    v-if='viewType==="list"'
    v-model:selection='selectedRow'
    :loading='loading'
    :task-attachments='taskAttachments'
    @toggle-action-menu='toggleActionMenu'
    @view-file='viewFile'/>
  <DetailDocumentGrid
    v-if="viewType==='grid'"
    v-model:selection='selectedRow'
    :task-attachments='taskAttachments'
    @toggle-action-menu='toggleActionMenu'
    @view-file='viewFile'/>

  <Menu
    ref='menuAction'
    :model='menuActionsFiltered'
    :popup='true'>
    <template #item='{item}'>
      <MenuItem
        :icon='item?.icon '
        :label='item?.label'>
      </MenuItem>
    </template>
  </Menu>

  <Dialog
    v-model:visible='renameDialogVisible'
    :header='t("work.task.detail.document.rename")'
    modal
    :style='{ "min-width": "25vw" }'
    @show='newName=selectedRow?.name||""'>
    <div class='field flex flex-column'>
      <label
        v-required
        for='fileFolderName'>{{ t('work.project.folderName') }}</label>
      <InputText
        id='fileFolderName'
        v-model='newName'
        v-file-folder-name
        autofocus='true'
        :placeholder='t("work.task.detail.document.name")'
        @focus='($event.target as HTMLInputElement)?.select()'/>
      <small>{{
        `${t('common.fileFolderNotAllowCharacters')} ${FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS} ${t('common.and')} ${t('common.notStartWithDot')}`
      }}</small>
    </div>
    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>

  <SaveToEcmDialog
    ref='saveToEcmDialogRef'
    v-model:visible='visibleSaveToEcm'
    :filename='selectedRow?.name'
    @chosen='saveToEcm'>
  </SaveToEcmDialog>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import { useConfirm } from 'primevue/useconfirm';
import { computed, type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import SaveToEcmDialog from '@/apps/ecm/views/components/dialog/save/SaveToEcmDialog.vue';
import { deleteAttachmentById, renameAttachment, searchAttachment } from '@/apps/work/api/graphql/task-attachment';
import { downloadTaskAttachment, saveDownloadTaskAttachmentLog } from '@/apps/work/api/rest/task-attachment';
import { type AttachmentSearch, OriginType, type TaskAttachment } from '@/apps/work/model/taskAttachment';
import DetailDocumentGrid from '@/apps/work/views/task/component/detail/document/DetailDocumentGrid.vue';
import DetailDocumentList from '@/apps/work/views/task/component/detail/document/DetailDocumentList.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { ADMIN, DEFAULT_PAGE, FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { downloadFileUrl, generateDownloadUrl, generateFileDownloadUrl } from '@/common/helpers/file-utils';
import type { Edge } from '@/common/model/page';
import { Direction } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  },
  viewType: {
    type: String as PropType<'list' | 'grid'>,
    default: 'list'
  }
});
const { t } = useI18n();
const { user } = storeToRefs(useUserStore());
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const taskAttachments = ref<TaskAttachment[]>([]);
const searchRequest = defineModel<AttachmentSearch>('search', { default: {} });
searchRequest.value = { taskId: props.taskId || '' };
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
const {
  load: loadAtt,
  onResult: attOnResult,
  onError: attOnError,
  refetch: refetchAtt,
  loading: loading
} = searchAttachment(searchRequest.value, page);
if (props.taskId) {
  loadAtt(null, {
    searchRequest: searchRequest.value,
    page
  })
  || refetchAtt({
    searchRequest: searchRequest.value,
    page
  });
  attOnResult(() => {
    return;
  });
}
attOnResult(res => {
  taskAttachments.value = res.data?.searchAttachment?.edges?.map((e: Edge<TaskAttachment>) => {
    return e.node;
  }) || [];
});

const menuActions = ref([
  {
    label: t('common.view'),
    icon: 'preview',
    command: () => {
      viewFile();
    },
  },
  {
    label: t('common.rename'),
    icon: 'edit_document',
    command: () => {
      renameDialogVisible.value = true;
    },
    filter: () => selectedRow.value?.createdBy == user.value.id
  },
  {
    label: t('work.task.detail.document.saveToEcm'),
    icon: 'cloud_download',
    command: () => {
      visibleSaveToEcm.value = true;
    },
  },
  {
    label: t('common.download'),
    icon: 'download',
    command: () => {
      downloadAttachment();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteAtt();
    },
    filter: () => selectedRow.value?.createdBy == user.value.id
  },
]);

const menuActionsFiltered = computed(() => {
  return menuActions.value.filter(e => !e.filter || e.filter());
});
const menuAction = ref<InstanceType<typeof Menu> | null>(null);
const selectedRow = ref<TaskAttachment>();

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: TaskAttachment;
}) {
  menuAction.value?.toggle(event);
  selectedRow.value = data;
}

const newName = ref<string>('');
const renameDialogVisible = ref<boolean>(false);
const footerButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () => renameDialogVisible.value = false
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    type: 'button',
    command: () => renameAtt()
  }
};
provide('dialogFooterButtons', footerButtons);

function renameAtt() {
  renameAttachment().mutate({
    id: selectedRow.value?.id,
    name: newName.value
  })
    .then(() => {
      toastSuccess({ message: t('work.task.detail.document.renameSuccess') });
      refetchData();
      newName.value = '';
      renameDialogVisible.value = false;
    })
  ;
}

const confirm = useConfirm();

function deleteAtt() {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.name, }),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteAttachmentById().mutate({ id: selectedRow.value?.id })
        .then(() => {
          toastSuccess({ message: t('work.task.detail.document.deleteSuccess') });
          refetchData();
        })
      ;
    },
  });

}

function refetchData(search?: AttachmentSearch) {
  page.page = 0;
  refetchAtt({
    searchRequest: search || searchRequest.value,
    page: page
  });
}

function downloadAttachment() {
  if (selectedRow.value?.id) {
    downloadFileUrl(generateUrl(selectedRow.value) || '', selectedRow.value?.name || '');
    saveDownloadTaskAttachmentLog(selectedRow.value?.id);
  }
}

function generateUrl(data: TaskAttachment | undefined): string | undefined {
  if (!data) {
    return undefined;
  }
  switch (data.originType) {
  case OriginType.ECM: {
    return generateFileDownloadUrl(data?.path || '');
  }
  case OriginType.DOCUMENT:
  case OriginType.COMMENT:
  case OriginType.REPORT:
  case OriginType.EVALUATE:
  case OriginType.UPLOAD:
    return generateDownloadUrl(data?.path || '');
  }

}

//Save to ecm
const visibleSaveToEcm = ref<boolean>(false);
const saveToEcmDialogRef = ref<InstanceType<typeof SaveToEcmDialog> | null>();

async function saveToEcm() {
  // const url = generateUrl(selectedRow.value);
  const blob = await downloadTaskAttachment(selectedRow.value?.path || '');
  if (blob) {
    saveToEcmDialogRef.value?.save(blob);
  }
  // const response = await baseApi(url, { method: 'GET', });
}

const router = useRouter();

function viewFile() {
  // const routeData = router.resolve({
  //   name: 'TaskDocumentViewer',
  //   query: { attachmentId: selectedRow.value?.id, }
  // });
  // window.open(routeData.href, '_blank');
  router.push({
    name: 'TaskDocumentViewer',
    query: {
      attachmentId: selectedRow.value?.id,
      url: generateUrl(selectedRow.value)
    },
  });
}

defineExpose({ refetchData });

</script>

<style scoped>
</style>