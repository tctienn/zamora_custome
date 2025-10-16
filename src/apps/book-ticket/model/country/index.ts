export interface ICountry{
    id?: string;
    code: string;
    name: string;
    sortOrder?: number;
    listCity?: ICity[];
    status?: string;
    isDefault?: boolean;
}
export interface ICity{
    cityId?: string;
    cityName: string;
}