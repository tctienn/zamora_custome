import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createDecision(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision`, data);
}

function updateDecision(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/${id}`, data);
}

function createDecisionOther(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/create-other-decision`, data);
}

function updateDecisionOther(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/update-other-decision/${id}`, data);
}

function createTransferDecision(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/create-transfer-decision`, data);
}

function updateTransferDecision(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/update-transfer-decision/${id}`, data);
}

function createTerminationDecision(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/create-termination-decision`, data);
}

function updateTerminationDecision(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/update-termination-decision/${id}`, data);
}

function createCommendationDecision(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/create-commendation-decision`, data);
}

function updateCommendationDecision(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/update-commendation-decision/${id}`, data);
}

function createDisciplineDecision(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/create-discipline-decision`, data);
}

function updateDisciplineDecision(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/update-discipline-decision/${id}`, data);
}

function createReceptionDecision(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/create-reception-decision`, data);
}

function updateReceptionDecision(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/update-reception-decision/${id}`, data);
}

function createDismissalDecision(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/create-dismissal-decision`, data);
}

function updateDismissalDecision(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/update-dismissal-decision/${id}`, data);
}

function exportFileDecision(id: string) {
  return baseApi.download<Blob>(`${HRM_URL}/api/decision/export-decision/${id}`, undefined);
}

function exportFileDecisionPdf(id: string) {
  return baseApi.download<Blob>(`${HRM_URL}/api/decision/pdf/export-decision/${id}`, undefined);
}

function createSalaryAdjustment(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/create-salary-adjustment`, data);
}

function updateSalaryAdjustment(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/decision/update-salary-adjustment/${id}`, data);
}

export {
  createCommendationDecision,
  createDecision,
  createDecisionOther,
  createDisciplineDecision,
  createDismissalDecision,
  createReceptionDecision,
  createSalaryAdjustment,
  createTerminationDecision,
  createTransferDecision,
  exportFileDecision,
  exportFileDecisionPdf,
  updateCommendationDecision,
  updateDecision,
  updateDecisionOther,
  updateDisciplineDecision,
  updateDismissalDecision,
  updateReceptionDecision,
  updateSalaryAdjustment,
  updateTerminationDecision,
  updateTransferDecision
};