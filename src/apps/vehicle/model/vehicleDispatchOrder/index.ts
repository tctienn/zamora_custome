export interface IVehicleDispatchOrder {
  id: string;
  numDispatchOrder: string;
  numTicket: string;
  createdDate: Date;
  bookingDate: Date;
  userBooking: string;
  numberUsers: number;
  departureDate: Date;
  expectedReturnDate: Date;
  bookingVehicleType: string;
  externalVehicleBranch: string;
  externalVehicleCard: string;
  externalVehicleInfo: string;
  vehicleId: string;
  users: [string];
  numKm: number;
  fuelCost: number;
  roadCost: number;
  onSitePlace: string;
  departurePoint: string;
  destination: string;
  reson: string;
  note: string;
  licensePlate: string;
  driver: string;
  driverPhoneNumber: string;
  numberOfSeats: number;
  vehicleBranch: string;
  kmEstimate: number;
  kmReality: number;
  gasolineEstimate: number;
  gasolineReality: number;
  costEstimate: number;
  costReality: number;
  kmInitial: number;
  kmEnd: number;
  status: string;
}

export interface VehicleDispatchOrderEdge {
  cursor: string;
  node: IVehicleDispatchOrder | null;
}

export enum BookingVehicleType {
  COMPANY_VEHICLE = 'COMPANY_VEHICLE',
  EXTERNAL_VEHICLE = 'EXTERNAL_VEHICLE',
}

export interface VehicleDispatchOrderSearchModel {
  keyword?: string;
  numDispatchOrder?: string;
  userBooking?: string;
  users?: string[];
  onSitePlace?: string;
  createdDateFrom?: Date;
  createdDateTo?: Date;
  numberUsers?: number;
  departureDate?: Date;
  expectedReturnDate?: Date;
  status?: string;
}

export interface VehicleLogSearchModel {
  keyword?: string;
  licensePlate?: string;
  departureDate?: Date;
  expectedReturnDate?: Date;
}
