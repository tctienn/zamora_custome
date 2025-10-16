import type { Employee, ProfilesHistory } from '@/apps/hrm/model/employee';
import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createEmployee(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/employees`, data);
}

function updateEmployee(employeeId: string, snapshotId: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/employees/${employeeId}/snapshots/${snapshotId}`, data);
}

function findEmployeeById(id: string) {
  return baseApi.get<Employee>(`${HRM_URL}/api/employees/${id}`);
}

function findPersonal() {
  return baseApi.get<Employee>(`${HRM_URL}/api/employees/personal`);
}

function createPersonalDraft(data: FormData) {
  return baseApi.postWithFile<Employee>(`${HRM_URL}/api/employees/personal/draft`, data);
}

function deletePersonalDraft(snapshotId: string) {
  return baseApi.del(`${HRM_URL}/api/employees/personal/draft/${snapshotId}`, undefined);
}

function findEmployeeByIdAndSnapshot(employeeId: string, snapshotId: string) {
  return baseApi.get<Employee>(`${HRM_URL}/api/employees/${employeeId}/snapshots/${snapshotId}`);
}

function sendToApproveEmployeeProfile(employeeId: string, snapshotId: string) {
  return baseApi.post<any>(`${HRM_URL}/api/employees/${employeeId}/send-to-approve/${snapshotId}`, {});
}

function ApproveEmployeeProfile(employeeId: string, snapshotId: string) {
  return baseApi.post<any>(`${HRM_URL}/api/employees/${employeeId}/approve/${snapshotId}`, {});
}

function RejectEmployeeProfile(employeeId: string, snapshotId: string) {
  return baseApi.post<any>(`${HRM_URL}/api/employees/${employeeId}/reject/${snapshotId}`, {});
}

function saveEmployeeReceivingDoc(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/employees/receiving-doc`, data);
}

function saveEmployeeTrainingProcess(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/employees/training-process`, data);
}

function saveEmployeeCertificate(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/employees/certificate`, data);
}

function exportFileEmployee(employeeId: string, type: string) {
  return baseApi.download<Blob>(`${HRM_URL}/api/employees/export/${employeeId}?type=${type}`, undefined);
}

function exportFileContract(employeeId: string, template: string) {
  return baseApi.download<Blob>(`${HRM_URL}/api/employees/exportContractEmployee/${employeeId}?template=${template}`, undefined);
}

function exportFileContractPdf(employeeId: string, template: string) {
  return baseApi.download<Blob>(`${HRM_URL}/api/employees/exportContractEmployee/pdf/${employeeId}?template=${template}`, undefined);
}

function viewPdfExportFileEmployee(employeeId: string, type: string) {
  return baseApi.download<Blob>(`${HRM_URL}/api/employees/export/pdf/${employeeId}?type=${type}`, undefined,);
}

function findPersonalProfileHistory(employeeId: string) {
  return baseApi.get<ProfilesHistory[]>(`${HRM_URL}/api/employees/${employeeId}/snapshots`);
}

function createEmployeeVocation(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/vacation/saveVocationType`, data);
}

function uploadEmployeeFile(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/employees/upload`, data);
}

function exportExcelEmployeeByOrganization(param: object) {
  return baseApi.download<Blob>(`${HRM_URL}/api/employees/excel`, param);
}

function exportExcelEmployeeEducation(param: object) {
  return baseApi.download<Blob>(`${HRM_URL}/api/employees/exportExcelEmployeeEducation`, param);
}

function exportExcelWorkProgress(param: object) {
  return baseApi.download<Blob>(`${HRM_URL}/api/employees/exportExcelWorkProgress`, param);
}

export {
  ApproveEmployeeProfile,
  createEmployee,
  createEmployeeVocation,
  createPersonalDraft,
  deletePersonalDraft,
  exportExcelEmployeeByOrganization,
  exportExcelEmployeeEducation,
  exportExcelWorkProgress,
  exportFileContract,
  exportFileContractPdf,
  exportFileEmployee,
  findEmployeeById,
  findEmployeeByIdAndSnapshot,
  findPersonal,
  findPersonalProfileHistory,
  RejectEmployeeProfile,
  saveEmployeeCertificate,
  saveEmployeeReceivingDoc,
  saveEmployeeTrainingProcess,
  sendToApproveEmployeeProfile,
  updateEmployee,
  uploadEmployeeFile,
  viewPdfExportFileEmployee
};