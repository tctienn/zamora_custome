<template>
  <div class='align-items-center flex justify-content-between'>
    <Menubar
      :model='menuLeft'
      :pt="{ submenu: { style: 'min-width: 200px' } }"/>
    <Menubar
      v-if='!isMyEmployee'
      :model='menuRight'/>
  </div>

  <div class='mt-2'>
    <Splitter>
      <SplitterPanel
        :min-size='15'
        :size='30'>
        <TabView
          v-if='roles?.includes("LANH_DAO_NHIEM_VU") || roles?.includes("TRUONG_PHONG") || roles?.includes("PHO_PHONG")'
          :pt='{
            panelcontainer: { class: "p-0" }
          }'
          @tab-change='(e) => {
            onSelectTab(e.index)
          }'>
          <TabPanel
            v-for='tab in tabs'
            :key='tab.title'
            :header='tab.title'
            :pt='{
              headeraction: { class: "p-3" },
            }'>
            <div
              class='overflow-auto pt-1'
              style='height: 85vh'>
              <TreeFile
                :list-file='listFolder'
                @add-job-to-folder='addJobToFolderDialog'
                @add-new-file='addNewFolder'
                @file-id='getFolderId'
                @reload='reload'
                @share-file='shareFile'
                @show-log='showLog'
                @update-file-info='updateFolderInfo'/>
            </div>
          </TabPanel>
        </TabView>
        <div
          v-else
          class='overflow-auto pt-3'
          style='height: 85vh'>
          <TreeFile
            :list-file='listFolder'
            @add-job-to-folder='addJobToFolderDialog'
            @add-new-file='addNewFolder'
            @file-id='getFolderId'
            @reload='reload'
            @share-file='shareFile'
            @show-log='showLog'
            @update-file-info='updateFolderInfo'/>
        </div>

      </SplitterPanel>
      <SplitterPanel
        :min-size='30'
        :size='70'>
        <FileInfoSplitterPanel
          v-if='folder'
          :folder='folder'
          :list-jobs='listJob'
          @reload='reload'/>
      </SplitterPanel>
    </Splitter>
  </div>

  <FileForm
    v-if='fileFormVisible'
    :id='folderId'
    :is-update='isUpdateFolder'
    :visible-dialog='fileFormVisible'
    @hide-dialog='hideFolderFormDialog'
    @reload='reload'/>

  <FileLogDialog
    v-if='fileLogDialogVisible'
    :id='folderId'
    :visible-dialog='fileLogDialogVisible'
    @hide-dialog='hideFolderLogDialog'/>

  <AddJobToFolderDialog
    v-if='addJobToFolderDialogVisible'
    :id='folderId'
    :visible-dialog='addJobToFolderDialogVisible'
    @hide-dialog='hideAddJobToFolderDialogDialog'/>

  <FolderShareWithDialog
    v-if='fileShareWithDialogVisible'
    :id='folderId'
    :visible-dialog='fileShareWithDialogVisible'
    @hide-dialog='hideFileShareWithDialog'
    @reload='reload'/>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import { computed, inject, provide, reactive, ref, watch } from 'vue';

import { currentUser } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllByFolderName, getFolderInfoById, getJobsInFolder } from '@/apps/mission/api/graphql/folder';
import FileInfoSplitterPanel from '@/apps/mission/views/folder/component/FileInfoSplitterPanel.vue';
import FolderShareWithDialog from '@/apps/mission/views/folder/component/FolderShareWithDialog.vue';
import TreeFile from '@/apps/mission/views/folder/component/TreeFile.vue';
import AddJobToFolderDialog from '@/apps/mission/views/folder/form/AddJobToFolderDialog.vue';
import FileForm from '@/apps/mission/views/folder/form/FileForm.vue';
import FileLogDialog from '@/apps/mission/views/folder/form/FileLogDialog.vue';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const isUpdateFolder = ref(false);
const fileFormVisible = ref(false);
const addJobToFolderDialogVisible = ref(false);
const fileLogDialogVisible = ref(false);
const currentSort = ref('folder_name');
const isMyEmployee = ref(false);
const nameFolder = ref<string>();

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'folder_name',
      direction: Direction.ASC,
    },
  ],
});
const searchTerm = inject('searchTerm', ref(''));
const reload = () => {
  getAllByFolderNameRefetch({
    folderName: searchTerm.value,
    isMyEmployee: isMyEmployee.value,
    pageable: pageable,
  });
  if (folderId.value) {
    getFolderInfoByIdRefetch({ id: folderId.value });
    getJobsInFolderRefetch({ id: folderId.value });
  }
};
const hideFolderFormDialog = () => {
  fileFormVisible.value = false;
  reload();
};
watch(searchTerm, () => {
  reload();
});
const fileShareWithDialogVisible = ref(false);
const listFolder = ref();
const folderId = ref();
const folder = ref();
const listJob = ref();

const addNewFolder = (event: Event | null) => {
  folderId.value = event;
  isUpdateFolder.value = false;
  fileFormVisible.value = true;
};

const addJobToFolderDialog = (event: string) => {
  folderId.value = event;
  addJobToFolderDialogVisible.value = true;
};

const updateFolderInfo = (event: string) => {
  folderId.value = event;
  isUpdateFolder.value = true;
  fileFormVisible.value = true;
};

const showLog = (event: string) => {
  folderId.value = event;
  fileLogDialogVisible.value = true;
};

const hideFileShareWithDialog = () => {
  fileShareWithDialogVisible.value = false;
};

const { onResult: currentUserResult } =
  currentUser();

const roles = ref();

currentUserResult((res) => {
  roles.value = get(res, 'data.currentUser.roles', []);
});

const {
  onResult: getFolderInfoByIdResult,
  refetch: getFolderInfoByIdRefetch
} =
  getFolderInfoById('');
getFolderInfoByIdResult((res) => {
  folder.value = res.data.getFolderInfoById;
});

const getFolderId = (event: Event) => {
  folderId.value = event;
};

const {
  onResult: getJobsInFolderResult,
  refetch: getJobsInFolderRefetch,
} = getJobsInFolder('');

getJobsInFolderResult((res) => {
  listJob.value = res.data.getJobsInFolder;
});

watch(
  folderId,
  (newVal) => {
    if (newVal) {
      getFolderInfoByIdRefetch({ id: newVal });
      getJobsInFolderRefetch({ id: newVal });
    }
  },
  { deep: true },
);

const hideAddJobToFolderDialogDialog = () => {
  addJobToFolderDialogVisible.value = false;
  getJobsInFolderRefetch({ id: folderId.value });
};

const hideFolderLogDialog = () => {
  fileLogDialogVisible.value = false;
};

const {
  onResult: getAllByFolderNameResult,
  refetch: getAllByFolderNameRefetch
} =
  getAllByFolderName(null, false, pageable);
getAllByFolderNameResult((res) => {
  listFolder.value = res.data.getAllByFolderName;
});

const shareFile = (event: string) => {
  folderId.value = event;
  fileShareWithDialogVisible.value = true;
};

const menuLeft = computed(() => [
  {
    label: 'Thêm mới hồ sơ',
    icon: 'pi pi-plus',
    command: () => {
      addNewFolder(null);
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
    items: [],
  },
]);

const onSelectTab = (index: number) => {
  isMyEmployee.value = index !== 0;
  reload();
};

const tabs = ref([
  { title: 'Của tôi' },
  { title: 'Nhân viên của tôi' },
]);

const menuRight = ref([
  {
    label: 'Thêm công việc vào hồ sơ',
    icon: 'pi pi-tags',
    command: () => {
      if (folderId.value) {
        addJobToFolderDialog(folderId.value);
      } else {
        toastError({ message: 'Bạn cần chọn hồ sơ của tôi để thêm' });
      }
    },
  },
]);
provide('nameFolder', nameFolder);
</script>

<style scoped lang='scss'>
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
