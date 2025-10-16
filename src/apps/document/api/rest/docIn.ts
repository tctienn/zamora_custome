import type { DocIn, UserDeptRoleInput, } from '@/apps/document/model/doc/doc-in';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import type { SearchModel } from '@/common/model/search';

function getDocInById(id: string) {
  return baseApi.get<DocIn>(`${DOCUMENT_URL}/api/v1/incoming-docs/${id}`);
}

function saveDocIn(formData: FormData) {
  return baseApi.postWithFile<DocIn>(
    `${DOCUMENT_URL}/doc-in/put-in-book`,
    formData,
  );
}

function findDocById(userDeptRole: UserDeptRoleInput, id: string) {
  return baseApi.get<DocIn>(`${DOCUMENT_URL}/doc-in/find-doc-by-id/${id}`, { params: userDeptRole, });
}

function exportExcelDocIn(
  userDeptRole: UserDeptRoleInput,
  search: SearchModel,
  docStatus: string,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-excel/doc-in`,
    {},
    {
      params: {
        ...search,
        ...userDeptRole,
        docStatus,
      },
    },
  );
}

function exportWordDocIn(
  userDeptRole: UserDeptRoleInput,
  search: SearchModel,
  docStatus: string,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-word/doc-in`,
    {},
    {
      params: {
        ...search,
        ...userDeptRole,
        docStatus,
      },
    },
  );
}

function exportPDFDocIn(
  userDeptRole: UserDeptRoleInput,
  search: SearchModel,
  docStatus: string,
) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/export-pdf/doc-in`,
    {},
    {
      params: {
        ...search,
        ...userDeptRole,
        docStatus,
      },
    },
  );
}

function findLastInProcess(
  userDeptRole: UserDeptRoleInput,
  docId: string,
  dept: string,
) {
  return baseApi.get<InComingProcess>(`${DOCUMENT_URL}/doc-in/find-last-process`, {
    params: {
      ...userDeptRole,
      docId: docId,
      dept: dept,
    },
  });
}

function findFirstProcess(
  userDeptRole: UserDeptRoleInput,
  docId: string,
  dept: string,
) {
  return baseApi.get<string>(`${DOCUMENT_URL}/doc-in/find-first-process`, {
    params: {
      ...userDeptRole,
      docId: docId,
      dept: dept,
    },
  });
}

function findByProcessId(userDeptRole: UserDeptRoleInput, processId: string) {
  return baseApi.get(
    `${DOCUMENT_URL}/doc-in/find-by-process-id?processId=${processId}`,
    { params: userDeptRole },
  );
}

function deleteDocComing(
  id: string | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return baseApi.post(
    `${DOCUMENT_URL}/doc-in/delete-doc-coming?id=${id}`,
    userDeptRole,
  );
}

function rejectDoc(docId: string, formData: FormData) {
  return baseApi.postWithFile(
    `${DOCUMENT_URL}/doc-in/reject-doc-in?docId=${docId}`,
    formData,
  );
}

function rejectDocWithSpecifyStep(docId: string, formData: FormData) {
  return baseApi.postWithFile(
    `${DOCUMENT_URL}/doc-in/reject-doc-in-selectable?docId=${docId}`,
    formData,
  );
}

function rejectDocReceive(docId: string, formData: FormData) {
  return baseApi.postWithFile(
    `${DOCUMENT_URL}/doc-in/reject-doc-in-receive?docId=${docId}`,
    formData,
  );
}

function saveDocInWithOCR(formData: FormData) {
  return baseApi.postWithFile(
    `${DOCUMENT_URL}/doc-in/ocr-doc-in`,
    formData,
  );
}

function putInBookUsingOcr(formData: FormData) {
  return baseApi.postWithFile(
    `${DOCUMENT_URL}/doc-in/put-in-book-using-ocr`,
    formData,
  );
}

export {
  deleteDocComing,
  exportExcelDocIn,
  exportPDFDocIn,
  exportWordDocIn,
  findByProcessId,
  findDocById,
  findFirstProcess,
  findLastInProcess,
  getDocInById,
  putInBookUsingOcr,
  rejectDoc,
  rejectDocReceive,
  rejectDocWithSpecifyStep,
  saveDocIn,
  saveDocInWithOCR
};
