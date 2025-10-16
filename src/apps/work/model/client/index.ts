export interface ClientInterface {
    id: string,
    city: string,
    clientCode: string,
    clientName: string,
    address: string,
    email: string,
    field: string,
    foundingDate: Date,
    groupClient: string,
    home: string,
    note: string,
    phone: string,
    scale: string,
    taxCode: string,
    status: string,
    isDelete: boolean,
    employeeCode: string,
    employeeName: string,
    contact: string,
    contactEmail: string,
    contactPhone: string,
    position: string,
}

export interface Customer {
    id: string,
    clientCode: string,
    clientName: string,
}

export interface ClientEdge {
    cursor: string
    node: ClientInterface | null
}