import type { DocIn, UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { OutgoingProcess } from '@/apps/document/model/process/outgoing';
import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function getDocOutById(id: string) {
  return baseApi.get<DocOut>(`${DOCUMENT_URL}/api/v1/outgoing-docs/${id}`);
}

function saveDocOut(formData: FormData) {
  return baseApi.postWithFile<DocIn>(`${ DOCUMENT_URL }/doc-out/create-or-update-doc-out`, formData);
}

function savePromulgateDoc(formData: FormData) {
  return baseApi.postWithFile<DocIn>(`${ DOCUMENT_URL }/doc-out/create-or-update-promulgate-doc`, formData);
}

function findFirstProcess(userDeptRole: UserDeptRoleInput, docId: string) {
  return baseApi.get<OutgoingProcess>(`${ DOCUMENT_URL }/doc-out/find-first-process`, {
    params: {
      ...userDeptRole,
      docId: docId,
    }
  });
}

function findLastOutProcess(
  userDeptRole: UserDeptRoleInput,
  docId: string,
  dept: string,
) {
  return baseApi.get<OutgoingProcess>(`${DOCUMENT_URL}/doc-out/find-last-process`, {
    params: {
      ...userDeptRole,
      docId: docId,
      dept: dept,
    },
  });
}

function rejectDocOut(formData: FormData) {
  return baseApi.postWithFile(
    `${DOCUMENT_URL}/doc-out/reject`,
    formData,
  );
}

function deleteDocOut(id: string, userDeptRole: UserDeptRoleInput) {
  return baseApi.del(`${DOCUMENT_URL}/api/v1/outgoing-docs/${id}`, { params: userDeptRole, });
}

function findDocOutById(userDeptRole: UserDeptRoleInput, id: string) {
  return baseApi.get<DocOut>(`${DOCUMENT_URL}/api/v1/outgoing-docs/${id}`, { params: userDeptRole, });
}

// Export functions for DocOut
function exportPDFDocOut(userDeptRole: UserDeptRoleInput, searchModel: any) {
  return baseApi.postForDownload(
    `${DOCUMENT_URL}/api/v1/outgoing-docs/export/pdf`,
    {
      userDeptRole,
      search: searchModel,
    },
  );
}

function exportExcelDocOut(userDeptRole: UserDeptRoleInput, searchModel: any) {
  return baseApi.postForDownload(
    `${DOCUMENT_URL}/api/v1/outgoing-docs/export/excel`,
    {
      userDeptRole,
      search: searchModel,
    },
  );
}

function exportWordDocOut(userDeptRole: UserDeptRoleInput, searchModel: any) {
  return baseApi.postForDownload(
    `${DOCUMENT_URL}/api/v1/outgoing-docs/export/word`,
    {
      userDeptRole,
      search: searchModel,
    },
  );
}

export {
  deleteDocOut,
  exportExcelDocOut,
  exportPDFDocOut,
  exportWordDocOut,
  findDocOutById,
  findFirstProcess,
  findLastOutProcess,
  getDocOutById,
  rejectDocOut,
  saveDocOut,
  savePromulgateDoc
};
