<template>
  <div class='flex justify-content-between mb-1'>
    <TabView v-model:active-index='currentTab'>
      <TabPanel header='Danh sách tài liệu'></TabPanel>
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
          placeholder='Nhập Số/Ký hiệu hoặc trích yếu'/>
      </div>
    </div>
  </div>

  <DocTable
    v-if='currentTab === 0'
    :current-sort='currentSort'
    :list-docs='filterDoc'
    @toggle-action-menu='toggleActionMenu'/>
  <DataView
    v-if='currentTab === 1'
    class='ecm-full-content mt-1'
    data-key='id'
    layout='grid'
    lazy
    :value='listAttachment'>
    <template #grid='{ items }'>
      <div class='grid grid-nogutter p-grid p-nogutter'>
        <FileExtensionView
          v-for='data in items'
          :key='data.attachmentId'
          :data='data'/>
      </div>
    </template>
  </DataView>

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
    :doc-id='selectedRow.docId'
    :object-type='selectedRow.objectType'
    :visible-dialog='showDocDetail'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteDocInFile,
  getAllAttachmentsByFileId,
} from '@/apps/document/api/graphql/file';
import { SORT_TYPE } from '@/apps/document/model/file';
import DocTable from '@/apps/document/views/file/component/DocTable.vue';
import FileExtensionView from '@/apps/document/views/file/component/FileExtensionView.vue';
import SidebarDocDetail from '@/apps/document/views/file/component/SidebarDocDetail.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { FilesSystemData } from '@/common/model/attachment';

const props = defineProps({
  listDocs: {
    type: Array as PropType<FilesSystemData[]>,
    default: () => [],
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['reload']);
const currentTab = ref(0);
const { t } = useI18n();
const menuRef = ref();
const selectedRow = ref<any>();
const confirm = useConfirm();
const listAttachment = ref();
const showDocDetail = ref(false);

const {
  onResult: getAllAttachmentsByFileIdResult,
  refetch: getAllAttachmentsByFileIdRefetch,
} = getAllAttachmentsByFileId(props.id);

const hideDialogFn = () => {
  showDocDetail.value = false;
};

getAllAttachmentsByFileIdResult((res) => {
  listAttachment.value = res.data.getAllAttachmentsByFileId;
});

watch(
  () => props.id,
  (newVal) => {
    getAllAttachmentsByFileIdRefetch({ id: newVal });
  },
);

function toggleActionMenu(event: any) {
  menuRef.value.toggle(event[0]);
  selectedRow.value = event[1];
}

const searchText = ref('');
const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const filterDoc = computed(() => {
  const searchValue = removeAccents(searchText.value.toLowerCase().trim());
  return props.listDocs.filter((doc) => {
    const quote = removeAccents(doc.quote?.toLowerCase() || '');
    const docCode = removeAccents(doc.docCode?.toLowerCase() || '');
    return quote.includes(searchValue) || docCode.includes(searchValue);
  });
});

const { mutate: deleteDocInFileMutate, onDone: deleteDocInFileOnDone } =
    deleteDocInFile();
const menuActions = [
  {
    key: 'detail',
    label: t('common.viewDetail'),
    icon: 'visibility',
    command: function showDetail() {
      showDocDetail.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'delete',
    command: function handleDeleteDocInFile() {
      confirm.require({
        message: t('common.confirmDelete', {
          itemType: t('document.file.doc'),
          itemName: selectedRow.value?.quote,
        }),
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          deleteDocInFileMutate({
            id: props.id,
            idDoc: selectedRow.value?.attachmentId,
          });
        },
      });
    },
  },
];

deleteDocInFileOnDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('document.file.doc'),
      itemName: selectedRow.value?.quote,
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
      {
        label: 'Ngày tài liệu',
        icon: currentSort.value === SORT_TYPE.DOC_DATE ? 'pi pi-check' : '',
        class: currentSort.value === SORT_TYPE.DOC_DATE ? '' : 'margin-icon',
        command: () => {
          currentSort.value = SORT_TYPE.DOC_DATE;
        },
      },
      {
        label: 'Số thứ tự',
        icon: currentSort.value === SORT_TYPE.DOC_NUM ? 'pi pi-check' : '',
        class: currentSort.value === SORT_TYPE.DOC_NUM ? '' : 'margin-icon',
        command: () => {
          currentSort.value = SORT_TYPE.DOC_NUM;
        },
      },
      {
        label: 'Loại tài liệu',
        icon: currentSort.value === SORT_TYPE.DOC_TYPE ? 'pi pi-check' : '',
        class: currentSort.value === SORT_TYPE.DOC_TYPE ? '' : 'margin-icon',
        command: () => {
          currentSort.value = SORT_TYPE.DOC_TYPE;
        },
      },
      {
        label: 'Trạng thái',
        icon: currentSort.value === SORT_TYPE.STATUS ? 'pi pi-check' : '',
        class: currentSort.value === SORT_TYPE.STATUS ? '' : 'margin-icon',
        command: () => {
          currentSort.value = SORT_TYPE.STATUS;
        },
      },
    ],
  },
]);
</script>

<style lang="scss" scoped>
:deep(.p-menubar) {
  padding: 0 !important;
}

:deep(.margin-icon) {
  .p-menuitem-text {
    margin-left: 24px !important;
  }
}

:deep(.p-tabview-nav-link) {
  padding: 0.75rem !important;
}

:deep(.p-tabview-panels) {
  padding: 0 !important;
}

:deep(.p-submenu-list) {
  z-index: 10 !important;
}
</style>
