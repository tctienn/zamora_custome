export interface OrgOutInterface {
    id: string | undefined,
    orgOutCode: string,
    orgOutIdentify: string,
    orgOutName: string,
    address: string,
    email: string,
    isSendToEsb: boolean,
}

export class OrgOut implements OrgOutInterface {
  id: string | undefined;

  orgOutCode: string;

  orgOutIdentify: string;

  orgOutName: string;

  address: string;

  email: string;

  isSendToEsb: boolean;

  constructor() {
    this.id = undefined;
    this.orgOutCode = '';
    this.orgOutIdentify = '';
    this.orgOutName = '';
    this.address = '';
    this.email = '';
    this.isSendToEsb = false;
  }
}

export interface OrgOutEdge {
    cursor: string;
    node: OrgOutInterface | null;
}