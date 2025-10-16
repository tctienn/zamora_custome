export interface OrgInterconnectedInterface {
    id: string | undefined,
    code: string,
    name: string,
    norder: number | null,
    parentUnit: string,
    identify: string,
    signatory: string,
    address: string,
    email: string,
    phone: string,
    fax: string,
    domainName: string,
    lock: boolean,
}

export class OrgInterconnected implements OrgInterconnectedInterface {
  id: string | undefined;

  code: string;

  name: string;

  norder: number | null;

  parentUnit: string;

  identify: string;

  signatory: string;

  address: string;

  email: string;

  phone: string;

  fax: string;

  domainName: string;

  lock: boolean;

  constructor() {
    this.id = undefined;
    this.code = '';
    this.name = '';
    this.norder = 0;
    this.parentUnit = '';
    this.identify = '';
    this.signatory = '';
    this.address = '';
    this.email = '';
    this.phone = '';
    this.fax = '';
    this.domainName = '';
    this.lock = false;
  }
}

export interface OrgInterconnectedEdge {
    cursor: string;
    node: OrgInterconnectedInterface | null;
}