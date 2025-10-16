import { storeToRefs } from 'pinia';

import { useUserStore } from '@/common/store/user';

const { user } = storeToRefs(useUserStore());

export enum ColumnTypeEnum {
    FORMULA = 'FORMULA',
    MANUALLY_ENTERED = 'MANUALLY_ENTERED',
    FROM_SYSTEM = 'FROM_SYSTEM',
}

export enum DataTypeEnum {
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    STRING = 'STRING',
    DATE = 'DATE',
    DECIMAL = 'DECIMAL',
}

export enum DataSystemEnum {
    FULL_NAME = 'FULL_NAME',
    EMPLOYEE_CODE = 'EMPLOYEE_CODE',
    POSITION = 'POSITION',
    WORKING_DAYS = 'WORKING_DAYS'

}

export interface TemplateColumn {
    id?: string;
    code: string;
    templateId?: string;
    name: string;
    columnType: string;
    columnDataSystem?: string | null;
    dataType: string;
    analyticFunction?: string | null;
    orderNumber: number;
    subColumns?: Partial<TemplateColumn>[];
    status: string;
    formula?: string;
    errors?: Record<string, string>;
    isInitData?: boolean;
}

export interface TemplateForm {
    id?: string;
    name: string;
    description: string;
    type: string;
    status: string;
}

export interface SalaryTemplate {
    id?: string;
    name: string;
    description: string;
    status: string;
    type: string;
    columns: TemplateColumn[];
}

export interface Notification {
    userId: string;
    userName: string;
    year: number;
    titleName: string;
    dateNotification: string;
}

export interface YearGroup {
    year: number;
    notifications: Notification[];
}

const generateGroupedNotifications = (): YearGroup[] => {

  let userId = 1;
  const fakeData: Notification[] = [];
  const currentDate = new Date();
  const startDate = new Date(2024, 0, 1); // Tháng 1/2024

  while (startDate <= currentDate) {
    const month = startDate.getMonth() + 1; // Vì getMonth() trả về 0-11

    const notification: Notification = {
      userId: user.value.id ?? '',
      userName: user.value.fullName ?? '',
      year: startDate.getFullYear(),
      titleName: `Bảng tính lương tháng ${month}`,
      dateNotification: new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        Math.floor(Math.random() * 28) + 1
      ).toString()
    };

    fakeData.push(notification);
    userId++;
    startDate.setMonth(startDate.getMonth() + 1);
  }

  // Gộp theo năm
  const grouped: Record<number, YearGroup> = {};

  fakeData.forEach((item) => {
    if (!grouped[item.year]) {
      grouped[item.year] = {
        year: item.year,
        notifications: []
      };
    }
    grouped[item.year].notifications.push(item);
  });

  return Object.values(grouped);
};

export interface PayslipPayload {
    id?: string | null;
    name: string | null;
    month: number | null;
    year: number | null;
    createdDate: Date | null;
    createdBy: string | null;
    organizationIds: string[] | null;
    templateIds: string[] | null;
    location: string | null;
}

export interface Payslip {
    id: string;
    name: string;
    month: number;
    year: number;
    createdDate: Date;
    createdBy: string;
    organizationIds: string[];
    templateIds: string[];
    status: string;
    location: string;
}

// ✅ Biến đã thực thi, sẵn sàng để import
export const groupedNotifications: YearGroup[] = generateGroupedNotifications();

export enum SalaryProcessForm {
    COEFFICIENT = 'COEFFICIENT', FIXED = 'FIXED', SCALE = 'SCALE'
}

export enum PayslipStatus {
    APPROVED = 'APPROVED',
    PENDING_REVIEW = 'PENDING_REVIEW',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    REJECTED = 'REJECTED',
    DRAFT = 'DRAFT'
}

export interface SalaryProcess {
  id: string,
  employeeId: string,
  createdMonth: number,
  createdYear: number,
  salaryProcessForm: any,
  salaryScale: number,
  salaryLevel: string,
  salaryCoefficient: number,
  salary: number,
  regionalMinimumWage: number,
  totalSalary: number,
  note: string,
  status: boolean,
  expireDate: any
}

export interface employeePayslipValueItem {
    id: string;
    value: number | string | null;
}

export interface DefaultPayslipInfos {
    id: string;
    payslipCode: string;
    payslipName: string;
    code: string;
    name: string;
    parentId: string;
    isGroup: boolean;
    orderNum: string | number | null;
    status: boolean;
}

export interface EmployeePayslipValue {
    columnId: string;
    id: string;
    recordId?: string;
    value: string;

    [key: string]: any;
}

export interface EmployeePayslip {
    employeeId: string;
    organizationName: string;
    values: EmployeePayslipValue[];

    [key: string]: any;
}

export interface EmployeePayslipRow {
    [key: string]: any;

    id: string;
    stt?: string | number;
    isGroupTotal?: boolean;
    employeeId?: string;
    organizationName: string;
    orderNumber?: number;
    isOverallTotal?: boolean;
    isTotalRow?: boolean;
}

export interface EmployeePayslipColumn {
    id?: string;
    code: string;
    templateId: string | null;
    name: string;
    dataType: string;
    analyticFunction?: string | null;
    orderNumber: number
    status: string | null;
    columnType: string;
    columnDataSystem: string;
    subColumns: any[];
    formula: string | null;
    isInitData?: boolean;
    [key: string]: any;
}

export interface TemplatePayslip {
    id: string;
    name: string;
    description: string;
    type?: string;
    status?: string;
    columns: EmployeePayslipColumn[];
}

export interface ValuesEmployeePayslip {
    employeeId?: string;
    columnId: string;
    value: string | number | null;
}

export interface EmployeesPayslip {
    employeeId: string;
    value: any;
    organizationId?: string;
    organizationName?: string;
    orderNumber?: number;
}

export interface DetailedSalaryInfoType {
    id?: string;
    name: string;
    type?: string;
    month: number;
    year: number;
    location: string;
    createdDate: string;
    createdBy: string;
    status?: string;
    organizationIds: string[];
    columns: EmployeePayslipColumn[]
    employees: EmployeesPayslip[];

    [key: string]: any;
}

export type SimplifiedSalaryInfoType = Omit<DetailedSalaryInfoType, 'organizationIds' | 'columns' | 'employees'>

export interface PayslipDataType {
    [key: string]: any;
}