import { TaskPriority } from '@/apps/work/model/work';

export interface IBookingCar {
  id: string;
  numTicket: string;
  createdDate: Date;
  numDispatchOrder: string;
  numDispatchOrderCreatedDate: Date;
  userBooking: string;
  numberUsers: number;
  departureDate: Date;
  expectedReturnDate: Date;
  userId: string;
  companion: [string];
  numKm: number;
  priority: TaskPriority;
  fuelCost: number;
  roadCost: number;
  norder: number;
  otherCost: number;
  onSitePlace: string;
  departurePoint: string;
  destination: string;
  reson: string;
  note: string;
  driverSource: string;
  status: string;
  licensePlate: string;
  driver: string;
  noteDispatchOrder: string;
  userPhone: string;
  driverPhone: string;
  accompanyingDepartment: any;
  flowId: string;
  accompanyingDepartmentName: any;
  actualTimeEnded: any;
  actualDepartureTime: any;
  organizationParentId: string;
}

export interface BookingCarEdge {
  cursor: string;
  node: IBookingCar | null;
}

export interface BookingCarSearchModel {
  numTicket?: string;
  userBooking?: string;
  userId: string;
  companion?: string[];
  onSitePlace?: string;
  createdDateFrom?: Date;
  createdDateTo?: Date;
  numberUsers?: number;
  departureDate?: Date;
  expectedReturnDate?: Date;
  status?: string;
}

export interface BookingCarAttachmentInput {
  quote: string;
  attachment: any;
}

export enum BookingCarStatus {
  DU_THAO = 'DU_THAO', CHO_XU_LY = 'CHO_XU_LY',
  DA_PHE_DUYET = 'DA_PHE_DUYET', DA_LAP_LENH = 'DA_LAP_LENH', DA_NHAN_LENH = 'DA_NHAN_LENH', HOAN_THANH = 'HOAN_THANH', HUY = 'HUY'
}