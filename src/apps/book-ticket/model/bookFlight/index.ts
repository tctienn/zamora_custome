export enum FlightType {
  INTERNATIONAL = 'INTERNATIONAL',
  DOMESTIC = 'DOMESTIC'
}

export enum RequestType {
  BOOK_SPECIFIC_FLIGHT = 'BOOK_SPECIFIC_FLIGHT',
  AGENT_CHOOSE_FLIGHT = 'AGENT_CHOOSE_FLIGHT'
}

export interface IAttachmentFile {
  id?: string;
  size?: string;
  quote: string;
  attachment?: File | any;
  downloadPath?: string;
}

export interface IBookFlight {
  id?: string;
  requestNumber: string;
  createdDate: Date;
  officerId: string;
  goldenLotusCode?: string;
  workContentId?: string;
  workContentContent?: string;
  flightType?: FlightType;
  cityId?: string;
  cityName?: string;
  flightDate: Date;
  departureAirportId: string;
  departureAirportName: string;
  airportToDepartureId: string;
  airportToDepartureName: string;
  returnFlightDate: Date;
  airportDepartureReturnId?: string;
  airportDepartureReturnName?: string;
  airportToReturnId?: string;
  airportToReturnName?: string;
  requestType?: RequestType;
  departureTime: Date;
  outboundFlightNumber?: string;
  airlineDepartureId?: string;
  airlineDepartureName?: string;
  returnFlightTime: Date;
  returnFlightNumber?: string;
  airlineReturnId?: string;
  airlineReturnName?: string;
  flightScheduleDescription?: string;
  files?: IAttachmentFile[];
}

