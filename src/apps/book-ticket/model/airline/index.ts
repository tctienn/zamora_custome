export interface IAirline{
    id?: string;
    code: string;
    name: string;
    type?: ITypeAirline;
    status?: string;
    sortOrder?: number;
    logoFile?: IFile;
}

export interface IFile{
    id?: string,
    downloadPath?: string
}
export interface ITypeOption{
    code: string;
    name: string;
}

export enum ITypeAirline {
    INTERNATIONAL = 'INTERNATIONAL',
    DOMESTIC = 'DOMESTIC',
    OTHER = 'OTHER'
}