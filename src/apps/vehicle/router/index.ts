import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/vehicle/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'VEHICLE',
    },
    name: 'vehicle',
    path: '/vehicle',
    children: [
      {
        component: () => import('@/apps/vehicle/views/dashboard/DashboardVehicle.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DASHBOARD',
          icon: 'dashboard',
          showInMenu: true,
        },
        name: 'VehicleDashboard',
        path: 'dashboard',
      },
      {
        component: () =>
          import('@/apps/vehicle/views/bookingCar/BookingCarManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'edit_calendar',
          showInMenu: true,
          menuCode: 'BOOKING_CAR_MANAGER',
        },
        name: 'BookingCarManager',
        path: 'booking-car',
      },
      /*{
        component: () =>
          import(
            '@/apps/vehicle/views/vehicleDispatchOrder/VehicleDispatchOrderManager.vue'
          ),
        meta: {
          requiredAuth: true,
          icon: 'directions_car',
          showInMenu: true,
          menuCode: 'VEHICLE_DISPATCH_ORDER_MANAGER',
        },
        name: 'VehicleDispatchOrderManager',
        path: 'vehicle-dispatch-order',
      },*/
      {
        meta: {
          requiredAuth: true,
          icon: 'list',
          showInMenu: true,
          menuCode: 'VEHICLE_CATEGORY',
          functionMapping: '/VEHICLE/VEHICLE_CATEGORY',
        },
        name: 'Category',
        path: 'category',
        children: [
          {
            component: () =>
              import(
                '@/apps/vehicle/views/vehicleBranch/VehicleBranchManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'VEHICLE_BRANCH_MANAGER',
              showInMenu: true,
              icon: 'dashboard',
              functionMapping:
                '/VEHICLE/VEHICLE_CATEGORY/VEHICLE_CATEGORY_VEHICLE-BRANCH',
            },
            name: 'VehicleCategoryVehicleBranch',
            path: 'vehicle-branch',
          },
          {
            component: () =>
              import('@/apps/vehicle/views/vehicle/VehicleManager.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'VEHICLE_MANAGER',
              showInMenu: true,
              icon: 'directions_car',
              functionMapping:
                '/VEHICLE/VEHICLE_CATEGORY/VEHICLE_CATEGORY_VEHICLE',
            },
            name: 'VehicleManager',
            path: 'vehicle',
          },
          {
            component: () =>
              import('@/apps/vehicle/views/driver/DriverManager.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'VEHICLE_MANAGER',
              showInMenu: true,
              icon: 'person',
              functionMapping:
                '/VEHICLE/VEHICLE_CATEGORY/VEHICLE_CATEGORY_VEHICLE',
            },
            name: 'DriverManager',
            path: 'driver',
          },
          {
            component: () =>
              import(
                '@/apps/vehicle/views/locationPoint/LocationPointManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'VEHICLE_LOCATION_POINT',
              showInMenu: true,
              icon: 'pin_drop',
              functionMapping:
                '/VEHICLE/VEHICLE_CATEGORY/VEHICLE_CATEGORY_LOCATION-POINT',
            },
            name: 'LocationPointManager',
            path: 'location-point',
          },
          {
            component: () =>
              import('@/apps/vehicle/views/vehicleRentalCompany/VehicleRentalCompanyManager.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'VEHICLE_MANAGER',
              showInMenu: true,
              icon: 'directions_car',
              functionMapping:
                '/VEHICLE/VEHICLE_CATEGORY/VEHICLE_CATEGORY_VEHICLE',
            },
            name: 'VehicleRentalCompanyManager',
            path: 'vehicleRentalCompany',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'insert_chart',
          showInMenu: true,
          menuCode: 'VEHICLE_REPORT',
        },
        name: 'Report',
        path: 'report',
        children: [
          {
            component: () =>
              import('@/apps/vehicle/views/report/BookingCarReport.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'VEHICLE_REPORT_BOOKING',
              showInMenu: true,
              icon: 'insert_chart',
            },
            name: 'BookingCarReport',
            path: 'booking-car',
          },
          {
            component: () =>
              import('@/apps/vehicle/views/report/VehicleLogReport.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'VEHICLE_REPORT_LOG',
              showInMenu: true,
              icon: 'insert_chart',
            },
            name: 'VehicleLogReport',
            path: 'vehicle-log',
          },
        ],
      },
      {
        meta: {
          icon: 'tune',
          menuCode: 'VEHICLE_FUNCTION-CONFIG',
          showInMenu: true,
        },
        name: 'VehicleFunctionConfig',
        path: 'config',
        children: [
          {
            component: () =>
              import(
                '@/apps/vehicle/views/config/parameterConfig/ParameterConfig.vue'
              ),
            meta: {
              icon: 'format_list_numbered',
              showInMenu: true,
            },
            name: 'VehicleParameterConfig',
            path: 'parameter',
          },
        ],
      },
    ],
  },
];

export default routes;
