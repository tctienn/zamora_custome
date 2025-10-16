import type {
  VehicleDispatchOrderSearchModel,
  VehicleLogSearchModel,
} from '@/apps/vehicle/model/vehicleDispatchOrder';
import { VEHICLE_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function exportExcelReportVehicleDispatchOrder(
  _: any,
  search: VehicleDispatchOrderSearchModel,
) {
  return baseApi.downloadWithFullResponse(
    `${VEHICLE_URL}/export-dispatch-order/report/excel`,
    {},
    { params: { ...search } },
  );
}

function exportWordReportVehicleDispatchOrder(
  _: any,
  search: VehicleDispatchOrderSearchModel,
) {
  return baseApi.downloadWithFullResponse(
    `${VEHICLE_URL}/export-dispatch-order/report/word`,
    {},
    { params: { ...search } },
  );
}

function exportExcelReportVehicleLog(_: any, search: VehicleLogSearchModel) {
  return baseApi.downloadWithFullResponse(
    `${VEHICLE_URL}/export-dispatch-order/report-log/excel`,
    {},
    { params: { ...search } },
  );
}

function exportWordVehicleDispatchOrder(id: string | undefined) {
  return baseApi.downloadWithFullResponseWithGetMethod(
    `${VEHICLE_URL}/export-dispatch-order/word`,
    { params: { id } },
  );
}

export {
  exportExcelReportVehicleDispatchOrder,
  exportExcelReportVehicleLog,
  exportWordReportVehicleDispatchOrder,
  exportWordVehicleDispatchOrder,
};
