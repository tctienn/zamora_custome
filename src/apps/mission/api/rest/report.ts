import { MISSION_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

import type { ISearchMissionReport } from '../../model/report/report';

export function exportExcelMissionFocusReport(
  searchModel: ISearchMissionReport
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/mission/export-excel`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportWordMissionFocusReport(
  searchModel: ISearchMissionReport
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/mission/export-word`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportPdfMissionFocusReport(
  searchModel: ISearchMissionReport
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/mission/export-pdf`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportExcelMissionActivityReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-excel`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportWordMissionActivityReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-word`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportPdfMissionActivityReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-pdf`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportExcelMissionJobReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-excel/deployment`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportWordMissionJobReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-word/deployment`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportPdfMissionJobReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-pdf/deployment`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportExcelMissionJobAssignmentReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-excel/assignment`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportWordMissionJobAssignmentReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-word/assignment`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportPdfMissionJobAssignmentReport(
  searchModel: ISearchMissionReport   
) {
  return baseApi.downloadWithFullResponse(
    `${MISSION_URL}/activity/export-pdf/assignment`,
    {},
    { params: { ...searchModel } },
  );
}