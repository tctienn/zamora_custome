import { VEHICLE_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createVehicle(formData: FormData) {
  return baseApi.postWithFile(`${VEHICLE_URL}/vehicle`, formData);
}

function updateVehicle(formData: FormData) {
  return baseApi.putWithFile(`${VEHICLE_URL}/vehicle`, formData);
}

function createVehicleBranch(formData: FormData) {
  return baseApi.postWithFile(`${VEHICLE_URL}/vehicle-branch`, formData);
}

function updateVehicleBranch(formData: FormData) {
  return baseApi.putWithFile(`${VEHICLE_URL}/vehicle-branch`, formData);
}

export { createVehicle, createVehicleBranch, updateVehicle, updateVehicleBranch };
