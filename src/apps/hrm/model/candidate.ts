import type { GenderType } from './recruitment';

export type Candidate = {
    id?: string;
    avatarImg?: string;
    candidateCode: string;
    recruitmentCampaignId: string;
    recruitmentSource?: RecruitmentSourceType;
    fullName?: string;
    dateOfBirth: Date;
    gender: GenderType;
    isMemberOfCommunistParty?: boolean;
    placeOfPermanentResidenceRegistration?: string;
    citizenID?: string;
    ethnicityCode?: string;
    dateOfIssue: Date;
    nationalityCode?: string;
    placeOfIssue?: string;
    maritalStatus?: string;
    phoneNumber?: string;
    email?: string;
    websiteLink1?: string;
    websiteLink2?: string;
    address: string;
    careerGoals?: string;
    hobbyCode?: string;
    campaignId?: string;
    campaignName?: string,
    campaignCode?: string,
    candidateEducations: CandidateEducations[];
    workExperiences: WorkExperiences[];
    extracuurricularActivities: ExtracuurricularActivities[];
    certificates: Certificates[];
    titlesAndAwards: TitlesAndAwards[];
    referencePersons: ReferencePersons[];
    hardSkill?: string;
    softSkill?: string; 
    createdBy: string;
    createdDate: Date;
    status?: string;
};

export type CandidateEducations = {
    id: string; 
    fromYear?: number | Date; 
    toYear?: number | Date;
    schoolName?: string; 
    majorCode?: string;
    graduationClassification: string;
    relatedSubjects?: string; 
    outstandingAchievements?: string;
    isNew?: boolean;
    isCreater?: boolean;
}

export type WorkExperiences = {
  id: string;
  fromMonthYear?: string | Date;
  toMonthYear?: string | Date;
  companyName?: string;
  jobTitleCode?: string;
  jobDescription?: string;
  outstandingAchievements?: string;
  isNew?: boolean;
  isCreater?: boolean;
}

export type ExtracuurricularActivities = {
  id: string;
  fromMonthYear?: string | Date;
  toMonthYear?: string | Date;
  organizationName?: string;
  positionName?: string;
  description?: string;
  isNew?: boolean;
  isCreater?: boolean;
}

export type Certificates = {
  id: string;
  receivedIn?: string | Date;
  certificateName?: string;
  isNew?: boolean;
  isCreater?: boolean;
}

export type TitlesAndAwards = {
  id: string;
  receivedIn?: string | Date;
  titleAndAwardName?: string;
  isNew?: boolean;
  isCreater?: boolean;
}

export type ReferencePersons = {
  id: string;
  fullName?: string;
  jobPositionCode?: string;
  companyName?: string;
  phoneNumber?: string;
  email?: string;
  isNew?: boolean;
  isCreater?: boolean;
}
export enum RecruitmentSourceType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum CandidateStatus {
    TOTAL_ALL = 'TOTALALL',
    APPLIED = 'APPLIED',
    APPLYING = 'APPLYING',
    PASSED = 'PASSED',
    FAILED = 'FAILED',
    TRANSFERRED_CANDIDATE_PROFILE = 'TRANSFERRED_CANDIDATE_PROFILE',
    SUITABLE_FOR_OTHER_POSITIONS = 'SUITABLE_FOR_OTHER_POSITIONS',
    CONTACT_LATER = 'CONTACT_LATER'
}