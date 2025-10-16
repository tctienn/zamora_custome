<template>
  <div class='align-items-center flex justify-content-between'>
    <Menubar :model='menuLeft' />
    <Menubar :model='menuRight' />
  </div>

  <div class='mt-2'>
    <Splitter>
      <SplitterPanel
        :min-size='15'
        :size='30'>
        <div
          class='overflow-auto pt-3'
          style='height: 85vh'>
          <div v-if='currentView === VIEW_TYPE.SHOW_ALL'>
            <TreeFile
              :list-file='listFile'
              @add-doc-to-file='addDocToFile'
              @add-new-file='addNewFile'
              @file-id='getFileId'
              @reload='reload'
              @share-file='shareFile'
              @show-log='showLog'
              @update-file-info='updateFileInfo'/>
          </div>

          <div v-if='currentView === VIEW_TYPE.MINE_SHARE'>
            <TreeFile
              :list-file='
                listFile.filter((item: any) => item.createdBy === user.id)
              '
              title='Hồ sơ của tôi'
              @add-doc-to-file='addDocToFile'
              @add-new-file='addNewFile'
              @file-id='getFileId'
              @reload='reload'
              @share-file='shareFile'
              @show-log='showLog'
              @update-file-info='updateFileInfo'/>
            <TreeFile
              :list-file='
                listFile.filter((item: any) => item.createdBy !== user.id)
              '
              title='Hồ sơ được chia sẻ'
              @add-doc-to-file='addDocToFile'
              @add-new-file='addNewFile'
              @file-id='getFileId'
              @reload='reload'
              @share-file='shareFile'
              @show-log='showLog'
              @update-file-info='updateFileInfo'/>
          </div>

          <div v-if='currentView === VIEW_TYPE.FILE_TYPE'>
            <TreeFile
              v-for='(fileType, i) in [
                ...new Set(listFile.map((item: any) => item.fileType)),
              ]'
              :key='i'
              :list-file='
                listFile.filter((item: any) => item.fileType === fileType)
              '
              :title='getNameFileType(fileType as string)'
              @add-doc-to-file='addDocToFile'
              @add-new-file='addNewFile'
              @file-id='getFileId'
              @reload='reload'
              @share-file='shareFile'
              @show-log='showLog'
              @update-file-info='updateFileInfo'/>
          </div>
        </div>
      </SplitterPanel>
      <SplitterPanel
        :min-size='30'
        :size='70'>
        <FileInfoSplitterPanel
          v-if='file'
          :file='file'
          :list-docs='listDocs'
          @reload='reload'/>
      </SplitterPanel>
    </Splitter>
  </div>

  <FileForm
    v-if='fileFormVisible'
    :id='fileId'
    :is-update='isUpdateFile'
    :visible-dialog='fileFormVisible'
    @hide-dialog='hideFileFormDialog'
    @reload='reload'/>

  <FileShareWithDialog
    v-if='fileShareWithDialogVisible'
    :id='fileId'
    :visible-dialog='fileShareWithDialogVisible'
    @hide-dialog='hideFileShareWithDialog'
    @reload='reload'/>

  <AddDocToFile
    v-if='addDocToFileFormVisible'
    :id='fileId'
    :visible-dialog='addDocToFileFormVisible'
    @hide-dialog='hideAddDocToFileForm'
    @reload='reload'/>

  <FileLogDialog
    v-if='fileLogDialogVisible'
    :id='fileId'
    :visible-dialog='fileLogDialogVisible'
    @hide-dialog='hideFileLogDialog'/>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import {
  getAllByFileName,
  getAllDocsByFileId,
  getFileInfoById,
} from '@/apps/document/api/graphql/file';
import { getAllFileTypes } from '@/apps/document/api/graphql/file-type';
import FileInfoSplitterPanel from '@/apps/document/views/file/component/FileInfoSplitterPanel.vue';
import TreeFile from '@/apps/document/views/file/component/TreeFile.vue';
import AddDocToFile from '@/apps/document/views/file/form/AddDocToFile.vue';
import FileForm from '@/apps/document/views/file/form/FileForm.vue';
import FileLogDialog from '@/apps/document/views/file/form/FileLogDialog.vue';
import FileShareWithDialog from '@/apps/document/views/file/form/FileShareWithDialog.vue';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import { Direction, type Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const isUpdateFile = ref(false);
const fileFormVisible = ref(false);
const fileShareWithDialogVisible = ref(false);
const addDocToFileFormVisible = ref(false);
const fileLogDialogVisible = ref(false);
const currentSort = ref('file_name');
const VIEW_TYPE = {
  SHOW_ALL: 'SHOW_ALL',
  FILE_TYPE: 'FILE_TYPE',
  MINE_SHARE: 'MINE_SHARE',
};
const currentView = ref(VIEW_TYPE.SHOW_ALL);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'file_name',
      direction: Direction.ASC,
    },
  ],
});
const reload = () => {
  getAllByFileNameRefetch({
    fileName: null,
    pageable: pageable,
  });
  if (fileId.value) {
    getFileInfoByIdRefetch({ id: fileId.value });
    getAllDocsByFileIdRefetch({ id: fileId.value });
  }
};
const { user } = useUserStore();
const hideFileFormDialog = () => {
  fileFormVisible.value = false;
  reload();
};
const listFile = ref();
const fileId = ref();
const file = ref();

const addNewFile = (event: Event | null) => {
  fileId.value = event;
  isUpdateFile.value = false;
  fileFormVisible.value = true;
};

const addDocToFile = (event: string) => {
  fileId.value = event;
  addDocToFileFormVisible.value = true;
};

const updateFileInfo = (event: string) => {
  fileId.value = event;
  isUpdateFile.value = true;
  fileFormVisible.value = true;
};

const shareFile = (event: string) => {
  fileId.value = event;
  fileShareWithDialogVisible.value = true;
};

const showLog = (event: string) => {
  fileId.value = event;
  fileLogDialogVisible.value = true;
};

const listDocs = ref();
const {
  onResult: getAllDocsByFileIdResult,
  refetch: getAllDocsByFileIdRefetch,
} = getAllDocsByFileId('');

getAllDocsByFileIdResult((res) => {
  listDocs.value = res.data.getAllDocsByFileId;
});

const { onResult: getFileInfoByIdResult, refetch: getFileInfoByIdRefetch } =
  getFileInfoById('');
getFileInfoByIdResult((res) => {
  file.value = res.data.getFileInfoById;
});

const getFileId = (event: Event) => {
  fileId.value = event;
};

watch(
  fileId,
  (newVal) => {
    if (newVal) {
      getFileInfoByIdRefetch({ id: newVal });
      getAllDocsByFileIdRefetch({ id: newVal });
    }
  },
  { deep: true },
);

const hideFileShareWithDialog = () => {
  fileShareWithDialogVisible.value = false;
};

const hideAddDocToFileForm = () => {
  addDocToFileFormVisible.value = false;
};

const hideFileLogDialog = () => {
  fileLogDialogVisible.value = false;
};

const { onResult: getAllByFileNameResult, refetch: getAllByFileNameRefetch } =
  getAllByFileName(null, pageable);
getAllByFileNameResult((res) => {
  listFile.value = res.data.getAllByFileName;
});

const menuLeft = computed(() => [
  {
    label: 'Thêm mới',
    icon: 'pi pi-plus',
    command: () => {
      addNewFile(null);
    },
  },
  {
    label: 'Sắp xếp',
    icon: 'pi pi-sort-alt',
    items: [
      {
        label: 'Theo tên',
        icon: currentSort.value === 'file_name' ? 'pi pi-check' : '',
        class: currentSort.value === 'file_name' ? '' : 'margin-icon',
        command: () => {
          pageable.sort = [
            {
              property: 'file_name',
              direction: Direction.ASC,
            },
          ];
          currentSort.value = 'file_name';
          reload();
        },
      },
      {
        label: 'Ngày tạo',
        icon: currentSort.value === 'created_time' ? 'pi pi-check' : '',
        class: currentSort.value === 'created_time' ? '' : 'margin-icon',
        command: () => {
          pageable.sort = [
            {
              property: 'created_time',
              direction: Direction.DESC,
            },
          ];
          currentSort.value = 'created_time';
          reload();
        },
      },
      {
        label: 'Thứ tự ',
        icon: currentSort.value === 'num_order' ? 'pi pi-check' : '',
        class: currentSort.value === 'num_order' ? '' : 'margin-icon',
        command: () => {
          pageable.sort = [
            {
              property: 'num_order',
              direction: Direction.ASC,
            },
          ];
          currentSort.value = 'num_order';
          reload();
        },
      },
    ],
  },
  {
    label: 'Hiển thị',
    icon: 'pi pi-bars',
    items: [
      {
        label: 'Tất cả',
        icon: currentView.value === VIEW_TYPE.SHOW_ALL ? 'pi pi-check' : '',
        class: currentView.value === VIEW_TYPE.SHOW_ALL ? '' : 'margin-icon',
        command: () => {
          currentView.value = VIEW_TYPE.SHOW_ALL;
        },
      },
      {
        label: 'Theo loại hồ sơ',
        icon: currentView.value === VIEW_TYPE.FILE_TYPE ? 'pi pi-check' : '',
        class: currentView.value === VIEW_TYPE.FILE_TYPE ? '' : 'margin-icon',
        command: () => {
          currentView.value = VIEW_TYPE.FILE_TYPE;
        },
      },
      {
        label: 'Của tôi/Chia sẻ',
        icon: currentView.value === VIEW_TYPE.MINE_SHARE ? 'pi pi-check' : '',
        class: currentView.value === VIEW_TYPE.MINE_SHARE ? '' : 'margin-icon',
        command: () => {
          currentView.value = VIEW_TYPE.MINE_SHARE;
        },
      },
    ],
  },
]);

const menuRight = ref([
  {
    label: 'Gán tài liệu',
    icon: 'pi pi-tags',
    command: () => {
      if (fileId.value) {
        addDocToFile(fileId.value);
      }
    },
  },
]);
const fileTypes = ref();
const { onResult: getAllFileTypesResult } = getAllFileTypes({ keyword: null });
getAllFileTypesResult((res) => {
  fileTypes.value = res.data.getAllFileTypes;
});

const getNameFileType = (id: string) => {
  return fileTypes.value.find((item: any) => item.id === id)?.name;
};
</script>

<style scoped lang="scss">
:deep(.p-menubar) {
  padding: 0 !important;
}

:deep(.margin-icon) {
  .p-menuitem-text {
    margin-left: 24px !important;
  }
}

:deep(.p-tree) {
  padding: unset !important;
  border: unset !important;
}
</style>
