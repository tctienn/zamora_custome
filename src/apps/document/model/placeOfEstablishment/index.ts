export interface PlaceOfEstablishmentInterface {
  id: string | undefined;
  code: string;
  name: string;
  status: boolean | null;
  isDefault: boolean;
}

export class PlaceOfEstablishment implements PlaceOfEstablishmentInterface {
  id: string | undefined;

  code: string;

  name: string;

  status: boolean | null;

  isDefault: boolean;

  constructor() {
    this.id = undefined;
    this.code = '';
    this.name = '';
    this.status = null;
    this.isDefault = false;
  }
}

export interface PlaceOfEstablishmentEdge {
  cursor: string;
  node: PlaceOfEstablishmentInterface | null;
}
