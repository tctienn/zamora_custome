export interface IVehicleBranch {
  id: string | null;
  code: string | null;
  name: string | null;
  logo: any | null;
  isChangedLogo: boolean;
}

export interface IVehicleModel {
  id: string | null;
  code: string | null;
  name: string | null;
  vehicleBranch: string | null;
}

export interface VehicleBranchEdge {
  cursor: string;
  node: IVehicleBranch | null;
}
