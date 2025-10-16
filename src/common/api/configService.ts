import EnvConfig from '@/common/config';

const GATEWAY_URL = EnvConfig.value('VITE_GATEWAY');
const EDITOR_URL = EnvConfig.value('VITE_EDITOR_URL');
const WS_CHAT_SERVER = EnvConfig.value('VITE_CHAT_SERVER');

const ADMIN_TENANT_URL = `${GATEWAY_URL}/admin-tenant`;
const AUTH_URL = `${GATEWAY_URL}/auth`;
const ADMIN_URL = `${GATEWAY_URL}/admin-service`;
const ECM_URL = `${GATEWAY_URL}/ecm-service`;
const E_FORM_URL = `${GATEWAY_URL}/eform-service`;
const HRM_URL = `${GATEWAY_URL}/hrm-service`;
const NOTIFICATION_URL = `${GATEWAY_URL}/notification-service`;
const CHAT_URL = `${GATEWAY_URL}/chat`;
const FILE_URL = `${GATEWAY_URL}/files`;
const WIDGET_URL = `${GATEWAY_URL}/widget-service`;
const WORK_URL = `${GATEWAY_URL}/work-service`;
const MEDIA_URL = `${GATEWAY_URL}/media-service`;
const MEETING_URL = `${GATEWAY_URL}/meeting-service`;
const FLOW_URL = `${GATEWAY_URL}/flow-service`;
const SEARCH_URL = `${GATEWAY_URL}/search-service`;
const DOCUMENT_URL = `${GATEWAY_URL}/document-service`;
const VEHICLE_URL = `${GATEWAY_URL}/vehicle-service`;
const TICKET_URL = `${GATEWAY_URL}/ticket-service`;
const MISSION_URL = `${GATEWAY_URL}/mission-service`;

export {
  ADMIN_TENANT_URL,
  ADMIN_URL,
  AUTH_URL,
  CHAT_URL,
  DOCUMENT_URL,
  E_FORM_URL,
  ECM_URL,
  EDITOR_URL,
  FILE_URL,
  FLOW_URL,
  GATEWAY_URL,
  HRM_URL,
  MEDIA_URL,
  MEETING_URL,
  MISSION_URL,
  NOTIFICATION_URL,
  SEARCH_URL,
  TICKET_URL,
  VEHICLE_URL,
  WIDGET_URL,
  WORK_URL,
  WS_CHAT_SERVER
};
