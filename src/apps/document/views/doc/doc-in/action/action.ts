import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { RoleType } from '@/apps/document/model/permission';

export enum DocumentAction {
    PUT_INTO_BOOK = 'PUT_INTO_BOOK',
    PUT_INTO_BOOK_OCR = 'PUT_INTO_BOOK_OCR',
    COPY = 'COPY',
    CREATE_PROFILE = 'CREATE_PROFILE',
    ENTER_BOOK = 'ENTER_BOOK',
    CREATE_WORK = 'CREATE_WORK',
    PROCLAIM = 'PROCLAIM',
    ASK_FOR_OPINION = 'ASK_FOR_OPINION',
    CREATE_DRAFT = 'CREATE_DRAFT',
    PROMULGATE = 'PROMULGATE',
    PROCESS_HISTORY = 'PROCESS_HISTORY',
    VIEW_HISTORY = 'VIEW_HISTORY',
    CANCEL_PROMULGATE = 'CANCEL_PROMULGATE',
    REVOKE_PROMULGATE = 'REVOKE_PROMULGATE',
    TRANSFER_PROCESSING = 'TRANSFER_PROCESSING'
}

type ActionPermission = {
    roles: RoleType[],
    requiredDoc?: boolean
    icon?: string
    iconSub?: string
}

export const mapActionRole: { [key in keyof typeof DocumentAction]: ActionPermission } = {
  PUT_INTO_BOOK: { roles: [RoleType.VAN_THU] },
  PUT_INTO_BOOK_OCR: { roles: [RoleType.VAN_THU] },
  PROCLAIM: {
    roles: [RoleType.VAN_THU, RoleType.LANH_DAO, RoleType.CHUYEN_VIEN],
    requiredDoc: true,
    icon: 'notification_multiple'
  },
  ASK_FOR_OPINION: {
    roles: [RoleType.VAN_THU, RoleType.LANH_DAO, RoleType.CHUYEN_VIEN],
    requiredDoc: true,
    icon: 'chat_add_on',
    iconSub: 'pi pi-comments'
  },
  COPY: {
    roles: [RoleType.VAN_THU],
    requiredDoc: true,
    icon: 'content_copy'
  },
  CREATE_DRAFT: {
    roles: [RoleType.CHUYEN_VIEN],
    requiredDoc: true,
    icon: 'drafts'
  },
  CREATE_WORK: {
    roles: [RoleType.LANH_DAO, RoleType.CHUYEN_VIEN],
    requiredDoc: true,
    icon: 'add_task'
  },
  CREATE_PROFILE: {
    roles: [RoleType.LANH_DAO, RoleType.CHUYEN_VIEN],
    requiredDoc: true,
    icon: 'library_add'
  },
  ENTER_BOOK: {
    roles: [RoleType.VAN_THU],
    icon: 'library_add'
  },
  PROMULGATE: {
    roles: [RoleType.VAN_THU],
    icon: 'brand_awareness'
  },
  PROCESS_HISTORY: {
    roles: [RoleType.VAN_THU, RoleType.LANH_DAO, RoleType.CHUYEN_VIEN, RoleType.TRO_LY],
    icon: 'history'
  },
  VIEW_HISTORY: {
    roles: [RoleType.VAN_THU, RoleType.LANH_DAO, RoleType.CHUYEN_VIEN, RoleType.TRO_LY],
    icon: 'table_eye'
  },
  CANCEL_PROMULGATE: {
    roles: [RoleType.VAN_THU],
    icon: 'close_small'
  },
  REVOKE_PROMULGATE: {
    roles: [RoleType.VAN_THU],
    icon: 'cached'
  },
  TRANSFER_PROCESSING: {
    roles: [RoleType.VAN_THU, RoleType.LANH_DAO, RoleType.CHUYEN_VIEN, RoleType.TRO_LY],
    requiredDoc: true,
    icon: 'pi pi-send'
  },
};

export function filterActionsByRole(actions: DocumentAction[], useDeptRole: UserDeptRoleInput): DocumentAction[] {
  return actions.filter(action => actionHasPermission(action, useDeptRole));
}

export function actionHasPermission(action: DocumentAction, useDeptRole: UserDeptRoleInput): boolean {
  return mapActionRole[action].roles.includes(<RoleType>useDeptRole.roleId);
}

export function actionRequireDoc(action: DocumentAction): boolean {
  return mapActionRole[action].requiredDoc || false;
}