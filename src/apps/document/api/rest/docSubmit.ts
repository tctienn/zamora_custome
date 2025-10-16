import type { DocIn, UserDeptRoleInput, } from '@/apps/document/model/doc/doc-in';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { SubmitProcess } from '@/apps/document/model/process/submit';
import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function getDocSubmitById(id: string) {
  return baseApi.get<DocSubmit>(`${DOCUMENT_URL}/api/v1/doc-submit/${id}`);
}

function saveOrUpdateDocSubmit(formData: FormData) {
  return baseApi.postWithFile<DocIn>(
    `${DOCUMENT_URL}/doc-submit/create-update-doc-submit`,
    formData,
  );
}

function findFirstProcess(userDeptRole: UserDeptRoleInput, docId: string) {
  return baseApi.get<SubmitProcess>(
    `${DOCUMENT_URL}/doc-submit/find-first-process`,
    {
      params: {
        ...userDeptRole,
        docId: docId,
      },
    },
  );
}

function rejectDocSubmit(formData: FormData) {
  return baseApi.postWithFile(`${DOCUMENT_URL}/doc-submit/reject`, formData);
}

function exportWordDocSubmit(id: string, userDeptRole: UserDeptRoleInput) {
  return baseApi.downloadWithFullResponse(
    `${DOCUMENT_URL}/doc-submit/export-doc-submit`,
    {},
    {
      params: {
        id: id,
        ...userDeptRole,
      },
    },
  );
}

function findLastSubmitProcess(
  userDeptRole: UserDeptRoleInput,
  docId: string,
  dept: string,
) {
  return baseApi.get<SubmitProcess>(`${DOCUMENT_URL}/doc-submit/find-last-process`, {
    params: {
      ...userDeptRole,
      docId: docId,
      dept: dept,
    },
  });
}

export {
  exportWordDocSubmit,
  findFirstProcess,
  findLastSubmitProcess,
  getDocSubmitById,
  rejectDocSubmit,
  saveOrUpdateDocSubmit
};
