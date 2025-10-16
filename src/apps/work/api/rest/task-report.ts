import type { ReportProjectModel } from '@/apps/work/model/project';
import type { ReportMyTaskSearchModel } from '@/apps/work/model/task';
import type { TaskComment } from '@/apps/work/model/taskComment';
import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function addReport(formData: FormData) {
  return baseApi.postWithFile<TaskComment>(`${WORK_URL}/task/report`, formData);
}

export function exportExcelReportMyTask(
  _: any,
  searchModel: ReportMyTaskSearchModel,
) {
  return baseApi.downloadWithFullResponse(
    `${WORK_URL}/export-report/my-task/excel`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportExcelReportProject(
  _: any,
  searchModel: ReportProjectModel,
) {
  return baseApi.downloadWithFullResponse(
    `${WORK_URL}/export-report/project/excel`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportExcelReportDetailProjects(
  _: any,
  searchModel: ReportProjectModel,
) {
  return baseApi.downloadWithFullResponse(
    `${WORK_URL}/export-report/detail-projects/excel`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportExcelReportDeptTask(
  _: any,
  searchModel: ReportMyTaskSearchModel,
) {
  return baseApi.downloadWithFullResponse(
    `${WORK_URL}/export-report/dept-task/excel`,
    {},
    { params: { ...searchModel } },
  );
}
