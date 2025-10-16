import type { PageInfo } from '@/common/model/page';

export interface DocumentFrom {
    id: string,
    excerptFromTheText: string,
    branch: string,
    content: string,
    documentForm: string,
    urgency: string,
    documentType: string,
    dateIssued: Date,
    confidentiality: string,
    registrationNo: string,
    toDate: Date,
    signer: string,
    noSaved: string,
    processingDeadline: Date,
    issuingAgency: string,
    fileAttach: string,
    appendixFile: string,
    appendixFormFile: string,
    documentNo: string,
    status: string,
    sender: string
}

export interface DocumentFromEdge {
    cursor: string,
    node: DocumentFrom
}

export interface DocumentFromConnection {
    totalCount: number
    pageInfo: PageInfo
    edges: [DocumentFromEdge]
}

export interface DocumentTo {
    id: string,
    excerptFromTheText: string,
    branch: string,
    content: string,
    documentForm: string,
    urgency: string,
    documentType: string,
    dateIssued: Date,
    confidentiality: string,
    registrationNo: string,
    toDate: Date,
    signer: string,
    noSaved: string,
    processingDeadline: Date,
    issuingAgency: string,
    fileAttach: string,
    appendixFile: string,
    appendixFormFile: string,
    documentNo: string,
    status: string,
    sender: string
    unitGetRegistrationNumber: string
}

export interface DocumentToEdge {
    cursor: string,
    node: DocumentTo
}