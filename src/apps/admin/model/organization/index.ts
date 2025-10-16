import type { UserMoreInfo } from '@/apps/admin/model/User';
import { STATUSES } from '@/common/constants';

export interface OrganizationInterface {
  id: string,
  code: string,
  name: string,
  description: string,
  parentCode: string | null,
  parentId: string | null,
  status: string,
  type: string,
  manager: string,
  effectiveDate: Date | string,
  expirationDate: Date | string,
  fileAttach: string
  logo: string
  numberSign: string
  users: UserInOrganizationInterface[]
  usersMoreInfo?: UserMoreInfo[]
  autoCreateGroup: boolean
  order: number
  acronym?: string,
  businessRegisAddress?: string,
  workAddress?: string,
  representative?: string,
  dateOfEstablishment?: string,
  decisionNumber?: string,
  decisionDate?: Date | string,
  businessRegisNumber?: string,
  taxCode?: string,
  telephoneNumber?: string,
  fax?: string,
  website?: string,
  email?: string,
  tags?: string[],
  isAudioCall: boolean,
  isVideoCall: boolean
  totalUsers: number
}

export interface UserInOrganizationInterface {
  id: string;
  username: string;
  email: string;
  fullName: string;
}

export class Organization implements OrganizationInterface {
  code: string;

  description: string;

  id: string;

  name: string;

  parentCode: string | null;

  parentId: string | null;

  status: string;

  type: string;

  manager: string;

  effectiveDate: Date | string;

  expirationDate: Date | string;

  fileAttach: string;

  logo: string;

  users: UserInOrganizationInterface[];

  usersMoreInfo?: UserMoreInfo[];

  autoCreateGroup: boolean;

  order: number;

  isVideoCall: boolean;

  isAudioCall: boolean;

  numberSign: string;

  totalUsers: number;

  constructor() {
    this.id = '';
    this.code = '';
    this.name = '';
    this.description = '';
    this.parentCode = null;
    this.parentId = null;
    this.status = STATUSES.ACTIVE;
    this.type = '';
    this.manager = '';
    this.effectiveDate = '';
    this.expirationDate = '';
    this.fileAttach = '';
    this.logo = '';
    this.users = [];
    this.usersMoreInfo = [];
    this.autoCreateGroup = false;
    this.order = 1;
    this.isVideoCall = false;
    this.isAudioCall = false;
    this.numberSign = '';
    this.totalUsers = 0;
  }
}

export interface OrganizationDropdownInterface {
  code: string,
  name: string,
  parentCode: string | null,
}

export interface FilterOrganizationsVariables {
  code: string | null;
  type: string | null;
  parentCode: string | null;
}

export interface FilterOrganizationsQueryResult {
  filterOrganizations: FilterOrganizationsResult[];
}

export interface FilterOrganizationsResult {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  parentCode: string | null;
  isDeleted: boolean;
  type: string;
  manager: string;
  effectiveDate: Date | string | null;
  expirationDate: Date | string | null;
  fileAttach: string | null;
  logo: string | null;
  order: number;
  acronym: string | null;
  businessRegisAddress: string | null;
  workAddress: string | null;
  representative: string | null;
  dateOfEstablishment: Date | string | null;
  decisionNumber: string | null;
  decisionDate: Date | string | null;
  businessRegisNumber: string | null;
  taxCode: string | null;
  telephoneNumber: string | null;
  fax: string | null;
  website: string | null;
  email: string | null;
  tags: string[] | null;
  isVideoCall: boolean;
  isAudioCall: boolean;
  numberSign: string | null;
}

export interface CountDirectChildrenUsersByCodeResult {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  parentCode: string | null;
  type: string;
  order: number;
  users: UserInOrganizationInterface[]; // Assuming this represents users in the organization
  totalUsers: number;
}

export interface CountDirectChildrenUsersByCodeQueryResult {
  countDirectChildrenUsersByCode: CountDirectChildrenUsersByCodeResult;
}
