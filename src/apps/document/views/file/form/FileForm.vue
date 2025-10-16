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
              for='fileName'>{{
                t("document.file.name")
              }}</label>
            <InputText
              v-model='file.fileName'
              v-trim
              name='fileName' />
            <small
              v-if='submitForm && !file.fileName'
              class='p-error'>{{
                t("document.file.errors.nameEmpty")
              }}</small>
          </div>

          <div class='col-12 field'>
            <label for='fileParent'>{{ t("document.file.fileParent") }}</label>
            <TreeSelect
              v-model='fileParent'
              class='w-full'
              :empty-message="t('common.selectEmpty')"
              :filter='true'
              :options='files'
              selection-mode='single'></TreeSelect>
          </div>

          <div class='col-12 field'>
            <label
              v-required
              for='deptIds'>{{
                t("document.file.deptIds")
              }}</label>
            <TreeSelect
              v-model='deptIds'
              class='w-full'
              :empty-message="t('common.selectEmpty')"
              :filter='true'
              :options='organizations'
              selection-mode='multiple'></TreeSelect>
            <small
              v-if='submitForm && !deptIds'
              class='p-error'>{{
                t("document.file.errors.deptIdsEmpty")
              }}</small>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              for='fileType'>{{
                t("document.file.fileType")
              }}</label>
            <NamedDropdown
              :id='id'
              v-model='file.fileType'
              class='w-full'
              name='fileType'
              option-label='name'
              option-value='id'
              :options='fileTypes'/>
            <small
              v-if='submitForm && !file.fileType'
              class='p-error'>{{
                t("document.file.errors.fileTypeEmpty")
              }}</small>
          </div>

          <div class='col-3 field'>
            <label
              v-required
              for='fileYear'>{{
                t("document.file.fileYear")
              }}</label>
            <InputNumber
              v-model='file.fileYear'
              class='w-full'
              input-id='integeronly'
              :use-grouping='false'/>
            <input
              v-model='file.fileYear'
              hidden
              name='fileYear' />
            <small
              v-if='submitForm && !file.fileYear'
              class='p-error'>{{
                t("document.file.errors.fileYearEmpty")
              }}</small>
          </div>

          <div class='col-3 field'>
            <label for='numOrder'>{{ t("document.file.numOrder") }}</label>
            <InputNumber
              v-model='file.numOrder'
              class='w-full'
              input-id='integeronly'/>
            <input
              v-model='file.numOrder'
              hidden
              name='numOrder' />
          </div>

          <div class='col-4 field'>
            <label>{{ t("document.file.createdTime") }}</label>
            <Calendar
              v-model='file.createdTime'
              class='w-full'
              disabled
              icon-display='input'
              show-icon/>
          </div>

          <div class='col-4 field'>
            <label class='align-items-center flex justify-content-center'>{{
              t("document.file.createdBy")
            }}</label>
            <div class='align-items-center flex justify-content-center mt-2'>
              <AppUser :user-id='file.createdBy' />
            </div>
          </div>

          <div class='col-4 field'>
            <label>{{ t("document.file.status") }}</label>
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
              rows='5' />
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
          type='submit' />
      </div>
    </form>
  </Sidebar>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import {
  getAllFile,
  getFileInfoById,
  getMaxFileNumOrder,
  saveFile,
} from '@/apps/document/api/graphql/file';
import { getAllFileTypes } from '@/apps/document/api/graphql/file-type';
import {
  convertArrayToObject,
  transformDeptIds,
} from '@/apps/document/helpers/composable/utils';
import type { FileInterface } from '@/apps/document/model/file';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';
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
    type: Object as PropType<FileInterface>,
    default: {} as FileInterface,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'reload']);
const file = ref<FileInterface>(props.file);
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
const deptIds = ref();
const fileParent = ref();

if (props.isUpdate) {
  const { onResult } = getFileInfoById(props.id || '');
  onResult((res) => {
    file.value = {
      ...res.data.getFileInfoById,
      createdTime: new Date(res.data.getFileInfoById.createdTime),
    };
    deptIds.value =
      file.value.deptIds && convertArrayToObject(file.value.deptIds);
    fileParent.value =
      file.value.fileParent && convertArrayToObject([file.value.fileParent]);
  });
} else {
  const { onResult: getMaxFileNumOrderResult } = getMaxFileNumOrder(
    user.id || '',
    props.id,
  );
  let num = 0;
  getMaxFileNumOrderResult((res) => {
    num = res.data.getMaxFileNumOrder;
    file.value.numOrder = num;
  });
  file.value = {
    createdTime: new Date(),
    createdBy: user.id,
    status: true,
    fileYear: new Date().getFullYear(),
  } as FileInterface;
  if (props.id) {
    const { onResult } = getFileInfoById(props.id || '');
    onResult((res) => {
      file.value = {
        ...file.value,
        fileType: res.data.getFileInfoById.fileType,
      };
      deptIds.value =
        res.data.getFileInfoById.deptIds
        && convertArrayToObject(res.data.getFileInfoById.deptIds);
      fileParent.value = convertArrayToObject([props.id]);
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
} = saveFile();

function submit() {
  submitForm.value = true;
  if (
    !file.value.fileName
    || !deptIds.value
    || !file.value.fileType
    || !file.value.fileYear
  ) {
    return;
  }
  saveFileMutate({
    file: {
      ...file.value,
      deptIds: transformDeptIds(deptIds.value),
      fileParent: fileParent.value
        ? transformDeptIds(fileParent.value).join('')
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
      const { errorCode, errorType } = extensions || {};
      if (errorCode && errorType) {
        toastError({ message: t(`document.file.${errorCode.toString()}`) });
      }
    });
  }
});

onMounted(() => {
  fetchOrganizations();
});

const organizations = ref([]);
const fetchOrganizations = () => {
  const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
  getAllOrganizationResult((response) => {
    const data = get(response, 'data.allOrganizationPublic', []);
    organizations.value = listToTree(
      data.map((organization: OrganizationInterface) => ({
        key: organization.id,
        label: organization.name,
        data: organization.code,
        parentId: organization.parentCode,
        children: [],
      })),
      {
        id: 'data',
        parentId: 'parentId',
        children: 'children',
      },
    );
  });
};

const { onResult: getAllFileResult } = getAllFile();
getAllFileResult((res) => {
  const data = res.data.getAllFile;
  files.value = listToTree(
    data.map((item: FileInterface) => ({
      key: item.id,
      label: item.fileName,
      data: item,
      parentId: item.fileParent,
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
