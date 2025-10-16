<template>
  <ProgressSpinner
    v-if='isLoading'
    class='col col-fixed'
    stroke-width='8'
    style='height: calc(100vh - 10rem)'/>
  <div
    v-else
    class='ecm-storage'>
    <div class='border-y-1 flex-row surface-border'>
      <EcmStorageHeader class='my-2'/>
    </div>
    <div class='flex flex-grow-1 flex-row flex-wrap'>
      <DragUpload
        v-if='isSearch'
        class='ecm-wrap-view flex-1 overflow-y-auto'
        :class='{"has-extra-space": showFilter}'
        :upload-function='ecmUpload'>
        <div
          v-if='layout === "list"'
          class='border-bottom-1 border-gray-100 col-12 list-header p-0'>
          <div class='flex flex-row'>
            <div class='w-3rem'/>

            <div class='flex flex-1 flex-row'>
              <div
                class='align-self-center font-bold'
                :class='serviceType===ServiceType.SHARED? "col-6": "col-8"'>
                {{ t('ecm.storage.name') }}
              </div>

              <div
                v-if='serviceType===ServiceType.SHARED'
                class='align-self-center col-2 font-bold'>
                {{ t('ecm.storage.sharer') }}
              </div>

              <div class='align-self-center col-2 font-bold text-center'>
                {{ t('ecm.storage.lastModifiedAt') }}
              </div>

              <div class='align-self-center col-2 font-bold text-center'>
                {{ t('ecm.storage.fileSize') }}
              </div>
            </div>

            <div class='w-3rem'/>
          </div>
        </div>
        <DataView
          v-if='folders.length'
          data-key='id'
          :layout='layout'
          lazy
          :value='folders'>
          <template #list='{items}'>
            <div class='grid grid-nogutter p-grid p-nogutter'>
              <EcmFolderListView
                v-for='data in items'
                :key='data.id'
                :data='data'/>
            </div>
          </template>

          <template #grid='{items}'>
            <div class='grid grid-nogutter p-grid p-nogutter'>
              <EcmFolderGridView
                v-for='data in items'
                :key='data.id'
                :data='data'/>
            </div>

          </template>
        </DataView>

        <DataView
          v-if='files.length'
          class='ecm-full-content'
          data-key='id'
          :layout='layout'
          lazy
          :value='files'>
          <template #list='{items}'>
            <div class='grid grid-nogutter p-grid p-nogutter'>
              <EcmFileListView
                v-for='data in items'
                :key='data.id'
                :data='data'/>
            </div>
          </template>

          <template #grid='{items}'>
            <div class='grid grid-nogutter p-grid p-nogutter'>
              <EcmFileGridView
                v-for='data in items'
                :key='data.id'
                :data='data'/>
            </div>
          </template>
        </DataView>

        <div
          v-if='isAllEmpty([files, folders])'
          class='align-items-center flex flex-column h-full select-none w-full'
          :class='{"justify-content-center": ([ServiceType.GROUP, ServiceType.PERSON] as ServiceType[]).includes(serviceType)}'
          :draggable='false'>
          <template v-if='([ServiceType.GROUP, ServiceType.PERSON]as ServiceType[]).includes(serviceType)'>
            <AppIcon
              class='opacity-30'
              name='folder_open'
              size='15'/>
            <span class='text-2xl'>{{ t('ecm.storage.fileFolderEmpty') }}</span>
          </template>

          <template v-else>
            <span class='my-3'>{{ t('ecm.storage.noFileFolder') }}</span>
          </template>
        </div>
      </DragUpload>

      <Splitter
        v-if='!isSearch'
        class='flex-grow-1'>
        <SplitterPanel
          v-if='showTree'
          class='tree-panel'
          :class='{"has-extra-space": showFilter}'
          :size='15'>
          <EcmTree/>
        </SplitterPanel>

        <SplitterPanel
          :size='85'>
          <DragUpload
            class='ecm-wrap-view flex-1 overflow-y-auto'
            :class='{"has-extra-space": showFilter}'
            :upload-function='ecmUpload'>
            <div
              v-if='layout === "list"'
              class='border-bottom-1 border-gray-100 col-12 list-header p-0'>
              <div class='flex flex-row'>
                <div class='w-3rem'/>

                <div class='flex flex-1 flex-row'>
                  <div
                    class='align-self-center font-bold'
                    :class='serviceType===ServiceType.SHARED? "col-6": "col-8"'>
                    {{ t('ecm.storage.name') }}
                  </div>

                  <div
                    v-if='serviceType===ServiceType.SHARED'
                    class='align-self-center col-2 font-bold'>
                    {{ t('ecm.storage.sharer') }}
                  </div>

                  <div class='align-self-center col-2 font-bold text-center'>
                    {{ t('ecm.storage.lastModifiedAt') }}
                  </div>

                  <div class='align-self-center col-2 font-bold text-center'>
                    {{ t('ecm.storage.fileSize') }}
                  </div>
                </div>

                <div class='w-3rem'/>
              </div>
            </div>
            <DataView
              v-if='folders.length'
              data-key='id'
              :layout='layout'
              lazy
              :value='folders'>
              <template #list='{items}'>
                <div class='grid grid-nogutter p-grid p-nogutter'>
                  <EcmFolderListView
                    v-for='data in items'
                    :key='data.id'
                    :data='data'/>
                </div>
              </template>

              <template #grid='{items}'>
                <div class='grid grid-nogutter p-grid p-nogutter'>
                  <EcmFolderGridView
                    v-for='data in items'
                    :key='data.id'
                    :data='data'/>
                </div>

              </template>
            </DataView>

            <DataView
              v-if='files.length'
              class='ecm-full-content'
              data-key='id'
              :layout='layout'
              lazy
              :value='files'>
              <template #list='{items}'>
                <div class='grid grid-nogutter p-grid p-nogutter'>
                  <EcmFileListView
                    v-for='data in items'
                    :key='data.id'
                    :data='data'/>
                </div>
              </template>

              <template #grid='{items}'>
                <div class='grid grid-nogutter p-grid p-nogutter'>
                  <EcmFileGridView
                    v-for='data in items'
                    :key='data.id'
                    :data='data'/>
                </div>
              </template>
            </DataView>

            <div
              v-if='isAllEmpty([files, folders])'
              class='align-items-center flex flex-column h-full select-none w-full'
              :class='{"justify-content-center": ([ServiceType.GROUP, ServiceType.PERSON] as ServiceType[]).includes(serviceType)}'
              :draggable='false'>
              <template v-if='([ServiceType.GROUP, ServiceType.PERSON]as ServiceType[]).includes(serviceType)'>
                <AppIcon
                  class='opacity-30'
                  name='folder_open'
                  size='15'/>
                <span class='text-2xl'>{{ t('ecm.storage.fileFolderEmpty') }}</span>
              </template>

              <template v-else>
                <span class='my-3'>{{ t('ecm.storage.noFileFolder') }}</span>
              </template>
            </div>
          </DragUpload>
        </SplitterPanel>
      </Splitter>
    </div>
  </div>

  <FileFolderCreateMenu ref='creationMenu'/>
  <FileFolderActionMenu ref='actionMenu'/>
  <DynamicDialog/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { useDialog } from 'primevue/usedialog';
import { defineAsyncComponent, inject, markRaw, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findFileFolderByKeyword, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { confirmDelete, confirmMoveToTrash, pasteInCurrentFolder, } from '@/apps/ecm/service/action-file-folder';
import { ecmUpload } from '@/apps/ecm/service/upload';
import { useStorageStore } from '@/apps/ecm/store/storage';
import FileFolderActionMenu from '@/apps/ecm/views/components/contextMenu/FileFolderActionMenu.vue';
import FileFolderCreateMenu from '@/apps/ecm/views/components/contextMenu/FileFolderCreationMenu.vue';
import EcmSharedInfoButtons from '@/apps/ecm/views/components/share/EcmSharedInfoButtons.vue';
import DragUpload from '@/apps/ecm/views/components/view/drag&drop/DragUpload.vue';
import EcmFileGridView from '@/apps/ecm/views/components/view/grid/EcmFileGridView.vue';
import EcmFolderGridView from '@/apps/ecm/views/components/view/grid/EcmFolderGridView.vue';
import EcmStorageHeader from '@/apps/ecm/views/components/view/header/EcmStorageHeader.vue';
import EcmFileListView from '@/apps/ecm/views/components/view/list/EcmFileListView.vue';
import EcmFolderListView from '@/apps/ecm/views/components/view/list/EcmFolderListView.vue';
import EcmTree from '@/apps/ecm/views/components/view/tree/EcmTree.vue';
import EventBus from '@/common/helpers/event-bus';
import { isAllEmpty } from '@/common/helpers/file-utils';

const { t } = useI18n();
const store = useStorageStore();
const storageStore = useStorageStore();
const isLoading = ref(false);
const isSearch = ref(false);
const {
  folders,
  files,
  selectedFileFolders,
  layout,
  showFilter,
  folderId,
  rootFolderId,
  showTree,
  hasCreateAction,
  serviceCanDelete,
  serviceType
} = storeToRefs(store);

const {
  load: searchLoad,
  onResult: searchOnResult
} = findFileFolderByKeyword();
const dialog = useDialog();
const EcmSharedInfo = defineAsyncComponent(() => import('@/apps/ecm/views/components/share/EcmSharedInfo.vue'));
const searchTerm = inject('searchTerm', ref(''));
searchOnResult((res) => {
  const data = res.data.findFileFolderByKeyword;
  storageStore.setFilesFolders(data.files, data.folders);
  isLoading.value = false;
});

const actionMenu = ref();
const creationMenu = ref();

function toggleCreationMenu(event: Event, isContextMenu: boolean) {
  event.preventDefault();
  creationMenu.value.toggleCreationMenu(event, isContextMenu);
  actionMenu.value.hideMenu();
}

function toggleActionMenu(e: Event) {
  actionMenu.value.toggleMenu(e);
  creationMenu.value.hideMenu();
}

function correctHeight() {
  const nodes = document.querySelectorAll<HTMLElement>('.ecm-wrap-view, .ecm-tree');
  nodes.forEach(n => {
    const clientRect = n.getBoundingClientRect();
    if (clientRect?.top) {
      n.style.height = window.innerHeight - clientRect.top - 8 + 'px';
    }
  });
}

onMounted(() => {
  EventBus.on('toggleEcmActionMenu', toggleActionMenu);
  EventBus.on('openShareDialog', openShareDialog);
  EventBus.on('correctEcmViewHeight', correctHeight);
  // window.addEventListener('keydown', keyDownHandler);
  const ecmStorage = document.getElementsByClassName('ecm-storage');
  if (ecmStorage.length > 0) {
    ecmStorage[0].setAttribute('tabIndex', '0');
    (ecmStorage[0] as HTMLElement).addEventListener('keydown', keyDownHandler);
  }

  if (hasCreateAction.value) {
    const dataViewGridElements = document.getElementsByClassName('p-dataview-content');
    if (dataViewGridElements) {
      for (let item of dataViewGridElements) {
        item.addEventListener('contextmenu', (event: Event) => toggleCreationMenu(event, true));
      }
    }
  }

  correctHeight();
});

onUnmounted(() => {
  EventBus.off('toggleEcmActionMenu', toggleActionMenu);
  EventBus.off('openShareDialog', openShareDialog);
  EventBus.off('correctEcmViewHeight', correctHeight);

  const ecmStorage = document.getElementsByClassName('ecm-storage');
  if (ecmStorage.length > 0) {
    ecmStorage[0].removeAttribute('tabIndex');
    (ecmStorage[0] as HTMLElement).removeEventListener('keydown', keyDownHandler);
  }
});

function keyDownHandler(event: KeyboardEvent) {
  if (event.ctrlKey) {
    event.preventDefault();
    switch (event.code) {
    case 'KeyA': {
      if (selectedFileFolders.value.length) {
        selectedFileFolders.value = [];
      } else {
        selectedFileFolders.value = [...folders.value, ...files.value];
      }
      break;
    }
    case 'KeyC': {
      if (hasCreateAction.value) {
        store.copy();
      }
      break;
    }
    case 'KeyX': {
      if (hasCreateAction.value) {
        store.cut();
      }
      break;
    }
    case 'KeyV': {
      pasteInCurrentFolder();
      break;
    }
    default:
      break;
    }
  }
  if (['Delete', 'NumpadDecimal'].includes(event.code)) {
    event.preventDefault();
    if (serviceCanDelete.value) {
      confirmDelete();
    } else {
      confirmMoveToTrash();
    }
  }
}

function openShareDialog(id: { fileFolderId: string, isFolder: boolean }) {
  dialog.open(EcmSharedInfo, {
    props: {
      header: t('common.share'),
      style: { width: '37rem', },
      modal: true
    },
    templates: { footer: markRaw(EcmSharedInfoButtons) },
    data: id,
  });
}

watch(searchTerm, (value) => {
  isLoading.value = true;
  searchLoad(undefined, {
    type: ServiceType[serviceType.value ? serviceType.value : ServiceType.PERSON],
    folderId: folderId.value,
    keyword: value
  });
  isSearch.value = !!value;
});
</script>

<script lang='ts'>

export default { name: 'EcmStorage', };
</script>

<style scoped lang='scss'>
:deep(.filter-selection) {
  .p-dropdown-label {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}

.tree-panel {
  min-width: 5%;
  max-width: 20%;
}
</style>
