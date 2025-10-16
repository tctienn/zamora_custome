import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createContract(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/contracts`, data);
}

function updateContract(contractId: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/contracts/${contractId}`, data);
}

function createContractAppendix(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/contracts-appendix`, data);
}

function updateContractAppendix(id: string, data: FormData) {
  return baseApi.putWithFile(`${HRM_URL}/api/contracts-appendix/${id}`, data);
}

function findContractAppendix(id: string) {
  return baseApi.get(`${HRM_URL}/api/contracts-appendix/${id}`);
}

export { createContract, createContractAppendix, findContractAppendix, updateContract, updateContractAppendix };