<template>
  <Dialog
    v-if='fileType'
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form
      ref='form'
      v-disabled='{ disabled: isDetail }'
      @submit.prevent='submit'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='fileTypeCode'>{{
                t("document.fileType.code")
              }}</label>
            <InputText
              v-model='fileType.code'
              v-code
              :autofocus='isCreate'
              :disabled='!isCreate'/>
            <InputText
              v-model='fileType.code'
              hidden
              name='code' />
            <small
              v-if='submitForm && !fileType.code'
              class='p-error'>{{
                t("document.fileType.errors.codeEmpty")
              }}</small>
          </div>

          <div class='col field'>
            <label
              v-required
              for='fileTypeName'>{{
                t("document.fileType.name")
              }}</label>
            <InputText
              v-model='fileType.name'
              v-trim
              :autofocus='!isCreate'
              name='name'/>
            <small
              v-if='submitForm && !fileType.name'
              class='p-error'>{{
                t("document.fileType.errors.nameEmpty")
              }}</small>
          </div>
        </div>
      </div>
    </form>
    <template #footer>
      <div
        class='fixed flex gap-2 justify-content-center pb-2 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'
          @click='submit'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { assign, isNull, omit } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getFileTypeById,
  saveFileType,
} from '@/apps/document/api/graphql/file-type';
import { type FileTypeInterface } from '@/apps/document/model/fileType';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

if (props.id) {
  const { onResult } = getFileTypeById(props.id || '');
  onResult((res) => {
    fileType.value = { ...res.data.getFileTypeById };
  });
}

const { t } = useI18n();

let form = ref();
const submitForm = ref(false);

const visible = ref(props.visibleDialog);
const fileType = ref<FileTypeInterface>({} as FileTypeInterface);
const isCreate = isNull(props.id);

const headerDialog = isNull(props.id)
  ? t('common.createItem', { item: lowercaseFirstLetter(t('document.fileType.objectName')), })
  : t('common.editItemName', {
    item: lowercaseFirstLetter(t('document.fileType.objectName')),
    name: fileType.value.name,
  });

function lowercaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const {
  mutate: saveFileTypeMutate,
  onDone: saveFileTypeDone,
  onError: saveFileTypeError,
} = saveFileType();

function submit() {
  submitForm.value = true;
  if (!fileType.value.code || !fileType.value.name) {
    return;
  }
  assign(fileType.value, { id: fileType.value['id'] ? fileType.value['id'] : null, });
  saveFileTypeMutate({ fileType: { ...omit(fileType.value) } });
}

saveFileTypeDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('document.fileType.objectName'),
      itemName: fileType.value.name,
    }),
  });
  emits('reload');
  emits('hide-dialog');
  fileType.value = {
    code: '',
    id: undefined,
    name: '',
  };
});
saveFileTypeError((mess) => {
  if (mess.graphQLErrors) {
    mess.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t('document.fileType.errors.' + errorCode.toString()), });
      }
    });
  }
});
</script>

<style>
.p-fluid .uploadFile .p-button {
  width: unset;
}
</style>
