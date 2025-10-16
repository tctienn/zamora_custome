<template>
  <div class='h-full relative'>
    <div
      class='align-items-center border-1 border-round content-header flex flex-row justify-content-between shadow-1 surface-border'>
      <AppBreadcrumb/>

    </div>

    <div class='import-card'>

      <h5>{{ t('common.exportMyTask') }}</h5>
      <h6
        class='field px-5 py-1'
        style='color: red'>{{ t('common.noteExport') }}</h6>
      <div class='card flex px-5'>
        <div class='flex flex-column gap-3 mt-1'>
          <div class=''>
            <Checkbox
              v-model='checkAll'
              :binary='true'
              @change='changeCheckAll'/>
            <label class='ml-2 text-lg'>{{ t('common.selectAll') }}</label>
          </div>
          <div
            v-for='category of categories'
            :key='category.code'
            class='flex'>
            <Checkbox
              v-model='selectedCategories'
              :input-id='category.code'
              name='category'
              :value='category.code'
              @change='changeField'/>
            <label
              class='ml-2'
              :for='category.code'>{{ category.name }}</label>
          </div>
        </div>
        <div class='field lg:col-3 px-8 py-0 sm:col-12 xl:col-3'>
          <Button
            icon='pi pi-download'
            :label="t('common.export')"
            @click='exportExcelTasks'/>
        </div>
      </div>

    </div>

  </div>

</template>

<script lang='ts' setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { exportExcelConfig, getFieldExcel } from '@/apps/work/api/rest/Task';

const { t } = useI18n();
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

for (let i = 1; i < 1000; i++) {
  const excelColumn = intToExcelColumn(i);
  listColumn.value.push({
    name: excelColumn,
    code: i.toString()
  });
}

async function getFieldExcelTasks() {
  try {
    let response = await getFieldExcel();
    //response = response.filter(item => item !== 'taskAccount' && item !== 'taskExtends' && item !== 'profileImage');
    categories.value = response.map((item: string) => ({
      name: t('work.taskImport.' + item),
      code: item
    }));
  } catch (error) {
    console.error(error);
  }
}

getFieldExcelTasks();

async function exportExcelTasks() {
  try {
    const formData = new FormData();
    formData.append('selectedCategories', JSON.stringify(selectedCategories.value));
    const response = await exportExcelConfig(formData);
    // Tạo một blob từ dữ liệu trả về
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    // Tạo một đường dẫn đến blob
    const url = window.URL.createObjectURL(blob);
    // Tạo một thẻ a để tải xuống tệp Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reportTask.xlsx';
    a.click();
    // Giải phóng URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
}

const selectedCategories = ref<string[]>([]);
const changeField = () => {
};
const checkAll = ref(false);

const changeCheckAll = () => {
  if (checkAll.value) {
    categories.value.forEach(item => selectedCategories.value.push(item.code));
  } else {
    selectedCategories.value = [];
  }
};

</script>

<script lang='ts'>
export default { name: 'FormExportTask' };
</script>

<style scoped>

</style>