export interface RestDayInterface {
  id: string | undefined;
  restDayName: string;
  note: string;
  fromDate: any;
  toDate: any;
  year: number;
}

export class RestDay implements RestDayInterface {
  id: string | undefined;

  restDayName: string;

  note: string;

  fromDate: any;

  toDate: any;

  year: number;

  constructor() {
    this.id = undefined;
    this.restDayName = '';
    this.note = '';
    this.fromDate = null;
    this.toDate = null;
    this.year = new Date().getFullYear();
  }
}

export interface RestDayEdge {
  cursor: string;
  node: RestDayInterface | null;
}
