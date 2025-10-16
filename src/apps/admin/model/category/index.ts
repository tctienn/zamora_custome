
export interface CategoryInterface {
  code: string,
  name: string,
  description: string,
  groupCode: string,
  groupName: string | null,
  isGlobal: boolean,
  order: number | null,
  isDefault: boolean | null,
  status: string
}

export class Category implements CategoryInterface {
  code: string;

  name: string;

  description: string;

  groupCode: string;

  groupName: string | null;

  isGlobal: boolean;

  order: number | null;

  isDefault: boolean | null;

  status: string;

  constructor() {
    this.code = '';
    this.name = '';
    this.description = '';
    this.groupCode = '';
    this.groupName = null;
    this.isGlobal = false;
    this.order = null;
    this.isDefault = null;
    this.status = '';
  }
}

export interface CategoryEdge {
  cursor: string;
  node: CategoryInterface | null;
}

export interface CategoryGroupInterface {
  code: string,
  name: string,
  description: string,
  parentCode: string | null
  parentName: string | null
  isGlobal: boolean
  order: number,
  status: string
  apps: string[]
}

export interface CategoryGroupEdge {
  cursor: string;
  node: CategoryGroupInterface | null;
}

export interface CategoryOption {
  id: string,
  code: string,
  name: string,
  order: number,
  parentId: string
}