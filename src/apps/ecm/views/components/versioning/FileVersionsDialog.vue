<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='t("ecm.fileFolder.versions.listVersion")'
    @hide='emits("hide-dialog")'>

    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      :loading='loading'
      :total-records='fileVersions.length'
      :value='fileVersions'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {itemType: toLower(t('ecm.fileFolder.version'))})
        }}</span>
      </template>

      <Column
        field='ordinalNumber'
        header='#'>
      </Column>

      <Column
        field='user.fullName'
        :header='t("ecm.fileFolder.versions.agent")'/>

      <Column
        field='action'
        :header='t("ecm.fileFolder.versions.action")'/>

      <Column
        field='time'
        :header='t("ecm.fileFolder.versions.actionAt")'/>

      <Column
        field='version'
        :header='t("ecm.fileFolder.version")'>
      </Column>

      <Column
        class='text-center'>
        <template #body='{data}'>
          <ButtonIcon
            v-tooltip.top='t("ecm.storage.fileFolderActions.download")'
            class='text-color'
            icon='download'
            icon-size='1.5'
            rounded
            text
            @click='downloadVersionFn(data)'/>
          <ButtonIcon
            v-tooltip.top='t("ecm.fileFolder.versionActions.revert")'
            class='text-color'
            icon='reply'
            icon-size='1.5'
            rounded
            text
            @click='revertVersionConfirm(data)'/>
          <ButtonIcon
            v-tooltip.top='t("ecm.fileFolder.versionActions.viewVersion")'
            class='text-color'
            icon='visibility'
            icon-size='1.5'
            rounded
            text
            @click='viewVersion(data)'/>
          <ButtonIcon
            v-if='data != version'
            v-tooltip.top='t("ecm.fileFolder.versionActions.deleteVersion")'
            class='text-color'
            icon='delete'
            icon-size='1.5'
            rounded
            text
            @click='deleteVersion(data)'/>
        </template>
      </Column>
    </DataTable>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { cloneDeep, find, get, map, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFileVersionsGraphql, revertGraphql, ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { downloadVersion } from '@/apps/ecm/api/rest/manage';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import { type VcsHistory } from '@/apps/ecm/model/file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { confirm } from '@/common/helpers/custom-confirmation-service';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { downloadFile, generateFileVersionEditorUrl, removeVersion } from '@/common/helpers/file-utils';
import { convertReadableDate } from '@/common/helpers/utils';
import router from '@/common/router';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  fileId: {
    type: String,
    default: ''
  }
});
const emits = defineEmits(['hide-dialog']);
const version = ref();
const { t } = useI18n();

const fileVersionFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  }
};
provide('dialogFooterButtons', fileVersionFooterButtons);

const visible = ref(props.dialogVisible);
const storageStore = useStorageStore();
const { serviceType, selectedFileFolders, files } = storeToRefs(storageStore);
const fileVersions = ref<VcsHistory[]>([]);
const loading = ref(true);

const file = ref(find(files.value, { id: props.fileId }));

const {
  onResult: getFileVersionsResult,
  refetch: getFileVersionsRefetch
} = getFileVersionsGraphql(serviceType.value, props.fileId);
getFileVersionsResult((response) => {
  loading.value = false;
  fileVersions.value = map(cloneDeep(get(response, 'data.fileVersions', [])), (version, index) => {
    version.ordinalNumber = index + 1;
    version.action = t(`ecm.fileFolder.versionActions.${toLower(version.action)}`);
    version.time = convertReadableDate(version.time);
    return version;
  });
  version.value = fileVersions.value[fileVersions.value.length - 1];
});

const {
  mutate: revertMutate,
  onDone: revertDone
} = revertGraphql();

function toggleDialog() {
  visible.value = !visible.value;
}

function downloadVersionFn(data: VcsHistory) {
  downloadVersion(serviceType.value, selectedFileFolders.value[0].id, data.md5).then((res) => {
    downloadFile(res.data, res.headers['content-disposition'] ? decodeURI(res.headers['content-disposition']
      .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)[1]
      .replaceAll('"', '')) : 'unknown');
  });
}

function revertVersionConfirm(data: VcsHistory) {
  confirm({
    message: t('ecm.fileFolder.versions.revertConfirm'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => revertVersion(data)
  });
}

function viewVersion(data: VcsHistory) {
  if (EDITABLE_FILE_TYPES.includes(toLower(file.value?.extension))) {
    window.open(generateFileVersionEditorUrl(props.fileId, data.md5));
  } else {
    router.push({
      name: 'ViewFileVersion',
      params: { fileId: props.fileId },
      query: { md5: data.md5 }
    });
  } 
}

function deleteVersion(data: VcsHistory) {
  removeVersion(file.value?.treePath as string, data.md5, data.version).then(() => {
    refetchData();
    toastSuccess({ message: t('ecm.fileFolder.message.deleteVersionSuccess') });
  });
}

function revertVersion(data: VcsHistory) {
  revertMutate({
    type: ServiceType[serviceType.value],
    fileId: props.fileId,
    md5: data.md5
  });
}

revertDone(() => {
  refetchData();
});

function refetchData() {
  getFileVersionsRefetch({
    type: ServiceType[serviceType.value],
    fileId: props.fileId
  });
}

defineExpose({ toggleDialog });
</script>

<script lang='ts'>
export default { name: 'FileVersionsDialog' };
</script>