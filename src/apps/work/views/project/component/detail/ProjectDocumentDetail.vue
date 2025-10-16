<template>
  <div
    class='h-full w-full'>
    <div
      class='flex gap-2'>
      <div
        class='flex-grow-1 list-header p-0'>
        <div class='flex flex-column gap-2'>
          <div
            class='surface-0'>
            <div class='flex justify-content-between pt-2 px-1 surface-0'>
              <p
                class='align-content-center font-semibold pl-2'
                style='font-size:20px'>{{ t('work.project.listAttachment') }}</p>
              <div class='flex gap-1'>
                <InputText
                  v-model='searchKeyword'
                  class=''
                  :placeholder="t('common.search')"
                  @keyup.enter='searchDatatable'/>
                <ButtonIcon
                  v-if='!disableModify'
                  class='bg-black-alpha-10 h-3rem'
                  :disabled='!!disableByStatus'
                  icon='create_new_folder'
                  icon-size='2'
                  label='Tạo thư mục'
                  text
                  @click='showDialogCreateUpdateFolder'/>

                <ButtonIcon
                  v-if='!disableModify'
                  class='bg-black-alpha-10  h-3rem'
                  :disabled='!!disableByStatus'
                  icon='post_add'
                  icon-size='2'
                  label='Tải tệp lên'
                  text
                  @click='selectFilesInput.click()'/>

                <ButtonGroup class='align-content-center'>
                  <ButtonIcon
                    icon='menu'
                    :outlined='!isTableView'
                    @click='changeView(true)'/>
                  <ButtonIcon
                    icon='view_cozy'
                    :outlined='isTableView'
                    @click='changeView(false)'/>
                </ButtonGroup>
              </div>
            </div>
            <div
              v-if='isTableView'>
              <FileFolderListView
                :is-root-prop='isRoot'
                :work-attachments-prop='workAttachments'
                @back-folder='backFolderFn'
                @go-to-folder='goToFolder'
                @toggle-action-menu='toggleActionMenu'/>
            </div>

            <div
              v-else
              class='p-5'>
              <FileFolderGridView
                :is-root='isRoot'
                :work-attachments='workAttachments'
                @back-folder='backFolderFn'
                @go-to-folder='goToFolder'
                @toggle-action-menu='toggleActionMenu'/>
            </div>
          </div>

          <div
            class='flex-grow-1  surface-0'
            style='height: 100rem'>
            <p
              class='font-semibold mb-0 pl-2'
              style='font-size: 20px'>Hình ảnh</p>
            <div
              class=''>
              <div class='grid-container'>
                <div
                  v-for='image in images'
                  :key='image'
                  class='h-full p-2'>
                  <div
                    class='cursor-pointer img-document p-2'
                    @dblclick='viewImg(image.downloadPath)'>
                    <div class=''>
                      <div class='h-9rem overflow-hidden'>
                        <img
                          alt='folder icon'
                          class='w-full'
                          draggable='false'
                          :src='getPreviewFile(image.downloadPath)'/>
                      </div>
                      <div class='font-semibold m-0 pt-1'>
                        {{ image.name.length > 16 ? image.name.slice(0, 16) + '...' : image.name }}
                      </div>
                      <div
                        class='flex justify-content-between pt-1'
                        style='font-size: 12px'>
                        <div>{{ image.createdTime ? moment(image.createdTime).format('HH:mm DD/MM/YY') : '' }}</div>
                        <div>{{ convertFileSize(image.size) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div
        class='flex flex-column gap-2 pl-0 pt-0 w-30rem'>
        <div class='surface-0'>
          <ChartAttachment
            :chart-data='chartData'
            :chart-info='chartInfo'
            @refetch-data='getChartInfoRefetch'
            @type-chart='changeTypeChart'/>
        </div>

        <div class='flex-grow-1'>
          <LogAttachment
            :logs='logs'
            :type-chart='typeChart'/>
        </div>
      </div>
    </div>

    <Menu
      ref='menuAction'
      :model='menuActions'
      :popup='true'>
      <template #item='{item: {icon, label}}'>
        <MenuItem
          :icon='icon'
          :label='label'/>
      </template>
    </Menu>

    <form
      ref='fileUpload'
      class='hidden'
      name='fileUpload'>
      <input
        ref='selectFilesInput'
        :accept='ECM_FILE_ACCEPT.join(" ")'
        class='hidden max-h-0 max-w-0 opacity-0'
        multiple
        name='file'
        type='file'
        @change='uploadEcmFile'>
    </form>

    <DialogCreateUpdateFileFolder
      v-if='visibleDialogFolder'
      :current-path='currentPath'
      :file-folder-prop='selectFileFolder'
      :object-id='props.objectId'
      :parent-id='parentId'
      :visible-dialog='visibleDialogFolder'
      @hide-dialog='hideDialogFolder'/>

    <DialogPreviewFile
      v-if='visiblePreviewFile'
      :name='fileName'
      :url='fileUrl'
      :visible='visiblePreviewFile'
      @hide-dialog='visiblePreviewFile = false'/>
  </div>
</template>

<script setup lang='ts'>
import moment from 'moment';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { backFolder, deleteFileFolder, getFileFolderByPath } from '@/apps/ecm/api/graphql/workAttachment';
import { ECM_FILE_ACCEPT, MAX_FILE_SIZE } from '@/apps/ecm/constants';
import { validateFiles, validateFolder } from '@/apps/ecm/service/upload';
import { findByProjectIdAndObjectType } from '@/apps/work/api/graphql/project-log-api';
import { getChartInfo, getImgByObjectId } from '@/apps/work/api/graphql/work-attachment';
import { createFile, downloadFolder } from '@/apps/work/api/rest/workAttachment';
import { type ProjectLog, ProjectLogType } from '@/apps/work/model/projectLog';
import { AttachmentType, type ChartInfo, type WorkAttachment } from '@/apps/work/model/workAttachment';
import DialogPreviewFile from '@/apps/work/views/component/DialogPreviewFile.vue';
import ChartAttachment from '@/apps/work/views/project/component/detail/ChartAttachment.vue';
import DialogCreateUpdateFileFolder from '@/apps/work/views/project/component/detail/DialogCreateUpdateFileFolder.vue';
import FileFolderGridView from '@/apps/work/views/project/component/detail/FileFolderGridView.vue';
import FileFolderListView from '@/apps/work/views/project/component/detail/FileFolderListView.vue';
import LogAttachment from '@/apps/work/views/project/component/detail/LogAttachment.vue';
import type { ProjectInterface } from '@/apps/work/views/project/model';
import { FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS } from '@/common/constants';
import { toastError, toastSuccess, toastWarn } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import {
  convertFileSize,
  downloadFile,
  generateAvatarUrl,
  generatePreviewFileUrl,
  getPreviewFile
} from '@/common/helpers/file-utils';

const props = defineProps({
  objectId: {
    type: String,
    default: null
  },
  project: {
    type: {} as PropType<ProjectInterface>,
    default: {} as ProjectInterface
  }
});
const disableByStatus = computed(() => ['PAUSE', 'CANCEL', 'CLOSE'].includes(props.project.status));
const typeChart = ref<'pie' | 'bar'>('pie');
const logs = ref<ProjectLog[]>([] as ProjectLog[]);
const images = ref();
const visiblePreviewFile = ref(false);
const chartData = ref();
const fileUrl = ref();
const fileName = ref();
const searchKeyword = ref();
const dataToStore = ref();
const {
  onResult: getLogOnResult,
  refetch: getLogRefetch
} = findByProjectIdAndObjectType(props.objectId, ProjectLogType.WORK_ATTACHMENT);

const {
  load: getImgLoad,
  onResult: getImgResult,
  refetch: getImgRefetch
} = getImgByObjectId();

getImgResult((res) => {
  images.value = res.data.getImgByObjectId;
});

getImgLoad(undefined, { objectId: props.objectId }) || getImgRefetch();

getLogOnResult((res) => {
  logs.value = res.data.findByProjectIdAndObjectType;
});

const chartInfo = ref<ChartInfo>({} as ChartInfo);
const parentId = ref<string>('');

const {
  refetch: getChartInfoRefetch,
  onResult: getChartInfoOnResult
} = getChartInfo(AttachmentType.PROJECT.toLowerCase() + '/' + props.objectId);

getChartInfoOnResult((res) => {
  chartInfo.value = res.data.getChartInfo;
  chartData.value = setChartData();
});

function toggleActionMenu({
  event,
  data
}: { event: Event, data: WorkAttachment }) {
  menuAction.value.toggle(event);
  selectFileFolder.value = data;
}

function viewImg(path: string) {
  window.open(generateAvatarUrl(path), '_blank');
}

const {
  refetch: getFileFolderByPathRefetch,
  onResult: getFileFolderByPathResult,
  load: getFileFolderByPathLoad
} = getFileFolderByPath();

getFileFolderByPathResult((res) => {
  workAttachments.value = res.data.getFileFolderByPath;
  dataToStore.value = workAttachments.value;
});

function changeTypeChart(type: 'pie' | 'bar') {
  typeChart.value = type;
}

function changeView(type: boolean) {
  isTableView.value = type;
}

const isTableView = ref(true);
const disableModify = inject('disableModifyInProject', ref<string>());
const folder = ref();
const workAttachments = ref<WorkAttachment[]>([] as WorkAttachment[]);
const { t } = useI18n();
const isRoot = ref(true);
const visibleDialogFolder = ref(false);
const menuAction = ref();

const currentPath = ref(`${AttachmentType.PROJECT.toString().toLowerCase()}/${props.objectId}`);
const selectFileFolder = ref<WorkAttachment>({} as WorkAttachment);
const selectFilesInput = ref();
const {
  mutate: deleteFileFolderMutate,
  onDone: deleteFileFolderOnDone
} = deleteFileFolder();
const router = useRouter();
getFileFolderByPathLoad(undefined, { path: `${currentPath.value}` }) || getFileFolderByPathRefetch();

const {
  load: backFolderLoad,
  refetch: backFolderRefetch,
  onResult: backFolderOnResult
} = backFolder();

backFolderOnResult((res) => {
  workAttachments.value = res.data.backFolder;
  currentPath.value = workAttachments.value.filter(x => x.isFolder)[0].parentPath;
  let findFolder = workAttachments.value.filter(x => x.isFolder);
  folder.value = findFolder ? findFolder[0] : null;
  isRoot.value = folder.value.parentPath.split('/').length == 2;
  parentId.value = workAttachments.value[0].parentId;
  dataToStore.value = workAttachments.value;
});

function rename() {
  visibleDialogFolder.value = true;
}

function downloadFileFolder(fileFolder: WorkAttachment) {
  downloadFolder(fileFolder.downloadPath, fileFolder.objectId).then((res) => {
    if (res) {
      downloadFile(res, fileFolder.name + (fileFolder.isFolder ? '.zip' : ''));
    }
  });
}

function uploadEcmFile(event: Event) {
  const target = event.target as HTMLInputElement;
  if (validate(target)) {
    const form = target.parentElement;
    const formData = new FormData();
    if (target.files && target.files.length > 0) {
      formData.append('path', currentPath.value!);
      formData.append('file', target.files[0]);
      formData.append('objectId', props.objectId);
      formData.append('objectType', AttachmentType.PROJECT);
      formData.append('parentId', parentId.value);
    }
    if (form) {
      createFile(formData).then((res) => {
        toastSuccess({ message: t('work.project.message.uploadSuccess') });
        getChartInfoRefetch();
        getFileFolderByPathLoad(undefined, { path: currentPath.value }) || getFileFolderByPathRefetch();
        getLogRefetch();
        getImgLoad(undefined, { objectId: props.objectId }) || getImgRefetch();
      }).catch((err) => {
        toastError({ message: t('work.project.message.fileEarlyExist') });
      });
    }
  }
  target.value = '';
}

function validate(target: HTMLInputElement): boolean {
  const invalidFileFolderName = `${t('common.fileFolderNotAllowCharacters')} ${FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS} ${t('common.and')} ${t('common.notStartWithDot')}`;
  if (target) {
    const selectedFiles = target.files;

    if (target.webkitdirectory && !validateFolder(selectedFiles)) {
      toastWarn({
        message: `${t('common.folderEmpty')} ${t('common.or')} ${invalidFileFolderName}`,
        life: 5000
      });
      return false;
    }
    const {
      invalidFileSizes,
      invalidFileNames
    } = validateFiles(selectedFiles);
    if (invalidFileSizes.length) {
      toastWarn({ message: t('ecm.storage.someFilesExceedMaxFileSize', { maxFileSize: convertFileSize(MAX_FILE_SIZE) }) });
      return false;
    }
    if (invalidFileNames.length) {
      toastWarn({ message: invalidFileFolderName });
      return false;
    }
    return true;
  }
  return false;
}

function goToFolder(event: any) {
  if (!event.data.extension) {
    actionGoToFolder(event.data);
  } else {
    visiblePreviewFile.value = true;
    fileUrl.value = generatePreviewFileUrl(event.data?.downloadPath);
    fileName.value = event.data?.name;
    // router.push({
    //   name: 'WorkFileViewer',
    //   query: {
    //     fileId: event.data.id,
    //     objectId: event.data.objectId
    //   }
    // });
  }
}

function goToFolderFromMenu(data: any) {
  if (!data.extension) {
    actionGoToFolder(data);
  } else {
    visiblePreviewFile.value = true;
    fileUrl.value = generatePreviewFileUrl(data?.downloadPath);
    fileName.value = data?.name;
    // router.push({
    //   name: 'WorkFileViewer',
    //   query: {
    //     fileId: data.id,
    //     objectId: data.objectId
    //   }
    // });
  }
}

function actionGoToFolder(data: any) {
  getFileFolderByPathLoad(undefined, { path: `${currentPath.value}/${data.name}` }) || getFileFolderByPathRefetch();
  folder.value = data;
  currentPath.value = `${data.parentPath}/${data.name}`;
  isRoot.value = false;
  parentId.value = data.id;
}

function backFolderFn() {
  backFolderLoad(undefined, { path: `${currentPath.value}` }) || backFolderRefetch();
}

function showDialogCreateUpdateFolder() {
  visibleDialogFolder.value = true;
}

function hideDialogFolder(response: WorkAttachment) {
  visibleDialogFolder.value = false;
  selectFileFolder.value = {} as WorkAttachment;
  getFileFolderByPathLoad(undefined, { path: response.parentPath }) || getFileFolderByPathRefetch();
  getLogRefetch();
}

const confirm = useConfirm();

function deleteDocument() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('work.project.document'),
      itemName: selectFileFolder.value.name
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteFileFolderMutate({
        id: selectFileFolder.value.id,
        path: `${selectFileFolder.value.path}/${selectFileFolder.value.name}`,
        objectId: selectFileFolder.value.objectId
      });
    }
  });
}

const menuActionCondition = [
  {
    label: t('work.project.open'),
    icon: 'preview',
    hidden: false,
    command: () => goToFolderFromMenu(selectFileFolder.value)
  },
  {
    label: t('work.project.download'),
    icon: 'download',
    hidden: false,
    command: () => downloadFileFolder(selectFileFolder.value)
  },
  {
    label: t('Xóa'),
    icon: 'delete',
    hidden: disableByStatus.value,
    command: () => deleteDocument()
  },
  {
    label: t('work.project.rename'),
    icon: 'edit_document',
    hidden: disableByStatus.value,
    command: () => rename()
  }
];

const menuActions = computed(() => menuActionCondition.filter((menu) => !menu.hidden));

onMounted(() => {
  EventBus.on('goToFolder', actionGoToFolder);
});

const setChartData = () => {
  const documentStyle = getComputedStyle(document.body);
  if (typeChart.value == 'pie') {
    return {
      labels: ['PDF', 'Word', 'Excel', 'Image', 'Khác'],
      datasets: [
        {
          data: [chartInfo.value.totalPdf, chartInfo.value.totalDoc, chartInfo.value.totalExcel, chartInfo.value.totalImage, chartInfo.value.totalOther],
          backgroundColor: [documentStyle.getPropertyValue('--green-500'), documentStyle.getPropertyValue('--orange-500'),
            documentStyle.getPropertyValue('--pink-500'), documentStyle.getPropertyValue('--red-500'), documentStyle.getPropertyValue('--gray-500')],
          hoverBackgroundColor: [documentStyle.getPropertyValue('--green-400'), documentStyle.getPropertyValue('--orange-400'),
            documentStyle.getPropertyValue('--pink-400'), documentStyle.getPropertyValue('--red-400'), documentStyle.getPropertyValue('--gray-400')]
        }
      ]
    };
  } else {
    return {
      labels: [''],
      datasets: [
        {
          label: 'PDF',
          data: [chartInfo.value.totalPdf],
          backgroundColor: ['rgba(249, 115, 22, 0.2)'],
          borderColor: ['rgb(249, 115, 22)'],
          borderWidth: 1
        },
        {
          label: 'Word',
          data: [chartInfo.value.totalDoc],
          backgroundColor: ['rgba(6, 182, 212, 0.2)'],
          borderColor: ['rgb(6, 182, 212)'],
          borderWidth: 1
        },
        {
          label: 'Excel',
          data: [chartInfo.value.totalExcel],
          backgroundColor: ['rgb(107, 114, 128, 0.2)'],
          borderColor: ['rgb(107, 114, 128)'],
          borderWidth: 1
        },
        {
          label: 'Image',
          data: [chartInfo.value.totalImage],
          backgroundColor: ['rgba(139, 92, 246 0.2)'],
          borderColor: ['rgb(139, 92, 246)'],
          borderWidth: 1
        },
        {
          label: t('work.project.other'),
          data: [chartInfo.value.totalOther],
          backgroundColor: ['rgba(1, 2, 3, 0.2)'],
          borderColor: ['rgb(1, 2, 3)'],
          borderWidth: 1
        }
      ]
    };
  }
};

function searchDatatable() {
  workAttachments.value = dataToStore.value;
  workAttachments.value = workAttachments.value.filter((attachment) => removeDiacritics(attachment.name).includes(removeDiacritics(searchKeyword.value)));
}

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

deleteFileFolderOnDone((res) => {
  toastSuccess({ message: t('work.project.message.deleteSuccess') });
  getFileFolderByPathLoad(undefined, { path: res.data.deleteFileFolder.parentPath }) || getFileFolderByPathRefetch();
  getChartInfoRefetch();
  getImgLoad(undefined, { objectId: props.objectId }) || getImgRefetch();
  getLogRefetch();
});

</script>

<script lang='ts'>
export default { name: 'ProjectDocumentDetail' };
</script>

<style scoped>
.img-document {
  transition: background-color 0.3s ease; /* Thêm hiệu ứng mượt */
}

.img-document:hover {
  background-color: rgba(0, 0, 0, 0.1) !important; /* Đảm bảo màu nền được áp dụng */
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>