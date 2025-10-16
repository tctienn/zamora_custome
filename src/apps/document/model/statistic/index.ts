export type DocStatistic = {
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
};

export type DeptReportStatistic = {
  name: string;
  position: string;
  total: number;
  processed: number;
  processing: number;
  processedOnTime: number;
  processedLate: number;
  processingOnTime: number;
  processingCloseToDeadline: number;
  processingLate: number;
};
