export interface IAirport{
    id?: string;
    code: string;
    name: string;
    countryId?: string;
    cityId?: string;
    status?: string;
    sortOrder?: number;
    isDefault?: boolean;
}