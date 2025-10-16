import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function exportExcelReportDocIn(
  userDeptRole: UserDeptRoleInput,
  reportDocInModel: any,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-excel/report-doc-in`,
    {},
    {
      params: {
        ...userDeptRole,
        ...reportDocInModel,
      },
    },
  );
}

function exportWordReportDocIn(
  userDeptRole: UserDeptRoleInput,
  reportDocInModel: any,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-word/report-doc-in`,
    {},
    {
      params: {
        ...userDeptRole,
        ...reportDocInModel,
      },
    },
  );
}

function exportPDFReportDocIn(
  userDeptRole: UserDeptRoleInput,
  reportDocInModel: any,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-pdf/report-doc-in`,
    {},
    {
      params: {
        ...userDeptRole,
        ...reportDocInModel,
      },
    },
  );
}

function exportExcelReportDocOut(
  userDeptRole: UserDeptRoleInput,
  reportDocOutModel: any,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-excel/report-doc-out`,
    {},
    {
      params: {
        ...userDeptRole,
        ...reportDocOutModel,
      },
    },
  );
}

function exportWordReportDocOut(
  userDeptRole: UserDeptRoleInput,
  reportDocOutModel: any,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-word/report-doc-out`,
    {},
    {
      params: {
        ...userDeptRole,
        ...reportDocOutModel,
      },
    },
  );
}

function exportPDFReportDocOut(
  userDeptRole: UserDeptRoleInput,
  reportDocOutModel: any,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-pdf/report-doc-out`,
    {},
    {
      params: {
        ...userDeptRole,
        ...reportDocOutModel,
      },
    },
  );
}

export {
  exportExcelReportDocIn,
  exportExcelReportDocOut,
  exportPDFReportDocIn,
  exportPDFReportDocOut,
  exportWordReportDocIn,
  exportWordReportDocOut,
};
