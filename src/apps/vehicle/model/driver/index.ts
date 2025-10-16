export type Driver = {
  id?: string;
  driverSource: DriverSource
  userId: string
  fullname: string
  gender: boolean
  phone: string
  organizationIds: string[]
  driverType: DriverType
  listVehicles: string[]
  norder: number
  status: boolean
  vehicleRentalCompanyId?: string
  driverLicense: string
  driverLicenseExpiryDate: any;
}

export enum DriverSource {
  INTERNAL = 'INTERNAL',
  OUTSOURCED = 'OUTSOURCED',
}

export enum DriverType {
  DRIVER_FOR_DIRECTORS = 'DRIVER_FOR_DIRECTORS',
  GENERAL = 'GENERAL',
}