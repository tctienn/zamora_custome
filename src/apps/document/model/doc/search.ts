import type { DocStatus } from '@/apps/document/model/doc/doc-in';
import { SendBackType } from '@/apps/document/model/doc/doc-in';
import type { OutgoingDocStatus } from '@/apps/document/model/doc/doc-out';
import { SignType } from '@/apps/document/model/doc/doc-out';
import type { ProcessType } from '@/apps/document/model/process/incoming';
import type { DocOutProcessType } from '@/apps/document/model/process/outgoing';

export type SearchModel = {
  keyword?: string
  identifyCode?: string;
  docCode?: string;
  docDateFrom?: string;
  docDateTo?: string;
  signerId?: string;
  signerName?: string;
  publisherId?: string;
  publisherName?: string;
  docTypeId?: string;
  docTypeName?: string;
  priorityCode?: string;
  securityCode?: string;
  areaId?: string;
  quote?: string;
  areaName?: string;
  deadlineDateFrom?: string;
  deadlineDateTo?: string;
  incomingDateFrom?: string;
  incomingDateTo?: string;
  isEnvelope?: boolean;
  isRequireAnswer?: boolean;
  isLawDocument?: boolean;
  isReply?: boolean;
  status?: DocStatus[];
  isDeleted?: boolean;
  bookId?: string;
  searchTimeFrom?: string;
  searchTimeTo?: string;
  processType?: ProcessType;
  bookNumber?: number,
  handler?: string,
  readStatus?: boolean,
  docSource?: string,
};

export type DocOutSearch = {
  keyword?: string
  docDateFrom?: string
  docDateTo?: string
  searchTimeFrom?: string
  searchTimeTo?: string
  processType?: DocOutProcessType
  quote?: string;
  bookName?: string;
  bookNumber?: number;
  docCode?: string;
  subBookNumber?: string;
  signerId?: string;
  signerName?: string;
  publisherId?: string;
  publisherName?: string;
  docTypeId?: string[];
  docTypeName?: string;
  priorityCode?: string;
  securityCode?: string;
  areaId?: string[];
  areaName?: string;
  deadlineNumber?: number;
  numberOfPage?: number;
  numberOfCopy?: number;
  isReply?: boolean;
  replyFor?: string;
  note?: string;
  copyFrom?: string;
  editorId?: string;
  editorName?: string;
  editorDeptId?: string;
  editorDeptName?: string;
  editorRoleId?: string;
  editorRoleName?: string;
  identifyCode?: string;
  qrCode?: string;
  fileId?: string;
  status?: OutgoingDocStatus;
  isLawDocument?: boolean;
  signTime?: Date;
  signType?: SignType;
  publishType?: string;
  sendBackType?: SendBackType;
  isDeleted?: string;
  advice?: string;
  isFromOutsidePaper?: boolean;
  issuerId?: string;
  issuerName?: string;
  issuerDeptId?: string;
  issuerDeptName?: string;
  issuerRoleId?: string;
  issuerRoleName?: string;
  incomingDocId?: string;
  receiveInIds?: string[];
  receiveOutIds?: string[];
  handler?: string;
}

export type DocSubmitSearch = {
  keyword?: string
  searchTimeFrom?: string;
  searchTimeTo?: string;
  // Noi lap
  docLocation?: string[];
  // Thoi gian noi lap
  docDateFrom?: string;
  docDateTo?: string;
  // Loai phieu trinh
  docType?: string[];
  // Van de trinh
  about?: string;
  // Kinh gui
  submitToIds?: string[];
  submitToNames?: string[];
  // Trang thai
  status?: string[];
  // Tom tat cong viec
  workSummary?: string;
  proposeOpinion?: string[];
  fileInclude?: string[];
  editorId?: string[];
  editorName?: string[];
  editorRoleId?: string[];
  editorRoleName?: string[];
  editorDeptId?: string[];
  editorDeptName?: string[];
  // Y kien
  searchOpinion?: string;
  opinion1?: string;
  opinion2?: string;
  opinion3?: string;
  opinion4?: string;
  opinion5?: string;
  opinion6?: string;
  // So
  number?: string;
  // Ky hieu
  symbol?: string;
  // Nam
  yearFrom?: number;
  yearTo?: number;
  securityCodes?: string[];
  // Ngay nhap
  dateInputFrom?: string;
  dateInputTo?: string;
  numberSubmissions?: string[];
  // Co quan trinh
  toDeptPresentIds?: string[];
  toDeptPresentNames?: string[];
  // Y kien lanh dao
  leaderOpinion?: string;
  docOutIds?: string[];
}