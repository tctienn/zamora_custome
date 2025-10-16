export enum ProjectComponent {
  TYPE = 'TYPE',
  GROUP = 'GROUP',
}

export interface Edge {
  cursor: string;
  node: ProjectTypeGroupInterface;
}

export interface ProjectTypeGroupInterface {
  id: string;
  name: string;
  order: number;
  status: string;
}

export interface ReportProjectModel {
  keyword?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}
