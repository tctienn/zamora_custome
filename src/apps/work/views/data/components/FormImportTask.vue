<template>
  <div class='h-full relative'>
    <div
      class='align-items-center border-1 border-round content-header flex flex-row justify-content-between shadow-1 surface-border'>
      <AppBreadcrumb/>

    </div>

    <div class='import-card'>
      <h5>{{ t('common.importMyTask') }}</h5>
      <h6
        class='field px-5 py-1'
        style='color: red'>{{ t('common.noteImport') }}</h6>
      <div class='field lg:col-3 px-5 py-1 sm:col-12 xl:col-3'>
        <div class='col-12'>
          <Toast/>
          <FileUpload
            v-tooltip.top='t("common.file")'
            accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
            class='text-white'
            mode='basic'
            text
            @before-send='removeSelectedFiles'
            @select='onSelectedFiles'>
          </FileUpload>
          <div class='text-color'>{{ t('common.noteFile') }}</div>
        </div>
      </div>
      <div class='form grid'>
        <span class='field lg:col-2 px-6 py-1 sm:col-12 xl:col-2'>
          <div class='flex flex-column gap-1'>
            <label
              for='formRow'>{{ t('common.fromRow') }}</label>
            <InputNumber
              id='formRow'
              v-model='fromRow'
              :min='1'
              :placeholder="t('common.fromRow')"/>
          </div>
        </span>
        <span class='field lg:col-2 px-6 py-1 sm:col-12 xl:col-2'>
          <div class='flex flex-column gap-1'>
            <label
              for='toRow'>{{ t('common.toRow') }}</label>
            <InputNumber
              id='toRow'
              v-model='toRow'
              :placeholder="t('common.endRow')"/>
          </div>
        </span>
        <ButtonIcon
          v-tooltip.top='t("common.autoFill")'
          class='ml-2'
          icon='stylus_note'
          rounded
          text
          @click='fillImport'>
        </ButtonIcon>
        <ButtonIcon
          v-tooltip.top='t("common.deleteAll")'
          class='ml-2'
          icon='ink_eraser'
          rounded
          text
          @click='clearImport'>
        </ButtonIcon>
      </div>
      <div
        class='form grid'
        style='margin-bottom: -19px;'>
        <span class='field lg:col-3 px-6 py-1 sm:col-12 xl:col-3'>
          <label
            v-required
            class='w-6'>{{ t('common.field') }}</label>
        </span>
        <span class='field lg:col-3 px-6 py-1 sm:col-12 xl:col-3'>
          <label
            v-required
            class='w-6'>{{ t('common.column') }}</label>
        </span>
        <span class='field lg:col-2 px-6 py-1 sm:col-12 xl:col-2'>
        </span>
      </div>
      <div
        v-for='(user, index) in dynamicValidateForm.config'
        :key='index'>
        <div class='form grid'>
          <span class='field lg:col-3 px-6 py-1 sm:col-12 xl:col-3'>
            <span class='align-items-center flex'>
              <NamedDropdown
                id='field'
                v-model='user.field'
                class='w-full'
                filter
                name='field'
                option-label='name'
                option-value='code'
                :options='categories'
                :placeholder="t('common.field')"
                show-clear/>
            </span>
          </span>
          <span class='field lg:col-2 px-6 py-1 sm:col-12 xl:col-2'>
            <span class='align-items-center flex'>
              <NamedDropdown
                id='column'
                v-model='user.column'
                class='w-full'
                filter
                name='column'
                option-label='name'
                option-value='code'
                :options='listColumn'
                :placeholder="t('common.column')"
                show-clear/>
            </span>
          </span>
          <div class='field lg:col-1 px-1 py-1 sm:col-2 xl:col-2'>
            <span
              class='align-items-center flex'
              style='margin-top: 13px;'>
              <i
                class='pi pi-times'
                @click='removeUser(user)'/>
            </span>

          </div>
        </div>
      </div>
      <div class='field lg:col-3 px-6 py-1 sm:col-12 xl:col-3'>
        <ButtonIcon
          icon='add_circle'
          rounded
          text
          @click='addUser'>
        </ButtonIcon>
      </div>
      <div class='field lg:col-3 px-6 py-1 sm:col-12 xl:col-3'>
        <Button
          icon='pi pi-check'
          :label="t('common.update')"
          @click='importExcelTask'/>
      </div>
    </div>

  </div>

</template>

<script lang='ts' setup>
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import { useConfirm } from 'primevue/useconfirm';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getFieldExcel, importExcel } from '@/apps/work/api/rest/Task';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedDropdown from '@/common/components/custom/NamedDropdown.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();

interface Config {
  field: string;
  column: string;
  id: number;
}

const dynamicValidateForm = ref<{ config: Config[] }>({
  config: [{
    field: '',
    column: '',
    id: Date.now()
  }],
});
const removeUser = (item: Config) => {
  const index = dynamicValidateForm.value.config.indexOf(item);
  if (index !== -1) {
    dynamicValidateForm.value.config.splice(index, 1);
  }
};
const addUser = () => {
  dynamicValidateForm.value.config.push({
    field: '',
    column: '',
    id: Date.now(),
  });
};

let categories = ref<{ name: string; code: string; }[]>([]);

const listColumn = ref([
  {
    name: 'A',
    code: '0'
  }
]);

function intToExcelColumn(n: number) {
  let result = '';
  while (n >= 0) {
    result = String.fromCharCode(65 + n % 26) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

let fromRow = ref(1);
let toRow = ref(null);

let listFill = ref();
let index = 0;

async function getFieldExcelTasks() {
  try {
    let response = await getFieldExcel();
    categories.value = response.map(item => ({
      name: t('work.taskImport.' + item),
      code: item
    }));
    response = response.filter(item => item !== 'createdTime'
        && item !== 'createdBy'
        && item !== 'lastModifiedTime'
        && item !== 'lastModifiedBy');
    listFill.value = response.map(item => ({
      field: item,
      column: '' + index++,
      id: Date.now(),
    }));
    for (let i = 1; i < response.length; i++) {
      const excelColumn = intToExcelColumn(i);
      listColumn.value.push({
        name: excelColumn,
        code: i.toString()
      });
    }
  } catch (error) {
    console.error(error);
  }
}

getFieldExcelTasks();

let selectedFile: File | null = null;

const onSelectedFiles = (event: FileUploadSelectEvent) => {
  selectedFile = event.files[0];
};

const removeSelectedFiles = () => {
  selectedFile = null;
};

async function importExcelTask() {
  if (!selectedFile) {
    toastError({ message: t('common.result.message.chooseFileBeforeImport') });
    return;
  }

  const formData = new FormData();
  formData.append('uploadFile', selectedFile);
  formData.append('config', JSON.stringify(dynamicValidateForm.value));
  formData.append('toRow', toRow.value + '');
  formData.append('fromRow', fromRow.value + '');

  try {
    const response = await importExcel(formData);
    toastSuccess({ message: t('common.result.message.success') });
  } catch (error) {
  }
}

function fillImport() {
  dynamicValidateForm.value.config = listFill.value;
}

const confirm = useConfirm();

function clearImport() {
  confirm.require({
    message: t('common.clearFill'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      dynamicValidateForm.value.config = [{
        field: '',
        column: '',
        id: Date.now(),
      }];
    }
  });

}

</script>

<script lang='ts'>
export default { name: 'FormImportTask' };
</script>

<style scoped>

</style>