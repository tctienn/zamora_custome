export interface DocTypeInterface {
  id: string | undefined;
  code: string;
  name: string;
  norder: number | null;
  status: boolean | null;
  numberOfProcessingDays: number;
  signDefault: string;
}

export class DocType implements DocTypeInterface {
  id: string | undefined;

  code: string;

  name: string;

  norder: number | null;

  status: boolean | null;

  numberOfProcessingDays: number;

  signDefault: string;

  constructor() {
    this.id = undefined;
    this.code = '';
    this.name = '';
    this.norder = 0;
    this.status = null;
    this.numberOfProcessingDays = 0;
    this.signDefault = '';
  }
}

export interface DocTypeEdge {
  cursor: string;
  node: DocTypeInterface | null;
}
