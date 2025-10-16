import { Book, BookType } from '@/apps/document/model/book';

export interface BookNumReserveInterface {
    id: string | undefined;
    bookType: BookType;
    bookId: string;
    bookDate: any;
    currentNumber: number;
    requestUserId: string;
    requestDeptId: string;
    bookNumber: any;
    bookNumberUsed: any;
    note: string;
    bookInfo: Book
    bookNumbers: []
}

export class BookNumReserve implements BookNumReserveInterface {
  id: string | undefined;

  bookId: string;

  bookDate: any;

  bookType: BookType;

  currentNumber: number;

  requestUserId: string;

  requestDeptId: string;

  bookNumber: any;

  bookNumberUsed: any;

  note: string;

  bookInfo: Book;

  bookNumbers: [];

  constructor() {
    this.id = undefined;
    this.bookId = '';
    this.bookDate = '';
    this.bookType = BookType.DOC_IN;
    this.currentNumber = 1;
    this.requestUserId = '';
    this.requestDeptId = '';
    this.bookNumber = [];
    this.bookNumberUsed = [];
    this.note = '';
    this.bookInfo = {} as Book;
    this.bookNumbers = [];
  }
}

export interface BookNumReserveEdge {
    cursor: string;
    node: BookNumReserveInterface | null;
}
