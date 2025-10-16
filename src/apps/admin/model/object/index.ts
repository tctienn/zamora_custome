import type { PropertyInterface } from '@/apps/admin/model/object/Property';
import { STATUSES } from '@/common/constants';

export interface ObjectInterface {
  id: string,
  className: string,
  name: string,
  description: string,
  status: string,
  properties: PropertyInterface[]
}

export class ObjectImpl implements ObjectInterface {
  id: string;

  className: string;

  name: string;

  description: string;

  status: string;

  properties: PropertyInterface[];

  constructor() {
    this.id = '';
    this.className = '';
    this.name = '';
    this.description = '';
    this.status = STATUSES.ACTIVE;
    this.properties = [];
  }
}

export interface ObjectEdge {
  cursor: string;
  node: ObjectInterface | null;
}