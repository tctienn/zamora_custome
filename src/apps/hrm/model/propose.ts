import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';

export interface Propose {
  id: string,
  code: string,
  field: string,
  objectTraining: string,
  duration: number,
  trainingLevel: string,
  expense?: number,
  trainingUnit: string,
  trainingPlace: string,
  trainingAddress: string,
  implementingUnit: string,
  lastModifiedTime: Date,
  lastModifiedBy: string,
  departmentProposed: string,
  diploma: string,
  target: string,
  note: string,
  createdBy: string;
  proposeName: string;
  isOnline: boolean;
  isOffline: boolean;
  followers: string[],
  takeCharges: string[],
  fromDate: Date,
  toDate: Date,
  numbStudent: number,
  status: string,
  createdTime: Date
  files: EmployeeAttachment[],
  schedules: Schedule[]
}

export interface Schedule {
  id: string,
  trainingContent: string,
  scope: string,
  teacher: string,
  telephoneNumber: string,
  startTime: Date,
  endTime: Date
}

export const ProposeStatusOptions = [
  {
    value: 'DRAFT',
    label: 'Nháp'
  },
  {
    value: 'PENDING',
    label: 'Chờ phê duyệt'
  },
  {
    value: 'APPROVED',
    label: 'Đã phê duyệt'
  },
  {
    value: 'UNAPPROVED',
    label: 'Không phê duyệt'
  },
];

export function getProposeStatusLabel(key: string): string {
  const found = ProposeStatusOptions.find(option => option.value === key);
  return found ? found.label : '';
}

// Tạo 5 bản ghi mẫu
export const trainingList: any[] = Array.from({ length: 50 }, () => []);
