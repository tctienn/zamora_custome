<template>
  <Sidebar
    v-model:visible='visible'
    :dismissable='false'
    :header='headerDialog'
    position='right'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form
      ref='form'
      @submit.prevent='submit'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-12 field'>
            <label
              v-required
              for='folderName'>{{
                t('document.file.name')
              }}</label>
            <InputText
              v-model='file.folderName'
              v-trim
              name='folderName'/>
            <small
              v-if='submitForm && !file.folderName'
              class='p-error'>{{
                t('document.file.errors.nameEmpty')
              }}</small>
          </div>

          <div class='col-12 field'>
            <label for='folderParent'>{{ t('document.file.fileParent') }}</label>
            <TreeSelect
              v-model='folderParent'
              class='w-full'
              :empty-message="t('common.selectEmpty')"
              :filter='true'
              :options='files'
              selection-mode='single'></TreeSelect>
          </div>

          <div class='col-6 field'>
            <label
              for='folderType'>{{
                t('document.file.fileType')
              }}</label>
            <NamedDropdown
              :id='id'
              v-model='file.folderType'
              class='w-full'
              name='fileType'
              option-label='name'
              option-value='id'
              :options='fileTypes'/>
          </div>

          <div class='col-3 field'>
            <label
              v-required
              for='folderType'>{{
                t('document.file.fileYear')
              }}</label>
            <InputNumber
              v-model='file.folderYear'
              class='w-full'
              input-id='integeronly'
              :use-grouping='false'/>
            <input
              v-model='file.folderYear'
              hidden
              name='folderYear'/>
            <small
              v-if='submitForm && !file.folderYear'
              class='p-error'>{{
                t('document.file.errors.fileYearEmpty')
              }}</small>
          </div>

          <div class='col-3 field'>
            <label for='numOrder'>{{ t('document.file.numOrder') }}</label>
            <InputNumber
              v-model='file.numOrder'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='file.numOrder'
              hidden
              name='numOrder'/>
          </div>

          <div class='col-4 field'>
            <label>{{ t('document.file.createdTime') }}</label>
            <Calendar
              v-model='file.createdTime'
              class='w-full'
              disabled
              icon-display='input'
              show-icon/>
          </div>

          <div class='col-4 field'>
            <label class='align-items-center flex justify-content-center'>{{
              t('document.file.createdBy')
            }}</label>
            <div class='align-items-center flex justify-content-center mt-2'>
              <AppUser :user-id='file.createdBy'/>
            </div>
          </div>

          <div class='col-4 field'>
            <label>{{ t('document.file.status') }}</label>
            <div class='flex flex-wrap gap-3 mt-2'>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='file.status'
                  name='status'
                  :value='true'/>
                <label
                  class='ml-2'
                  for='ingredient1'>Bật</label>
              </div>
              <div class='align-items-center flex'>
                <RadioButton
                  v-model='file.status'
                  name='status'
                  :value='false'/>
                <label
                  class='ml-2'
                  for='ingredient2'>Tắt</label>
              </div>
            </div>
          </div>

          <div class='col-12 field'>
            <label class='font-bold'>{{ t(`document.file.note`) }}</label>
            <Textarea
              v-model='file.note'
              class='w-full'
              cols='30'
              rows='5'/>
          </div>
        </div>
      </div>
      <div
        class='bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'/>
      </div>
    </form>
  </Sidebar>
</template>

<script setup lang='ts'>
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllFileTypes } from '@/apps/document/api/graphql/file-type';
import { convertArrayToObject, transformDeptIds, } from '@/apps/document/helpers/composable/utils';
import { getAllFolder, getFolderInfoById, getMaxFolderNumOrder, saveFolder } from '@/apps/mission/api/graphql/folder';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { listToTree } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  isUpdate: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  file: {
    type: Object as PropType<any>,
    default: {} as any,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'reload']);
const file = ref<any>(props.file);
const { t } = useI18n();
const { user } = useUserStore();
let form = ref();
const fileTypes = ref();
const files = ref();
const submitForm = ref(false);
const headerDialog = props.isUpdate
  ? t('document.file.updateFile')
  : t('document.file.createFile');
const visible = ref(props.visibleDialog);
const folderParent = ref();

if (props.isUpdate) {
  const { onResult } = getFolderInfoById(props.id || '');
  onResult((res) => {
    file.value = {
      ...res.data.getFolderInfoById,
      createdTime: new Date(res.data.getFolderInfoById.createdTime),
    };
    folderParent.value =
      file.value.folderParent && convertArrayToObject([file.value.folderParent]);
  });
} else {
  const { onResult: getMaxFolderNumOrderResult } = getMaxFolderNumOrder(
    user.id || '',
    props.id,
  );
  let num = 0;
  getMaxFolderNumOrderResult((res) => {
    num = res.data.getMaxFolderNumOrder;
    file.value.numOrder = num;
  });
  file.value = {
    createdTime: new Date(),
    createdBy: user.id,
    status: true,
    folderYear: new Date().getFullYear(),
  };
  if (props.id) {
    const { onResult } = getFolderInfoById(props.id || '');
    onResult((res) => {
      file.value = {
        ...file.value,
        folderType: res.data.getFolderInfoById.folderType,
      };
      folderParent.value = convertArrayToObject([props.id]);
    });
  }
}

const { onResult: getAllFileTypesResult } = getAllFileTypes({ keyword: null });
getAllFileTypesResult((res) => {
  fileTypes.value = res.data.getAllFileTypes;
});

const {
  mutate: saveFileMutate,
  onDone: saveFileDone,
  onError: saveFileError,
} = saveFolder();
const { moment } = useMoment();

function submit() {
  submitForm.value = true;
  if (
    !file.value.folderName
    || !file.value.folderYear
  ) {
    return;
  }
  saveFileMutate({
    folder: {
      ...file.value,
      createdTime: moment(file.value.createdTime).format('DD/MM/YYYY'),
      folderParent: folderParent.value
        ? transformDeptIds(folderParent.value).join('')
        : null,
    },
  });
}

saveFileDone(() => {
  toastSuccess({ message: t('document.file.saveDone') });
  emits('hide-dialog');
});

saveFileError((error) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((error) => {
      const { extensions } = error || {};
      const {
        errorCode,
        errorType
      } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t(`document.file.${errorCode.toString()}`) });
      }
    });
  }
});

const { onResult: getAllFileResult } = getAllFolder();
getAllFileResult((res) => {
  const data = res.data.getAllFolder;
  files.value = listToTree(
    data.map((item: any) => ({
      key: item.id,
      label: item.folderName,
      data: item,
      parentId: item.folderParent,
      children: [],
    })),
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  );
});
</script>

<style scoped></style>
