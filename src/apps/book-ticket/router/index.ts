import type { RouteRecordRaw } from 'vue-router';

/**
 * - To config a route not show in menu, set showInMenu: false
 * - To config a route not show in breadcrumb, set showInBreadcrumb: false
 */
const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/book-ticket/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'BOOK-TICKET',
    },
    name: 'book-ticket',
    path: '/book-ticket',
    children: [
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'BOOK-TICKET_CATEGORY',
          isModule: true,
          icon: 'list',
        },
        name: 'bookTicketCategory',
        path: 'category',
        children: [
          {
            component: () => import('@/apps/book-ticket/views/country/CountryManage.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              menuCode: 'BOOK-TICKET_CATEGORY_COUNTRY',
              isModule: true,
              icon: 'globe_uk',
            },
            name: 'bookTicketCountry',
            path: 'country'
          },
          {
            component: () => import('@/apps/book-ticket/views/airport/AirportManage.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              menuCode: 'BOOK-TICKET_CATEGORY_AIRPORT',
              isModule: true,
              icon: 'flight_land',
            },
            name: 'bookTicketAirport',
            path: 'airport'
          },
          {
            component: () => import('@/apps/book-ticket/views/airline/AirlineManage.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              menuCode: 'BOOK-TICKET_CATEGORY_AIRLINE',
              isModule: true,
              icon: 'airlines',
            },
            name: 'bookTicketAirline',
            path: 'arline'
          },
          {
            component: () => import('@/apps/book-ticket/views/ticketAgent/TicketAgentManage.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              menuCode: 'BOOK-TICKET_CATEGORY_AIRLINE_TICKET_AGENT',
              isModule: true,
              icon: 'airplane_ticket',
            },
            name: 'bookTicketAirlineTicketAgent',
            path: 'airlineTicketAgent'
          },
          {
            component: () => import('@/apps/book-ticket/views/workContent/workContentManage.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              menuCode: 'BOOK-TICKET_CATEGORY_WORK_CONTENT',
              isModule: true,
              icon: 'assignment',
            },
            name: 'bookTicketWorkContent',
            path: 'workContent'
          },
        ]
      },
      {
        component: () => import('@/apps/book-ticket/views/bookFlight/BookFlightManage.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'BOOK-TICKET_FLIGHT',
          isModule: true,
          icon: 'flight_takeoff',
        },
        name: 'bookTicketFlight',
        path: 'bookFlight',
      }
    ]
  },
  
];

export default routes;
