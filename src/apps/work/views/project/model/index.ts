import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import { useUserStore } from '@/common/store/user';

export interface ProjectInterface {
    id?: string;
    admins: string[];
    name: string;
    code: string;
    type: string;
    typeName: string;
    groupId: string;
    groupName: string;
    parentId: string;
    parentProjName: string;
    logo: string;
    implementers: string[];
    followers: string[];
    numbTask: number;
    description: string;
    sequenceNumber: number;
    progress: number;
    startDate: Date;
    endDate: Date;
    status: string;
    isDeleted: boolean;
    createdDate: Date;
    createdBy: string;
    images: WorkAttachment[];
    projectImportant: any;
    numberDate: number | null;
    totalValue: number | null;
    totalTask: number | null
    recipe: any
    projectLabel?: any[]
    isImportant?: boolean
}

export enum StatusProject {
    UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
    PREPARE_FOR_DEPLOYMENT = 'PREPARE_FOR_DEPLOYMENT',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    PAUSE = 'PAUSE',
    CANCEL = 'CANCEL',
    ALL = 'ALL',
    CLOSE = 'CLOSE'
}

export interface SearchProjectPayload {
    label: string,
    fromDate: Date,
    toDate: Date,
    admin: string,
    implementer: string,
    follower: string,
    createDate: Date,
    projectName: string,
    projectCode: string,
    projectType: string,
    projectGroup: string,
    recipe: string,
    creator: string
}

export enum FilterType {
    ADMIN = 'ADMIN',
    IMPLEMENT = 'IMPLEMENT',
    FOLLOW = 'FOLLOW',
    ORGANIZATION = 'ORGANIZATION',
    ALL = 'ALL'
}

const { user } = useUserStore();
export const defaultProject = {
  status: StatusProject.UNDER_CONSTRUCTION,
  implementers: [user.id],
  createdDate: new Date()
} as ProjectInterface;

export function getColorByStatusProject(status: string) {
  if (status == StatusProject.UNDER_CONSTRUCTION) {
    return '#69A0DC';
  } else if (status == StatusProject.PREPARE_FOR_DEPLOYMENT) {
    return '#BF7CD3';
  } else if (status == StatusProject.PROCESSING) {
    return '#F0BC8C';
  } else if (status == StatusProject.COMPLETED) {
    return '#94C748';
  } else if (status == StatusProject.PAUSE) {
    return '#888888';
  } else if (status == StatusProject.CANCEL) {
    return '#D08A8A';
  } else if (status == StatusProject.CLOSE) {
    return '#6CC3E0';
  }
  return '';
}

export const optionsRecipe = [
  {
    label: 'Theo bình quân % tiến độ các công việc thuộc dự án',
    subLabel: ['Ví dụ: Dự án gồm có 2 công việc A và B',
      'Công việc A tiến độ đạt 70%, công việc B đạt 30%',
      'Tiến độ của dự án là: (70+30)/2=50%'],
    value: 'SIMPLE'
  },
  {
    label: 'Theo tỷ trọng ngày thực hiện',
    subLabel: ['Ví dụ: Dự án gồm có 2 công việc A và B',
      'Công việc A yêu cầu thực hiện trong 04 ngày, tiến độ 40%',
      'Công việc B yêu cầu thực hiện trong 06 ngày, tiến độ 50%',
      'Tiến độ của dự án là: ((4*40+6*50)/(4*100+6*100))*100=46%'],
    value: 'WORKERS_AND_TIME'
  }
];