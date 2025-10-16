export interface PositionInterface {
    id: string | null,
    code: string,
    name: string,
    description: string,
    status: boolean | null,
}

export class Position implements PositionInterface {
  id: string | null;

  code: string;

  name: string;

  description: string;

  status: boolean | null;

  constructor() {
    this.id = null;
    this.code = '';
    this.name = '';
    this.description = '';
    this.status = null;
  }
}

export interface PositionEdge {
    cursor: string;
    node: PositionInterface | null;
}