<template>
  <Dialog
    v-model:visible='visible'
    :header='t("ecm.dialog.chooseFile")'
    modal
    :pt='{
      content: {
        class: "p-0"
      }
    }'
    style='width: 80%'>
    <div class='ecm-storage'>
      <div class='flex justify-content-end p-2'>
        <div class='flex gap-2'>
          <EcmUpButton @go-to-folder='goToFolder($event)'/>
          <DataViewLayoutOptions
            v-model='layout'/>

        </div>
      </div>

      <Splitter>
        <SplitterPanel
          :min-size='10'
          :size='20'>
          <EcmTreeNoRoute
            :selected-folder-id='{[folderId]: true}'
            style='max-height: 65vh'
            @update:selected-folder-id='treeGoToFolder($event)'/>
        </SplitterPanel>
        <SplitterPanel
          :min-size='70'
          :size='80'>
          <div
            v-if='layout === "list"'
            class='border-bottom-1 border-primary col-12 list-header p-0'>
            <div class='flex flex-row'>
              <div class='w-3rem'/>

              <div class='flex flex-1 flex-row'>
                <div
                  class='align-self-center col-8 font-bold'>
                  {{ t('ecm.storage.name') }}
                </div>

                <div class='align-self-center col-2 font-bold text-center'>
                  {{ t('ecm.storage.lastModifiedAt') }}
                </div>

                <div class='align-self-center col-2 font-bold text-center'>
                  {{ t('ecm.storage.fileSize') }}
                </div>
              </div>
            </div>
          </div>
          <div
            class='overflow-auto'
            :style='"max-height: calc(65vh " + ((layout === "list") ? "- 3.5rem)" : ")")'>
            <DataView
              v-if='folders.length'
              class='ecm-full-content'
              data-key='id'
              :layout='layout'
              lazy
              :value='folders'>
              <template #list='{items}'>
                <div
                  class='grid grid-nogutter p-grid p-nogutter'>
                  <EcmFolderNoRouteWithCheckListView
                    v-for='data in items'
                    :key='data.id'
                    :data='data'
                    @go-to-folder='goToFolder($event)'/>
                </div>
              </template>

              <template #grid='{items}'>
                <div
                  class='grid grid-nogutter p-grid p-nogutter'>
                  <EcmFolderNoRouteWithCheckGridView
                    v-for='data in items'
                    :key='data.id'
                    :data='data'
                    @go-to-folder='goToFolder($event)'/>
                </div>
              </template>
            </DataView>

            <DataView
              v-if='files.length'
              data-key='id'
              :layout='layout'
              lazy
              :value='files'>
              <template #list='{items}'>
                <div class='grid grid-nogutter p-grid p-nogutter'>
                  <EcmFileNoRouteWithCheckListView
                    v-for='data in items'
                    :key='data.id'
                    :data='data'/>
                </div>
              </template>

              <template #grid='{items}'>
                <div class='grid grid-nogutter p-grid p-nogutter'>
                  <EcmFileNoRouteWithCheckGridView
                    v-for='data in items'
                    :key='data.id'
                    :data='data'/>
                </div>
              </template>
            </DataView>

            <EmptyResult v-if='isAllEmpty([files, folders])'>
              <h3>{{ t('ecm.storage.noFileFolder') }}</h3>
            </EmptyResult>
          </div>

        </SplitterPanel>
      </Splitter>
    </div>
    <template #footer>
      <Button
        icon='pi pi-ban'
        :label='t("common.close")'
        severity='danger'
        @click='visible = false'/>
      <Button
        :disabled='!selectedFiles || !selectedFiles.length'
        icon='pi pi-check'
        :label='t("common.choose")'
        @click='chooseFiles'/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import type { TreeSelectionKeys } from 'primevue/tree';
import { onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getRootFolderId, listFoldersAndFiles } from '@/apps/ecm/api/graphql/file-manage';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmFileNoRouteWithCheckGridView
  from '@/apps/ecm/views/components/dialog/choose/grid/EcmFileNoRouteWithCheckGridView.vue';
import EcmFolderNoRouteWithCheckGridView
  from '@/apps/ecm/views/components/dialog/choose/grid/EcmFolderNoRouteWithCheckGridView.vue';
import EcmFileNoRouteWithCheckListView
  from '@/apps/ecm/views/components/dialog/choose/list/EcmFileNoRouteWithCheckListView.vue';
import EcmFolderNoRouteWithCheckListView
  from '@/apps/ecm/views/components/dialog/choose/list/EcmFolderNoRouteWithCheckListView.vue';
import EcmUpButton from '@/apps/ecm/views/components/dialog/save/button/EcmUpButton.vue';
import EcmTreeNoRoute from '@/apps/ecm/views/components/view/tree/EcmTreeNoRoute.vue';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { isAllEmpty } from '@/common/helpers/file-utils';
import { useUserStore } from '@/common/store/user';

const emits = defineEmits<{
  chooseFiles: [files: EcmFile[]];
}>();
const { t } = useI18n();
const visible = defineModel('visible', {
  type: Boolean,
  default: false,
});

const { user } = storeToRefs(useUserStore());
const storageStore = useStorageStore();
const {
  folderId,
  folders,
  files,
  layout,
  selectedFiles,
  rootFolderId,
  serviceType,
} = storeToRefs(storageStore);

watch(() => user, (newVal) => {
  if (newVal) {
    loadRootFolder();
  }
});

function treeGoToFolder(keys: TreeSelectionKeys) {
  folderId.value = Object.keys(keys).filter(k => keys[k])[0] || '';
  getFilesAndFolders();
}

function goToFolder(data: EcmFolder) {
  folderId.value = data.id;
  getFilesAndFolders();
}

function loadRootFolder() {
  getRootFolderId(serviceType.value, '').onResult((a) => {
    rootFolderId.value = a.data.rootFolder.id;
    folderId.value = rootFolderId.value;
    getFilesAndFolders();
  });
}

function getFilesAndFolders() {
  listFoldersAndFiles(serviceType.value, folderId.value)
    .onResult((b) => {
      const foldersAndFiles = b.data.listFoldersAndFiles;
      storageStore.setFilesFolders(foldersAndFiles.files, foldersAndFiles.folders);
    });
}

function chooseFiles() {
  emits('chooseFiles', selectedFiles.value as EcmFile[]);
  visible.value = false;
}

onMounted(loadRootFolder);
</script>

<style scoped>

</style>