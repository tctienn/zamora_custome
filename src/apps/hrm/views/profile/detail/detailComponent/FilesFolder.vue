<template>
  <div class='flex flex-column gap-2 w-full'>
    <div class='align-items-center border-1 border-300 border-round-sm flex justify-content-between mb-2 surface-0'>
      <div class='font-bold pl-3 text-lg text-primary'>{{ t('hrm.profile.fileFolder.title') }}</div>
      <div class='align-items-center btn-group-toolbar flex gap-1 mr-1 my-1'>
        <SelectButton
          v-model='viewOption'
          :allow-empty='false'
          class='view-button'
          :option-value='(val: string) => val'
          :options="['list', 'grid']">
          <template #option='slotProps'>
            <i
              :class="{
                'pi pi-bars': slotProps.option === 'list',
                'pi pi-th-large': slotProps.option === 'grid',
              }"
              style='font-size: 1.2rem'></i>
          </template>
        </SelectButton>
      </div>
    </div>

    <div
      v-if="viewOption === 'grid'"
      class='grid grid-nogutter p-3 surface-100'>
      <div
        v-for='(file, idx) in files'
        :key='idx'
        class='col-3 p-2'>

        <div
          class='align-items-center border-2 border-round cursor-pointer flex flex-column hover:shadow-4 justify-content-center p-3 relative shadow-2 surface-800 transition'
          :class="{ 'selected-item': selectedRow?.fileName === file.fileName && selectedRow?.createdBy === file.createdBy }"
          @click='selectedRow = file'>
          <!-- Nút hành động góc phải -->
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='absolute btn-action right-0 top-0 z-2'
            icon='more_vert'
            icon-size='1.4'
            rounded
            text
            @click.stop='toggleActionMenu($event, file)'/>

          <!-- Icon file -->
          <div
            class='mb-2'
            @click.stop='viewDetail(file)'>
            <img
              alt=''
              class='h-5rem w-5rem'
              draggable='false'
              :src='getFileIcon(file.extension)'/>
          </div>

          <!-- Tên file (ellipsis 2 dòng) -->
          <p
            class='file-name-ellipsis mt-1 px-2 text-0 text-center text-sm'
            :title='file.fileName'
            @click.stop='viewDetail(file)'>
            {{ file.fileName }}
          </p>
        </div>

      </div>
    </div>

    <DataTable
      v-else
      v-model:selection='selectedRow'
      row-hover
      selection-mode='single'
      show-gridlines
      :value='files'>
      <Column
        class='text-center'
        header='TT'
        style='width: 5%'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>

      <Column
        field='fileName'
        :header='t("hrm.profile.fileFolder.fileName")'
        :sortable='true'>
        <template #body='{ data: { fileName, extension, path } }'>
          <div
            class='align-content-center cursor-pointer flex flex-wrap gap-2'
            @click='viewDetail({path,extension,fileName})'>
            <img
              alt=''
              class='file-extension-icon h-2rem w-2rem'
              draggable='false'
              :src='getFileIcon(extension)'
              @error='handleFileImageError'/>
            <span
              class='file-name-text mt-1'
              :title='fileName'>
              {{ fileName }}
            </span>
          </div>
        </template>
      </Column>
      <Column
        class='text-center'
        field='type'
        :header='t("hrm.profile.fileFolder.fileType")'
        :sortable='true'
        style='width: 10%'>
        <template #body='{ data: { type } }'>
          {{ getFileType(type) }}
        </template>
      </Column>
      <Column
        class='text-center'
        field='size'
        :header='t("hrm.profile.fileFolder.fileSize")'
        :sortable='true'
        style='width: 10%'>
        <template #body='{ data: { size } }'>
          <div
            v-if='size'>
            {{ convertFileSize(size) }}
          </div>
          <span v-else>-</span>
        </template>
      </Column>
      <Column
        class='text-center'
        field='extension'
        :header='t("hrm.profile.fileFolder.fileFormat")'
        :sortable='true'
        style='width: 10%'></Column>
      <Column
        class='text-center'
        field='createdDate'
        :header='t("hrm.profile.fileFolder.fileCreatedTime")'
        :sortable='true'
        style='width: 15%'>
        <template #body='{ data: { createdDate } }'>
          <span v-if='createdDate'>
            {{ createdDate && moment(createdDate).format('DD/MM/YYYY') }}
          </span>
          <span v-else>-</span>
        </template>
      </Column>
      <Column
        class='text-center'
        field='createdBy'
        :header='t("hrm.profile.fileFolder.fileCreatedBy")'
        style='width: 15%'>
        <template #body='{ data: { createdBy } }'>
          <AppAvatar
            :avatar='generateAvatarUrl(getUserAvatar(createdBy).avt)'
            :label='getUserAvatar(createdBy)?.fullName'
            shape='circle'
            size='2.5'/>

        </template>
      </Column>
      <Column
        class='text-center'
        style='width: 5%'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_vert'
            icon-size='1.4'
            rounded
            text
            @click='toggleActionMenu($event, data)'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuRef'
    :model='menus'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <DialogPreviewFile
    v-if='visiblePreviewFile'
    :name='selectedFile.fileName'
    :url='selectedFile.path'
    :visible='visiblePreviewFile'
    @hide-dialog='visiblePreviewFile = false'/>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getDigitizedFileData } from '@/apps/hrm/api/graphql/digitized-files';
import type { FileDigitized } from '@/apps/hrm/model/fileDigitized';
import DialogPreviewFile from '@/apps/work/views/component/DialogPreviewFile.vue';
import {
  convertFileSize,
  generateAvatarUrl, generateDownloadUrl,
  generatePreviewFileUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
});
const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const { moment } = useMoment();
const { t } = useI18n();
const selectedRow = ref();
const menuRef = ref();
const files = ref<FileDigitized[]>([]);
const viewOption = ref('list');
const visiblePreviewFile = ref(false);
const selectedFile = ref<any>();

function toggleActionMenu(event: Event, data: FileDigitized) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const {
  onResult: getDigitizedFilesByEmployeeIdResult,
  refetch: findContractByEmployeeIdRefetch,
} = getDigitizedFileData(props.employeeId);

getDigitizedFilesByEmployeeIdResult((res) => {
  files.value = res.data.getDigitizedFileForEmployee;
});

const getFileType = (type: string) => {
  switch (type) {
  case 'EMPLOYEE':
    return t('hrm.profile.fileFolder.EMPLOYEE');
  case 'TRAINING_PROCESS':
    return t('hrm.profile.fileFolder.TRAINING_PROCESS');
  case 'DECISION':
    return t('hrm.profile.fileFolder.DECISION');
  case 'OTHER':
    return t('hrm.profile.fileFolder.OTHER');
  default:
    return t('hrm.profile.fileFolder.FILE_DIGITIZED');
  }
};

const getUserAvatar = (userId: string) => {
  const user = allUsers.value.find((user) => user.id === userId);
  return {
    avt: user?.avatar,
    fullName: user?.fullName,
  };
};

function viewDetail(file: any) {
  selectedFile.value = file;
  visiblePreviewFile.value = true;
}

const menus = ref([
  {
    key: 'view',
    label: t('hrm.profile.fileFolder.fileActionOpen'),
    command: () => {
      if (!selectedRow.value?.path) {
        return;
      }
      const fileUrl = generatePreviewFileUrl(selectedRow.value.path);
      if (!fileUrl) {
        return;
      }
      const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
      const isViewable = viewableExtensions.includes(selectedRow.value.extension.toLowerCase());
      if (isViewable) {
        window.open(fileUrl, '_blank');
      }
    },
  },
  {
    key: 'download',
    label: t('hrm.profile.fileFolder.fileActionDownload'),
    command: () => {
      generateDownloadUrl(selectedRow.value.path);
    },
  },
]);
</script>

<style lang='scss' scoped>
.file-name-text {
  max-width: 160px; /* hoặc tuỳ chỉnh phù hợp với table của bạn */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}

.file-name-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 1; /* Chỉ hiển thị 2 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  max-height: 1.5em; /* Tuỳ font-size mà chỉnh */
  line-height: 1.5em;
}

.btn-action {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  z-index: 1;
}

.selected-item {
  border: 2px solid var(--primary-color); /* hoặc màu nổi bật */
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  background-color: var(--blue-100) !important;
}

:deep(.p-selectbutton .p-button:focus) {
  box-shadow: none !important;
  outline: none !important;
}

:deep(.view-button .p-button) {
  padding: 0.3rem 0.75rem !important;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.75rem !important;
}
</style>