export interface PartyPositionInterface {
    id: string | null,
    code: string,
    name: string,
    description: string,
    status: boolean | null,
}

export class PartyPosition implements PartyPositionInterface {
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

export interface PartyPositionEdge {
    cursor: string;
    node: PartyPositionInterface | null;
}