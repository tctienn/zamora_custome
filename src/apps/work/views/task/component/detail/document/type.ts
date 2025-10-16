export type Attachment = {
  fileName: string,
  fullName: string,
  filePath: string,
  fileExtension: string,
  size: number,
  id: string
}

export type DocAttachment = {
  id: string,
  quote: string,
  docCode: string,
  docType: 'DOC_IN' | 'DOC_OUT',
  docDate: string,
  attachment: Attachment,
  attachmentId: string,
}