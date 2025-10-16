export interface BlankFileType {
    type: string,
    extension: string
    openEditAfterCreate?: boolean
}

export type Attachment = {
  id?: string,
  name: string,
  data?: string,
  path?: string,
  size: number,
  extension?: string,
  isNew?: boolean,
  objectId?: string
}

export class InformationDialogProperties {
  type?: string;

  title?: string;

  message?: string;

  show?: boolean;
}

export type Widget = {
  code: string,
  app: string,
  recordNumber?: number
}

export type UserWidget = {
  userId: string,
  mainWidgets: Array<WidgetInstance>,
  sidebarWidgets: Array<WidgetInstance>
}

export type WidgetInstance = {
  code: string,
  order: number,
  recordNumber?: number
}

export type DashboardWidgetSubHeader = {
  key: string,
  label: string,
  count: number,
  action: () => void
}

export type SplitLinkContent = {
  isLink: boolean,
  text: string,
  href?: string
}

export type ChatConversation = {
  id: string,
  name: string
  creatorId: string,
  adminIds: string[],
  avatar?: string,
  isGroup: boolean,
  members: string[],
  lastMessage?: {
    sentAt: string
  },
  totalAttachment: number
}
