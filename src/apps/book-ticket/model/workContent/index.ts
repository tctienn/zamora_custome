export interface IWorkContent{
    id?: string;
    code: string;
    content: string;
    timeFrom?: Date;
    timeTo?: Date;
    status?: string;
    openTicketRegistration?: boolean;
}