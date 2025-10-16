import type { BookingCarSearchModel } from '@/apps/vehicle/model/bookingCar';
import { VEHICLE_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function exportExcelReportBookingCar(_: any, search: BookingCarSearchModel) {
  return baseApi.downloadWithFullResponse(
    `${VEHICLE_URL}/export-booking-car/report/excel`,
    {},
    { params: { ...search } },
  );
}

function exportWordReportBookingCar(_: any, search: BookingCarSearchModel) {
  return baseApi.downloadWithFullResponse(
    `${VEHICLE_URL}/export-booking-car/report/word`,
    {},
    { params: { ...search } },
  );
}

function exportWordVehicleDispatchOrderVCB(id: string) {
  return baseApi.downloadWithFullResponse(
    `${VEHICLE_URL}/export-booking-car/vehicle-dispatch-order/word`,
    {},
    { params: { id } },
  );
}

function createBookingCar(formData: FormData) {
  return baseApi.postWithFile(`${VEHICLE_URL}/booking-car/create`, formData);
}

function updateBookingCar(formData: FormData) {
  return baseApi.putWithFile(`${VEHICLE_URL}/booking-car/update`, formData);
}

export { createBookingCar, exportExcelReportBookingCar, exportWordReportBookingCar, exportWordVehicleDispatchOrderVCB, updateBookingCar };
