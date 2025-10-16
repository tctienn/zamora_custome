import { OrganizationType } from '@/apps/document/model/organization';

export interface BookInterface {
  id: string | undefined;
  bookType: BookType;
  bookName: string;
  bookOrder: number;
  isDefault: boolean;
  prefix: string;
  bookYear: number;
  currentNumber: number | undefined;
  deptId: string;
  isAuto: boolean;
  isGenerateByBook: boolean;
  isGenerateByDoctype: boolean;
  structureType: OrganizationType;
}

export class Book implements BookInterface {
  id: string | undefined;

  bookName: string;

  bookOrder: number;

  bookType: BookType;

  currentNumber: number;

  deptId: string;

  isAuto: boolean;

  isDefault: boolean;

  isGenerateByBook: boolean;

  isGenerateByDoctype: boolean;

  prefix: string;

  bookYear: number;

  structureType: OrganizationType;

  constructor() {
    this.id = undefined;
    this.bookName = '';
    this.bookOrder = 1;
    this.bookType = BookType.DOC_IN;
    this.currentNumber = 1;
    this.deptId = '';
    this.isAuto = true;
    this.isDefault = true;
    this.isGenerateByBook = true;
    this.isGenerateByDoctype = true;
    this.prefix = '';
    this.bookYear = new Date().getFullYear();
    this.structureType = OrganizationType.ADMINISTRATIVE;
  }
}

export interface BookEdge {
  cursor: string;
  node: BookInterface | null;
}

export enum BookType {
  DOC_IN = 'DOC_IN',
  DOC_OUT = 'DOC_OUT',
}
