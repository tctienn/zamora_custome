import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';

export type Employee = {
  employeeId?: string
  snapshotId?: string
  orderNumber?: string
  status?: string
  general: EmployeeGeneral
  education?: EmployeeEducation
  recruitment?: EmployeeRecruitment
  cccdPassport?: EmployeeCCCDPassport
  bankTax?: EmployeeBankTax
  contact?: EmployeeContact
  partyUnionArmy?: EmployeePartyUnionArmy
  otherInfo?: EmployeeOtherInfo
  workProcessInternal?: WorkProcessInternal[]
  workProcess: WorkProcess;
}

export type EmployeeSummary = {
  id?: string
  snapshotId?: string
  userId?: string
  locked?: boolean
  code?: string
  status?: EmployeeWorkingStatus
  fullName?: string
  birthDay?: string
  joinDate?: string
  gender?: string
  avatar?: string
  email?: string
  emailIssuingUnit?: string
  phoneNumber?: string

  homeTown?: string
  currentAddress?: string
  currentResidence?: string
  position?: string
  positionName?: string
  jobTitle?: string
  organizationId?: string
  organizationName?: string
  workLocation?: string
  cityFilter?: string
  nation?: string
  partyEntryDayOfficial?: string
  professionalLevel?: string
  politicalTheory?: string
  foreignLanguageLevel?: string
  note?: string
  isEdit?: boolean
  seniority?: string
}

export type EmployeeSummaryWithCheckin = EmployeeSummary & {
  checkins?: Record<string, {
    firstCheckin?: number,
    lastCheckout?: number
  }>
};

export type EmployeeFilter = {
  keyword?: string
  snapshotStatus?: EmployeeSnapshotStatus
  workingStatus?: EmployeeWorkingStatus
  organization?: string
  gender?: Gender
  jobPositions?: string[]
  homeTown?: string
  highestLevel?: string[]
  permanentResident?: string
  trainingType?: string[]
  nation?: string[]
  joinDateTo?: Date | string
  joinDateFrom?: Date | string
  birthDayTo?: Date | string
  birthDayFrom?: Date | string
  specialized?: string[]
  maritalStatus?: MaritalStatus
  professionalLevel?: string[]
  militaryService?: MilitaryService
  isMember?: boolean
  isParty?: boolean
}

export type Condition = {
  operator: string;
  value: any;
};

export type EmployeeFilterSuperAdvanceInput = {
  general?: {
    profileCode?: Condition;
    code?: Condition;
    fullName?: Condition;
    birthDay?: Condition;
    gender?: Condition;
    otherName?: Condition;
    managerCode?: Condition;
    timeKeepingCode?: Condition;
    joinDate?: Condition;
    birthPlace?: Condition;
    homeTown?: Condition;
    permanentResident?: Condition;
    permanentResidentStreet?: Condition;
    nationality?: Condition;
    nation?: Condition;
    religion?: Condition;
    maritalStatus?: Condition;
    isMember?: Condition;
    isParty?: Condition;
    generalLevel?: Condition;
    highestLevel?: Condition;
    professionalLevel?: Condition;
    trainingType?: Condition;
    specialized?: Condition;
    currentPosition?: Condition;
    phoneNumber?: Condition;
    landline?: Condition;
    email?: Condition;
    currentAddress?: Condition;
    currentResidence?: Condition;
    cccdNumber?: Condition;
    issueDate?: Condition;
    issuePlace?: Condition;
    recruitmentForm?: Condition;
    recruitmentPosition?: Condition;
    accountNumber?: Condition;
    accountName?: Condition;
    personalTaxCode?: Condition;
  };
  contract?: {
    type?: Condition;
    code?: Condition;
    signedDate?: Condition;
    effectiveDate?: Condition;
    expiryDate?: Condition;
    signatory?: Condition;
  };
  insurance?: {
    codeBHXH?: Condition;
    cardNumBHYT?: Condition;
    socialInsuranceParticipation?: Condition;
    bookNumBHXH?: Condition;
    hospitalCode?: Condition;
    paymentLevel?: Condition;
  };
};

export type EmployeeGeneral = {
  code: string
  fullName: string
  birthDay: string | Date
  gender: Gender
  otherName?: string
  orderNumber?: number
  managerCode?: string
  timeKeepingCode?: string
  joinDate: string | Date
  startDate?: string | Date
  birthPlace?: string
  homeTown?: string
  permanentResidentStreet?: string
  permanentResident?: string
  nationality?: string
  nation?: string
  religion?: string
  maritalStatus?: MaritalStatus
  militaryService?: MilitaryService
  isMember?: boolean
  isParty?: boolean
  profileCode?: string
  forte?: string
  hobby?: string
  avatar?: string
}

export type EmployeeEducation = {
  generalLevel?: string
  highestLevel?: string
  professionalLevel?: string
  trainingType?: string
  specialized?: string
  stateManagement?: string
  politicalTheory?: string
  foreignLanguageLevel?: string
  informationTechnologyLevel?: string
  yearsOfExperience?: number
  currentPosition?: string
}

export type EmployeeRecruitment = {
  recruitmentDate?: string | Date
  recruitmentForm?: string
  recruitmentPosition?: string
  jobBeforeRecruitment?: string
  recruitmentAgency?: string
  note?: string
  isOldStaff?: boolean
}

export type EmployeeCCCDPassport = {
  cccdNumber?: string
  issueDate?: string | Date
  issuePlace?: string
  expirationDateCCCD?: string | Date
  passportType?: string
  passportNumber?: string
  expirationDatePassport?: string | Date
  frontPhotoCCCD?: string
  backPhotoCCCD?: string
  passportPhoto?: string
}

export type EmployeeBankTax = {
  accountNumber?: string
  accountName?: string
  personalTaxCode?: string
  codeSynchronizedTax?: string
  bank?: string
  bankBranch?: string
}

export type EmployeeContact = {
  phoneNumber?: string
  landline?: string
  personToReport?: string
  email?: string
  relationship?: string
  emailIssuingUnit?: string
  phonePersonToReport?: string
  currentAddress?: string
  currentResidence?: string
  addressPersonToReport?: string
  zamoraId?: string
}

export type EmployeePartyUnionArmy = {
  partyCardNumber?: string
  partyEntryDay?: string | Date
  partyEntryDayOfficial?: string | Date
  placeAdmission?: string
  partyCellActivities?: string
  officialPartyCommittee?: string
  currentPartyCommittee?: string
  partyCommitteeAnd?: string
  partyFeeCalculation?: string
  appellation?: string
  armorial?: string
  unionCardNumber?: string
  unionEntryDay?: string
  unionEntry?: string
  unionCurrentPosition?: string
  dayJoiningRevolution?: string | Date
  dateOrganizationParticipation?: string | Date
  workInOrganization?: string
  enlistmentDate?: string | Date
  dischargeDate?: string | Date
  reasonDischarge?: string
  highestMilitaryRank?: string
  disabledClass?: string
  childrenPolicyFamilies?: string
}

export type EmployeeOtherInfo = {
  familyBackground?: string
  longestJobHeld?: string
  workExpertise?: string
  highestHonoraryTitle?: string
  clearlyDeclare?: string
  haveRelations?: string
  familySalary?: number
  otherSourcesIncome?: string
  houseProvided?: string
  usableArea?: number
  selfPurchasedHouse?: string
  areaHousePurchased?: number
  areaLandGranted?: number
  selfPurchasedLandArea?: number
  relativesAbroad?: string
  review?: string
}

export type EmployeeStatusFilter = {
  organization?: string
  status?: EmployeeWorkingStatus
}

export interface DashboardEduEmployee {
  orderNumber: number,
  levelName: string,
  count: number
  countMale: number
  countFemale: number
}

export interface DashboardGenderEmployee {
  totalMale: number,
  totalFemale: number
  total: number
}

export interface DashboardOrgEmployee {
  orgName: string,
  total: number
}

export interface DashboardContractEmployee {
  contractType: string,
  total: number
}

export interface DashboardAgeEmployee {
  count18To24Male: number;
  count18To24Female: number;
  count25To29Male: number;
  count25To29Female: number;
  count30To39Male: number;
  count30To39Female: number;
  count40To49Male: number;
  count40To49Female: number;
  count50Male: number;
  count50Female: number;
}

export enum EmployeeWorkingStatus {
  WORKING = 'WORKING',
  LEAVE = 'LEAVE',
  MATERNITY_LEAVE = 'MATERNITY_LEAVE',
  WITHOUT_PAY_LEAVE = 'WITHOUT_PAY_LEAVE',
  STUDY_LEAVE = 'STUDY_LEAVE',
  OTHER_LEAVE = 'OTHER_LEAVE',
  RETIREMENT = 'RETIREMENT'
}

export enum EmployeeSnapshotStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  OLD = 'OLD'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
}

export enum MilitaryService {
  YES = 'YES',
  NO = 'NO',
  EXEMPT = 'EXEMPT'
}

export enum RecruitmentForm {
  INTERNAL_RECRUITMENT = 'Tuyển dụng nhân sự nội bộ',
  EXTERNAL_RECRUITMENT = 'Tuyển dụng nhân sự bên ngoài',
  FROM_HUMAN_RESOURCE_TRAINING_CENTERS = 'Từ các trung tâm đào tạo nhân lực',
  COMBINING_THIRD_PARTIES = 'Kết hợp với bên thứ 3',
  OTHER = 'Hình thức khác'
}

export type FamilyRelationshipInfo = {
  employeeId?: string;
  snapshotId?: string;
  id?: string;
  relationshipType?: string;
  name?: string;
  hometown?: string;
  relationship?: string;
  yearBirth?: number;
  job?: string;
  phone?: string;
  taxCode?: string;
  workUnit?: string;
  cccdNumber?: string;
  dateIssueCCCD?: string;
  jobTitle?: string;
  placeIssueCCCD?: string;
  address?: string;
  isDependent?: boolean;
  fromDate?: string;
  toDate?: string;
  memberSocialWorkOrganization?: string;
  isWorkSameOffice?: boolean;
  isDead?: boolean;
  note?: string;
}

export type WorkProcess = {
  id?: string;
  employeeId?: string;
  fromMonth?: string | Date;
  toMonth?: string | Date;
  referencesPerson?: string;
  companyUnit?: string;
  phone?: string;
  address?: string;
  jobPosition?: string;
  description?: string;
  salary?: string;
  reasonForLeaving?: string;
};

export type WorkProcessInternal = {
  id: string;
  employeeId: string;
  fromDate: Date;
  isCurrent: boolean;
  jobTitle: string;
  organizationId: string;
  organizationName: string;
  position: string;
  toDate: Date;
  workLocation: string;
  isConcurrent: boolean;
  jobTitleName: string;
  positionName: string;
  employeeRank: string;
  employeeType: string;
  workDescription: string;
  workType: string;
  professionalWork: string
}

export type TrainingProcess = {
  id?: string;
  snapshotId?: string;
  fromMonth?: string;
  toMonth?: string;
  professionalLevel?: string;
  major?: string;
  issuingPlace?: string;
  trainingSystem?: string;
  yearGraduation?: number;
  classification?: string;
  issueDate?: string;
  mainDegree?: boolean;
  files?: EmployeeAttachment[]
}

export type EmployeeCertificate = {
  id?: string;
  snapshotId?: string;
  name?: string;
  fromMonth?: string;
  toMonth?: string;
  trainingField?: string;
  trainingForm?: string;
  issuingPlace?: string;
  result?: string;
  certificateType?: string;
  fromDate?: string;
  toDate?: string;
  version?: string;
  releaseDate?: string;
  files?: EmployeeAttachment[]
}

export type ReceivingDoc = {
  id?: string;
  snapshotId?: string;
  receivingDocCode?: string;
  receivingDocName?: string;
  receivingDate?: string;
  attachment?: any;
  receiver?: string;
  isChangeAttachment?: boolean;
  attachmentInfo?: any;
}

export type EmployeeHealth = {
  id: string
  snapshotId: string
  height: string
  weight: string
  bloodType: string
  bloodPressure: string
  heartRate: string
  healthStatus: string
  cholesterol: string
  triglycerid: string
  bloodSugarLevel: string
  waist: string
  updateDate: string
}

export type errorType = {
  code: string,
  message: string
}

export enum ProfileStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
}

export type ProfilesHistory = {
  id: string;
  employeeId: string;
  orderNumber: number;
  status: ProfileStatus | string; // Tùy theo enum bạn dùng
  approveBy: string | null;
  approveTime: string | null;
  createdTime: string | null;
  createdBy: string | null;
  lastModifiedTime: string | null;
  lastModifiedBy: string | null;
  version?: string | number;
}

interface FileItem {
  id: string | number;
  objectId: string | number;
  name: string;
  extension: string;
  fileName: string;
  path: string;
  size: number;
}

export type EmployeeOtherProfessionData = {
  id: string;
  employeeId: string;
  type: string;
  fromDate: string; // hoặc Date nếu bạn dùng kiểu Date
  toDate: string; // hoặc Date nếu bạn dùng kiểu Date
  description: string;
  isAutoUpdate?: boolean;
  files: FileItem[];
}