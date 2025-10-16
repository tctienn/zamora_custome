export interface ITicketAgent {
  id?: string;
  code: string;
  name: string;
  address?: string;
  taxCode?: string;
  phone?: string;
  email: string;
  ticketAgentContact?: ITicketAgentContact[]; 
  note?: string;
  status?: string;
}

export interface ITicketAgentContact {
  ticketAgentContactId?: string;
  ticketAgentContactName: string;
  ticketAgentContactEmail: string;
  ticketAgentContactPhone: string;
}