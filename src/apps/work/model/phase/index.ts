export type SearchPhase = {
  projectId?: string
  from?: Date | string
  to?: Date | string
}

export interface ProjectPhase {
  id?: string
  projectId: string
  name: string
  fromDate: Date
  toDate: Date
  description: string
}