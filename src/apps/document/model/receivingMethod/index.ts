export interface ReceivingMethodInterface {
    id: string | undefined,
    code: string,
    name: string,
    norder: number | null,
    status: boolean | null,
}

export class ReceivingMethod implements ReceivingMethodInterface {
  id: string | undefined;

  code: string;

  name: string;

  norder: number | null;

  status: boolean | null;

  constructor() {
    this.id = undefined;
    this.code = '';
    this.name = '';
    this.norder = 0;
    this.status = null;
  }
}

export interface ReceivingMethodEdge {
    cursor: string;
    node: ReceivingMethodInterface | null;
}