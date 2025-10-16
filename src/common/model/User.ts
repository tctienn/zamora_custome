import type { OrganizationType } from '@/apps/document/model/organization';

export class User {
  id?: string;

  username?: string;

  email?: string;

  fullName?: string;

  avatar?: string;

  locked?: boolean;

  birthDay?: string | Date;

  phone?: string;

  using2FA?: boolean;

  constructor(
    id?: string,
    username?: string,
    email?: string,
    fullName?: string,
    locked?: boolean,
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.fullName = fullName;
    this.locked = locked;
  }
}

export interface UserInterface {
  id?: string;
  username?: string;
  email?: string;
  fullName?: string;
  locked: boolean;
  status?: string;
  birthDay?: string | Date;
  avatar: string;
  mainSign?: string;
  flashingSignature?: string;
  createDate?: string | Date;
  userCode?: string;
  phone?: string;
  roles: UserRole[];
  using2FA?: boolean;
  organizationCode?: string;
  organizationName?: string;
  simCa?: string;
  gender?: number;
  active?: boolean;
  position?: string;
}

export interface UserRole {
  code: string;
  name: string;
}

export interface UserLoginResponse {
  user: UserInterface;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface UserSupport {
  id: string;
  userId: string;
  userSupportId: string;
  supportType: any;
  supportPermission: string[];
  supportsPermission: string[];
  orgType: OrganizationType;
  roleId: string;
  deptId: string;
}

export enum SupportPermission {
  READ_INCOMING_DOC = 'READ_INCOMING_DOC',
  ADVISE_INCOMING_DOC = 'ADVISE_INCOMING_DOC',
  TRANSFER_INCOMING_DOC = 'TRANSFER_INCOMING_DOC',
  RETURN = 'RETURN',
  COMPLETE = 'COMPLETE',
  WITHDRAW_INCOMING_DOC = 'WITHDRAW_INCOMING_DOC',
  SENT_TO_KNOW = 'SENT_TO_KNOW',
  READ_OUTGOING_DOC = 'READ_OUTGOING_DOC',
  ADVISE_OUTGOING_DOC = 'ADVISE_OUTGOING_DOC',
  TRANSFER_OUTGOING_DOC = 'TRANSFER_OUTGOING_DOC',
  APPROVE_OUTGOING_DOC = 'APPROVE_OUTGOING_DOC',
  WITHDRAW_OUTGOING_DOC = 'WITHDRAW_OUTGOING_DOC',
  REGISTER = 'REGISTER',
  APPROVE_MEETING = 'APPROVE_MEETING',
  ALLOW_VIEW_CONTENT = 'ALLOW_VIEW_CONTENT',
  ALLOW_EXCHANGE = 'ALLOW_EXCHANGE',
  WITHDRAW_DOC_SUBMIT = 'WITHDRAW_DOC_SUBMIT',
  APPROVE_DOC_SUBMIT = 'APPROVE_DOC_SUBMIT',
  TRANSFER_DOC_SUBMIT = 'TRANSFER_DOC_SUBMIT',
  ADVISE_DOC_SUBMIT = 'ADVISE_DOC_SUBMIT',
  READ_DOC_SUBMIT = 'READ_DOC_SUBMIT',
}

export interface PersonalSetting {
  id: string;
  userId: string;
  showBirthday: boolean;
  showOnlyDate: boolean;
  showPhoneNumber: boolean;
  showEmail: boolean;
  allowNotification: boolean;
}
