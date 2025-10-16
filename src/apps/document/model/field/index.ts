export interface FieldInterface {
    id: string | undefined,
    code: string,
    name: string,
    norder: number | null,
    status: boolean | null,
}

export class Field implements FieldInterface {
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

export interface FieldEdge {
    cursor: string;
    node: FieldInterface | null;
}