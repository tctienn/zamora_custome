import { ACTIVITY_STATUSES } from '@/common/constants';

export interface PropertyInterface {
  fieldName: string,
  name: string,
  dataType: DataType | null,
  referenceData: string | null,
  defaultValue: string,
  type: PropertyType | null,
  listValue: string[],
  description: string,
  required: boolean,
  status: string,
  order: number | null,
  group: number | null
}

export class Property implements PropertyInterface {
  fieldName: string;

  dataType: DataType | null;

  defaultValue: string;

  description: string;

  name: string;

  referenceData: string | null;

  listValue: string[];

  required: boolean;

  status: string;

  type: PropertyType | null;

  order: number | null;

  group: number | null;

  constructor() {
    this.fieldName = '';
    this.dataType = null;
    this.defaultValue = '';
    this.description = '';
    this.name = '';
    this.referenceData = '';
    this.listValue = [];
    this.required = false;
    this.status = ACTIVITY_STATUSES.ACTIVE;
    this.type = PropertyType.PRIVATE;
    this.order = 0;
    this.group = 0;
  }
}

export enum DataType {
  STRING = 'STRING',
  INT = 'INT',
  FLOAT = 'FLOAT',
  CHECK_BOX = 'CHECK_BOX',
  RADIO_BOX = 'RADIO_BOX',
  MULTI_SELECT = 'MULTI_SELECT',
  CATEGORY = 'CATEGORY',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  FILE = 'FILE'
}

export enum PropertyType {
  GLOBAL = 'GLOBAL',
  PRIVATE = 'PRIVATE'
}

export enum ValueType {
  CATEGORY = 'CATEGORY',
  TEXT = 'TEXT'
}