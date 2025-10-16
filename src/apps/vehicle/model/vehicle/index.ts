import type { FileAttachment } from '@/apps/vehicle/model/fileAttachment';

export interface IVehicle {
  id: string;
  licensePlate: string;
  vehicleBranch: string;
  vehicleType: string;
  yearOfManufacture: number;
  norder: number;
  numberOfSeats: number;
  status: boolean;
  frameNumber: string;
  engineNumber: string;
  hasAirportSecurityCard: boolean;
  driver: string;
  vehicleStatus: string;
  usagePurpose: string;
  images: FileAttachment[];
  idFilesDelete: string[];
  color: string;
  fuelType: string;
  inspectionDate: any;
  registrationPeriod: any;
  registrationCertificateNumber: string;
  registrationCertificateBackImg: any;
  registrationCertificateFrontImg: any;
  origin: string;
  transmission: string;
  organizationId: string;
}

export interface VehicleEdge {
  cursor: string;
  node: IVehicle | null;
}

export enum VehicleStatus {
  WORKING_WELL = 'WORKING_WELL',
  WORKING = 'WORKING',
  WAITING_FOR_DISPOSAL = 'WAITING_FOR_DISPOSAL',
  STOPPED = 'STOPPED',
  DISPOSED = 'DISPOSED'
}

export enum UsagePurposes {
  PRIVATE_BLD = 'PRIVATE_BLD',
  SHARED_PASSENGER = 'SHARED_PASSENGER',
  SHARED_GOODS = 'SHARED_GOODS',
}