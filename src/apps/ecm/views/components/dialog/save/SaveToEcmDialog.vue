<template>
  <Dialog
    v-model:visible='visible'
    :header="t('ecm.dialog.chooseFolder')"
    modal
    :pt="{
      content: {
        class: 'p-0',
      },
    }"
    style='width: 80%'>
    <div class='ecm-storage'>
      <div class='flex justify-content-between p-2'>
        <EcmNewFolderButton />
        <div class='flex gap-2'>
          <EcmUpButton @go-to-folder='goToFolder($event)' />
          <DataViewLayoutOptions v-model='layout' />
        </div>
      </div>
      <Splitter>
        <SplitterPanel
          :min-size='10'
          :size='20'>
          <EcmTreeNoRoute
            :selected-folder-id='{ [folderId]: true }'
            style='max-height: 63vh'
            @update:selected-folder-id='treeGoToFolder($event)'/>
        </SplitterPanel>
        <SplitterPanel
          :min-size='70'
          :size='80'>
          <div
            v-if="layout === 'list'"
            class='border-bottom-1 border-primary col-12 list-header p-0'>
            <div class='flex flex-row'>
              <div class='align-self-center col-10 font-bold'>
                {{ t("ecm.storage.name") }}
              </div>

              <div class='align-self-center col-2 font-bold text-center'>
                {{ t("ecm.storage.lastModifiedAt") }}
              </div>
            </div>
          </div>
          <DataView
            class='ecm-full-content overflow-auto'
            data-key='id'
            :layout='layout'
            lazy
            :value='folders'>
            <template #empty>
              <EmptyResult>
                <h3>{{ t("ecm.storage.noFolder") }}</h3>
              </EmptyResult>
            </template>
            <template #list='{ items }'>
              <div
                class='grid grid-nogutter p-grid p-nogutter'
                :style="
                  'max-height: calc(63vh ' +
                    (layout === 'list' ? '- 3.5rem)' : ')')
                ">
                <EcmFolderNoRouteListView
                  v-for='data in items'
                  :key='data.id'
                  :data='data'
                  @go-to-folder='goToFolder($event)'/>
              </div>
            </template>

            <template #grid='{ items }'>
              <div
                class='grid grid-nogutter p-grid p-nogutter'
                style='max-height: 63vh'>
                <EcmFolderNoRouteGridView
                  v-for='data in items'
                  :key='data.id'
                  :data='data'
                  @go-to-folder='goToFolder($event)'/>
              </div>
            </template>
          </DataView>
        </SplitterPanel>
      </Splitter>
    </div>
    <template #footer>
      <div class='align-items-center flex-grow-1 grid m-0'>
        <div class='col-1 px-2 py-0 text-right'>
          {{ t("ecm.storage.filename") }}:
        </div>
        <InputText
          v-model='nameToSave'
          class='col-11 py-2' />
        <div class='col-1 px-2 py-0 text-right'>
          {{ t("ecm.fileFolder.type") }}:
        </div>
        <InputText
          v-model='mineType'
          class='col-11 py-2'
          disabled />
      </div>
      <div class='flex flex-column gap-1 px-2'>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click="emits('chosen')"/>
        <Button
          icon='pi pi-ban'
          :label="t('common.close')"
          severity='danger'
          @click='visible = false'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import mime from 'mime';
import { storeToRefs } from 'pinia';
import type { TreeSelectionKeys } from 'primevue/tree';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getRootFolderId,
  listFoldersAndFiles,
  ServiceType,
} from '@/apps/ecm/api/graphql/file-manage';
import { uploadMultiFile } from '@/apps/ecm/api/rest/manage';
import type { EcmFolder } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmNewFolderButton from '@/apps/ecm/views/components/dialog/save/button/EcmNewFolderButton.vue';
import EcmUpButton from '@/apps/ecm/views/components/dialog/save/button/EcmUpButton.vue';
import EcmFolderNoRouteGridView from '@/apps/ecm/views/components/dialog/save/grid/EcmFolderNoRouteGridView.vue';
import EcmFolderNoRouteListView from '@/apps/ecm/views/components/dialog/save/list/EcmFolderNoRouteListView.vue';
import EcmTreeNoRoute from '@/apps/ecm/views/components/view/tree/EcmTreeNoRoute.vue';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { getFileExtension } from '@/common/helpers/file-utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  filename: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['chosen']);

const { t } = useI18n();
const storageStore = useStorageStore();

const { user } = storeToRefs(useUserStore());
const nameToSave = ref(
  props.filename.substring(0, props.filename.lastIndexOf('.')),
);
const mineType = computed(() => {
  const lookup = mime.getType(props.filename);
  return lookup
    ? lookup + ` (${getFileExtension(props.filename, true)})`
    : '*.*';
});
watch(
  () => props.filename,
  (newVal) => {
    nameToSave.value = newVal.substring(0, newVal.lastIndexOf('.'));
  },
);
const { folderId, folders, layout, rootFolderId, serviceType } =
  storeToRefs(storageStore);
serviceType.value = ServiceType.PERSON;

const visible = defineModel('visible', {
  type: Boolean,
  default: true,
});

watch(
  () => user,
  (newVal) => {
    if (newVal) {
      loadRootFolder();
    }
  },
);

function loadRootFolder() {
  getRootFolderId(serviceType.value, '').onResult((a) => {
    rootFolderId.value = a.data.rootFolder.id;
    folderId.value = rootFolderId.value;
    getFilesAndFolders();
  });
}

function getFilesAndFolders() {
  listFoldersAndFiles(serviceType.value, folderId.value).onResult((b) => {
    const foldersAndFiles = b.data.listFoldersAndFiles;
    storageStore.setFilesFolders(
      foldersAndFiles.files,
      foldersAndFiles.folders,
    );
  });
}

function treeGoToFolder(keys: TreeSelectionKeys) {
  folderId.value = Object.keys(keys).filter((k) => keys[k])[0] || '';
  getFilesAndFolders();
}

function goToFolder(data: EcmFolder) {
  folderId.value = data.id;
  getFilesAndFolders();
}

function save(blob: Blob) {
  const form = new FormData();
  form.append(
    'file',
    blob,
    `${nameToSave.value}.${getFileExtension(props.filename)}`,
  );
  form.append('folderId', folderId.value);
  uploadMultiFile(storageStore.serviceType, form).then(() => {
    toastSuccess();
    visible.value = false;
  });
}

defineExpose({ save });

onMounted(loadRootFolder);
</script>

<style scoped></style>
