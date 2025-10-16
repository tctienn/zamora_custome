export interface Parameter {
  enabled?: boolean;
  structure: string | null;
  startValue: number | null;
  allowEdit?: boolean;
}

export interface DeadlineNotice {
  carInsurance: number | null;
  vehicleRegistration: number | null;
  driverLicense: number | null;
}
