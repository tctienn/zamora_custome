export type FileDigitized = {
  fileName: string
  size: number
  extension: string
  createdDate: string
  createdBy: string
  type: string
  path: string
}

export type SearchDigitizedFilePayload = {
  keyword: string | null,
  employeeIds: string[] | null
  fileType: string | null
  timeType: string | null
}

export type FileAccessSummary = {
  totalPdf: number | null;
  totalWord: number | null;
  totalExcel: number | null;
  totalImage: number | null;
  totalOther: number;
  size: number;
};

export type FileAccessSummaryByEmployee = {
  userId: string
  viewed: boolean
  downloaded: boolean
  recentTimes: string | number | null
}