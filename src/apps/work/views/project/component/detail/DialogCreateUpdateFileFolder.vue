<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("work.project.createFolder")'
    :maximizable='false'
    :style='{ "min-width": "25vw" }'
    @hide='hideDialog'>
    <form
      ref='form'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <div class='flex justify-content-between'>
              <label
                v-required
                for='fileFolderName'>{{ t('work.project.folderName') }}</label>
            </div>
            <input
              v-model='fileFolder.id'
              hidden>
            <InputText
              id='fileFolderName'
              v-model='fileFolder.name'
              v-file-folder-name
              autofocus='true'
              :placeholder='"Tên thư mục"'
              @focus='($event.target as HTMLInputElement)?.select()'/>
            <small>{{
              `${t('common.fileFolderNotAllowCharacters')} ${FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS} ${t('common.and')} ${t('common.notStartWithDot')}`
            }}</small>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { type PropType, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createFolder, findById, rename } from '@/apps/ecm/api/graphql/workAttachment';
import { AttachmentType, type WorkAttachment } from '@/apps/work/model/workAttachment';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG, FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  objectId: {
    type: String,
    default: null
  },
  fileFolderProp: {
    type: Object as PropType<WorkAttachment>,
    default: null
  },
  currentPath: {
    type: String,
    default: null
  },
  parentId: {
    type: String,
    default: null
  }
});

const emits = defineEmits(['hide-dialog']);

const fileFolder = ref<WorkAttachment>({} as WorkAttachment);
const { mutate: renameMutate, onDone: renameOnDone, onError: renameOnError } = rename();
const { t } = useI18n();
const visible = ref(props.visibleDialog);
const { mutate, onDone, onError } = createFolder();

const footerButtons = ref({
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
    type: 'button',
    command: () => hideDialog()
  },
  actionButton: {
    icon: 'check',
    label: t('common.save'),
    type: 'button',
    command: () => submitForm()
  }
});
if (props.fileFolderProp?.id) {
  const { onResult: findByIdOnResult } = findById(props.fileFolderProp?.id);
  findByIdOnResult((res) => {
    fileFolder.value = res.data.findById;
    fileFolder.value = {
      ...fileFolder.value,
      name: fileFolder.value.name.split('.')[0]
    };
  });
}

function submitForm() {
  if (props.fileFolderProp?.id) {
    renameMutate({
      path: props.fileFolderProp.downloadPath,
      newName: fileFolder.value.name
    });
  } else {
    mutate({
      name: fileFolder.value.name,
      path: props.currentPath,
      objectType: AttachmentType.PROJECT,
      objectId: props.objectId,
      parentId: props.parentId
    });
  }
}

renameOnError((err) => {
  // toastError({ message: err.graphQLErrors.toString() });
  toastError({ message: t('work.project.message.fileNameExist') });
});

renameOnDone((res) => {
  toastSuccess({ message: t('work.project.message.renameSuccess') });
  emits('hide-dialog', res.data.rename);
});

onDone((res) => {
  toastSuccess({ message: t('work.project.message.createFolderSuccess') });
  emits('hide-dialog', res.data.createFolder);
});

onError((err) => {
  toastError({ message: t('work.project.message.fileNameExist') });
});

provide('dialogFooterButtons', footerButtons.value);
const hideDialog = () => {
  emits('hide-dialog');
  visible.value = false;
};
</script>

<script lang="ts">
export default { name: 'DialogCreateUpdateFileFolder' };
</script>

<style scoped>

</style>