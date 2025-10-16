import type { SearchTaskInput } from '@/apps/work/model/task';
import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveTaskDynamic(formData: FormData) {
  return baseApi.postWithFile(`${WORK_URL}/task/save`, formData);
}

async function exportExcelConfig(formData: FormData): Promise<ArrayBuffer> {
  return <ArrayBuffer>(
    await baseApi.post(`${WORK_URL}/task/config/xlsx`, formData, { responseType: 'arraybuffer', })
  );
}

async function getFieldExcel(): Promise<string[]> {
  return <string[]>await baseApi.get(`${WORK_URL}/task/getFieldExcel`);
}

async function importExcel(formData: FormData) {
  return await baseApi.postWithFile(`${WORK_URL}/task/importTask`, formData);
}

function exportExcelTasks(searchTaskInput?: SearchTaskInput) {
  return baseApi.downloadWithFullResponse(
    `${WORK_URL}/task/excel`,
    {},
    { params: { ...searchTaskInput, }, },
  );
}

export {
  exportExcelConfig,
  exportExcelTasks,
  getFieldExcel,
  importExcel,
  saveTaskDynamic,
};
