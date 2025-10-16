<template>
  <div class='flex flex-column gap-2 w-full'>
    <Toolbar class='p-0 pl-2'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <div class='font-semibold'>
            {{ t('hrm.digitizedFile.listDigitized') }}
          </div>
          <Dropdown
            v-model='filterOption.employeeIds'
            class='md:w-14rem w-full'
            :filter='true'
            option-label='fullName'
            option-value='id'
            :options='users'
            panel-class='custom-dropdown'
            :placeholder="t('hrm.digitizedFile.placeHolderEmployee')"
            show-clear>
            <template #option='slotProps'>
              <div class='align-items-center flex gap-2'>
                <AppAvatar
                  :avatar='generateAvatarUrl(slotProps.option.avatar)'
                  shape='square'
                  size='2.5'/>
                <div>
                  <p class='font-semibold mb-0'>{{ slotProps.option.fullName }}</p>
                  <div class='flex'>
                    <p class='mb-0 text-700 text-base'>{{ slotProps.option.jobTitleName }}</p>
                    <p class='border-l-2 mb-0 ml-2 text-700 text-base'>| {{ slotProps.option.organizationName }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Dropdown>
          <Dropdown
            v-model='filterOption.timeType'
            :empty-message='t("common.select")'
            name='time'
            option-label='label'
            option-value='value'
            :options='timeConfig'
            :placeholder="t('hrm.digitizedFile.placeHolderTime')"
            show-clear/>

          <Dropdown
            v-model='filterOption.fileType'
            :empty-message='t("common.select")'
            name='fileType'
            option-label='label'
            option-value='value'
            :options='fileTypeConfig'
            :placeholder="t('hrm.digitizedFile.placeHolderType')"
            show-clear/>

        </div>
      </template>
      <template #end>
        <div class='align-items-center btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            class='btn-summary font-normal text-color'
            icon='pi pi-list'
            icon-size='1.4'
            label='Thống kê'
            severity='warning'
            text
            @click='showSidebar = true'/>
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
      </template>
    </Toolbar>

    <div
      v-if="viewOption === 'grid'"
      class='grid grid-nogutter p-0 surface-0'>
      <div
        v-for='(file, idx) in files'
        :key='idx'
        class='col-1 file-item p-2'>

        <div
          class='align-items-center border-1 border-300 border-round-sm cursor-pointer flex flex-column hover:shadow-4 justify-content-center p-3 relative transition'
          :class="{ 'selected-item': selectedRow?.fileName === file.fileName && selectedRow?.path === file.path }"
          @click='selectedRow = file'>
          <!-- Nút hành động góc phải -->
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='absolute btn-action right-0 top-0'
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
            class='file-name-ellipsis mt-1 px-2 text-center text-color text-sm'
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
      :loading='isLoading'
      row-hover
      scroll-height='calc(100vh - 9rem)'
      scrollable
      selection-mode='single'
      :value='files'>
      <Column
        class='text-center'
        header='TT'
        style='width: 5%'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 + (pageable.page * pageable.size) }}
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
            <p
              class='file-name-text mt-1'
              :title='fileName'>
              {{ fileName }}
            </p>
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
        :header='t("hrm.profile.fileFolder.fileCreatedTime")'
        :sortable='true'
        style='width: 15%'>
        <template #body='{ data: { createdTime } }'>
          {{ createdTime ? moment(createdTime).format('DD/MM/YYYY') : '-' }}
        </template>
      </Column>
      <Column
        class='text-center'
        field='employeeName'
        :header='t("hrm.digitizedFile.forEmployee")'
        style='width: 15%'>
        <template #body='{ data: { employeeName } }'>
          {{ employeeName }}
        </template>
      </Column>
      <Column
        class='text-center'
        field='createdBy'
        :header='t("hrm.profile.fileFolder.fileCreatedBy")'
        style='width: 10%'>
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
        :header='t("common.action")'
        style='width: 7%'>
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
    <Paginator
      v-if='total'
      current-page-report-template='{first}-{last}/{totalRecords}'
      :pt="{
        root: {
          class: 'border-noround-top'
        },
        paginatorwrapper: {
          class: 'custom-paginator-wrapper fix-center'
        },
      }"
      :rows='size'
      template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
      :total-records='total'
      @page='onPage'/>
  </div>

  <Menu
    ref='menuRef'
    :model='menus'
    :popup='true'>
  </Menu>

  <DialogPreviewFile
    v-if='visiblePreviewFile && hasPermission("/HRM/HRM_TOOLS/HRM_DIGITAL_STORAGE/VIEW")'
    :name='selectedRow.fileName'
    :url='selectedRow.path'
    :visible='visiblePreviewFile'
    @hide-dialog='visiblePreviewFile = false'/>
  <DigitizedFolderSidebar v-model:visible='showSidebar'/>
</template>

<script lang='ts' setup>

import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { PageState } from 'primevue/paginator';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getDigitizedFileAllData, saveHistoryUserLogFile } from '@/apps/hrm/api/graphql/digitized-files';
import { findAllEmployees } from '@/apps/hrm/api/graphql/employee';
import type { FileAttachmentEdge } from '@/apps/hrm/model/attachment';
import type { FileDigitized, SearchDigitizedFilePayload } from '@/apps/hrm/model/fileDigitized';
import DigitizedFolderSidebar from '@/apps/hrm/views/digitizedFolder/component/DigitizedFolderSidebar.vue';
import DialogPreviewFile from '@/apps/work/views/component/DialogPreviewFile.vue';
import {
  convertFileSize,
  generateAvatarUrl, generateDownloadUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { type Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const store = useUserMoreInfoStore();
const hasPermission = usePermissionStore().hasPermission;
const pageable = reactive<Pageable>({
  page: 0,
  size: 50
});
const userStore = useUserStore();
const { allUsers } = storeToRefs(store);
const { user } = storeToRefs(userStore);
const { moment } = useMoment();
const { t } = useI18n();
const selectedRow = ref();
const menuRef = ref();
const files = ref<FileDigitized[]>([]);
const viewOption = ref('list');
const total = ref(0);
const size = 50;
const isLoading = ref(false);
const searchTerm = inject('searchTerm', ref(''));

function onPage(event: PageState) {
  pageable.page = event.page;
}

const showSidebar = ref(false);
const filterOption = ref<SearchDigitizedFilePayload>({
  keyword: null,
  employeeIds: null,
  fileType: null,
  timeType: null
});
const visiblePreviewFile = ref(false);
const timeConfig = reactive([
  {
    label: t('hrm.digitizedFile.time.Today'),
    value: 'TO_DAY'
  },
  {
    label: t('hrm.digitizedFile.time.inWeek'),
    value: 'WEEK'
  },
  {
    label: t('hrm.digitizedFile.time.inMonth'),
    value: 'MONTH'
  },
  {
    label: t('hrm.digitizedFile.time.inYear'),
    value: 'YEAR'
  },
]);
const fileTypeConfig = reactive([
  {
    label: 'PDF',
    value: 'pdf'
  },
  {
    label: 'Image',
    value: 'image'
  },
  {
    label: 'Word',
    value: 'word'
  },
  {
    label: 'Excel',
    value: 'xlsx'
  },
  {
    label: 'Khác',
    value: 'other'
  },
]);

function toggleActionMenu(event: Event, data: FileDigitized) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const {
  onResult: getDigitizedAllFiles,
  refetch: getRefetchDigitizedAllFiles
} = getDigitizedFileAllData(filterOption.value, pageable);

getDigitizedAllFiles((res) => {
  isLoading.value = true;
  const {
    totalCount,
    edges
  } = get(res, 'data.getDigitizedFile', {
    totalCount: 0,
    edges: []
  });
  total.value = totalCount;
  files.value = edges.map((edge: FileAttachmentEdge, index: number) => ({
    ...edge.node,
    ordinalNumber: pageable.page * pageable.size + index + 1
  }));
  isLoading.value = false;
});

const { mutate: saveHistoryUserLogFileFolder } = saveHistoryUserLogFile();
const users = ref<any[]>([]);

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
  visiblePreviewFile.value = true;
  selectedRow.value = file;
  saveHistoryUserLogFileFolder({
    userId: user.value.id,
    viewed: true,
    downloaded: false
  });
}

watch(() => filterOption.value,
  (value) => {
    getRefetchDigitizedAllFiles({
      payload: value,
      pageable: pageable
    });
  }, { deep: true, }
);

const menus = ref([
  {
    key: 'view',
    label: t('hrm.profile.fileFolder.fileActionOpen'),
    icon: 'pi pi-eye',
    visible: hasPermission('/HRM/HRM_TOOLS/HRM_DIGITAL_STORAGE/VIEW'),
    command: () => {
      viewDetail(selectedRow.value);
    },
  },
  {
    key: 'download',
    icon: 'pi pi-download',
    visible: hasPermission('/HRM/HRM_TOOLS/HRM_DIGITAL_STORAGE/VIEW'),
    label: t('hrm.profile.fileFolder.fileActionDownload'),
    command: () => {
      generateDownloadUrl(selectedRow.value.path);
      saveHistoryUserLogFileFolder({
        userId: user.value.id,
        viewed: false,
        downloaded: true
      });
    },
  },
]);

onMounted(() => {
  findAllEmployees('').onResult((result) => {
    users.value = result.data?.findAllEmployees || [];
  });
});

watch(() => searchTerm.value, (value) => {
  getRefetchDigitizedAllFiles({
    payload: {
      ...filterOption.value,
      keyword: value
    },
    pageable: pageable
  });
});
</script>

<style lang='scss' scoped>
.file-name-text {
  max-width: 200px; /* hoặc tuỳ chỉnh phù hợp với table của bạn */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}

.file-name-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Chỉ hiển thị 2 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  height: 36px;
  max-height: 3.5em; /* Tuỳ font-size mà chỉnh */
  line-height: 1.5em;
}

.btn-action {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  z-index: 2;
  display: none;
}

.file-item:hover {
  .btn-action {
    display: block;
  }
}

.selected-item {
  border: 2px solid var(--primary-color); /* hoặc màu nổi bật */
  background-color: var(--blue-100) !important;

  .btn-action {
    display: block;
  }
}

.layout-dark {
  .selected-item {
    background-color: var(--blue-800) !important;
  }
}

:deep(.p-selectbutton .p-button:focus) {
  box-shadow: none !important;
  outline: none !important;
}

:deep(.p-toolbar .p-inputtext) {
  padding: 0.4rem 0.75rem !important;
}

.view-button {
  display: flex;

  :deep(.p-button) {
    padding: 0.3rem 0.75rem !important;
  }
}

.btn-summary {
  background: var(--surface-overlay);
  color: var(--text-color);
  border: 1px solid transparent;
  padding: 5px 7px;
  max-height: 30px;
  border-radius: 4px;

  &:hover {
    border: 1px solid var(--surface-400) !important;
    background-color: var(--surface-200) !important;
  }
}

.tool-bar {
  background-color: var(--surface-overlay);
  min-height: 3rem;
}

:deep(.p-calendar .p-inputtext) {
  padding: 0.5rem;
  max-height: 36px;
  margin-top: auto;
  margin-bottom: auto;
}

:deep(.custom-select) {
  max-height: 36px;
  margin-top: auto;
  margin-bottom: auto;
}

:deep(.p-treeselect-label) {
  padding: 0.5rem;
  max-height: 36px;
}

:deep(.p-accordion-header-link) {
  padding: 7px;
}

:deep(.p-paginator-element) {
  max-height: 30px;
  width: 30px;
  min-width: 30px;
  border-radius: 8px;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
  max-height: 36px;
  padding: 0.5rem;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
  width: 32px;
  height: 32px;
}

:deep(.p-paginator .p-dropdown) {
  height: 32px;
  padding: 0;
}

:deep(.p-paginator.p-component) {
  padding: 0;
}

:deep(.p-paginator-current) {
  max-height: 36px;
  padding: 0.5rem;
}
.custom-paginator-wrapper {
  display: flex;
  height: 40px;
  position: absolute;
  align-items: center;
  overflow: hidden;
}

</style>