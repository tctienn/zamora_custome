import { toRef } from 'vue';

export function getDocStatusFromRoute(route: string): StatusDocRoute | null {
  return Object.values(StatusDocRoute).find(value => route.includes(value)) || null;
}

export function getHideButtonsStatus(statusDocRoute: StatusDocRoute | null) {
  const mapHideButtonsNames: Record<StatusDocRoute, string[]> = {
    //Common
    [StatusDocRoute.WAITING_PROCESS]: [],
    [StatusDocRoute.PROCESSING]: ['OPTION_BUTTONS'],
    [StatusDocRoute.PROCESSED]: ['ALL'],
    [StatusDocRoute.WAITING_COMMENT]: ['ALL'],
    [StatusDocRoute.COMMENTED]: ['ALL'],
    //DocOut(DocSubmit)
    [StatusDocRoute.PROCLAIMED]: ['ALL'],
    [StatusDocRoute.EVICT]: ['ALL'],
    //DocOut(DocSubmit) specialist
    [StatusDocRoute.SPECIALIST_PROCESSING]: ['ALL'],
    [StatusDocRoute.SPECIALIST_PROCESSED]: ['ALL'],
    [StatusDocRoute.DRAFT]: ['REJECT'],
    //DocIn
    [StatusDocRoute.RECEIVE_TO_KNOW]: ['REVOKE'],
    //DocInClerk
    [StatusDocRoute.RECEIVE]: ['RECEIVE_TO_KNOW', 'COMPLETE', 'REVOKE'],
    [StatusDocRoute.CLERK_PROCESSING]: ['ALL'],
    [StatusDocRoute.CLERK_PROCESSED]: ['ALL'],

  };
  if (!statusDocRoute) {
    return toRef(['ALL']);
  }
  return toRef(mapHideButtonsNames[statusDocRoute]);
}

export enum StatusDocRoute {
  //Common
  WAITING_PROCESS = 'waiting-process',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  WAITING_COMMENT = 'waiting-comment',
  COMMENTED = 'commented',

  //DocOut(DocSubmit)
  PROCLAIMED = 'proclaimed',
  EVICT = 'evict',
  //DocOutSpecialist
  SPECIALIST_PROCESSING = 'specialist-processing',
  SPECIALIST_PROCESSED = 'specialist-processed',
  DRAFT = 'draft',

  //DocIn
  RECEIVE_TO_KNOW = 'receive-to-know',
  //DocInClerk
  RECEIVE = 'receive',
  CLERK_PROCESSING = 'clerk-processing',
  CLERK_PROCESSED = 'clerk-processed',
}