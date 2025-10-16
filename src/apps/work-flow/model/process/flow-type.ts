import type { Outcome } from '@/apps/work-flow/model/flow';

export type FlowType = {
  type: string
  name: string
  statuses: string[]
  endpoint: Endpoint
  actions: Outcome[]
  optionActions: Outcome[]
  app: string
}

export type ObjectInfo = {
  id: string
  name: string
  [key: string]: any
}

export type Endpoint = {
  fieldToDisplay?: string
  otherUrls: string[]
  changeStatusUrl: string[]
}
