export interface Pageable {
    page: number;

    size: number;

    sort?: Order[];
}

export type Order = {
    property: string
    direction: Direction
}

export enum Direction {
    ASC = 'ASC', DESC = 'DESC'
}

export class RestParams {
  path = '';

  data?: object | FormData = {};

  hasFile? = false;

  isDownload? = false;

  isSync? = false;

  options?: object = {};
}

export interface ForgotPasswordRequest {
    email: string,
    username: string,
    forwardUrl: string
}

export interface ResetPasswordRequest {
    userId: string,
    newPassword: string
}

export interface RestPageable<T> {
    content: T[],
    pageable: {
        sort: {
            empty: boolean,
            sorted: boolean,
            unsorted: boolean
        },
        offset: number,
        pageNumber: number,
        pageSize: number,
        unpaged: boolean,
        paged: boolean
    },
    last: boolean,
    totalPages: number,
    totalElements: number,
    size: number,
    number: number,
    sort: {
        empty: boolean,
        sorted: boolean,
        unsorted: boolean
    },
    first: boolean,
    numberOfElements: number,
    empty: boolean
}

export interface SimpleRestPageable<T> {
    content: T[],
    totalPages: number,
    totalElements: number
}

export interface CreateAccountRequest {
    email: string,
    username: string,
    password: string
}

export interface DeleteDocumentRequest {
    id: string,
    name: string
}
