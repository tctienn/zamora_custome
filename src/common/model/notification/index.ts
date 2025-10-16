export interface Notification {
  id: string,
  userId: string,
  title: string,
  content: string,
  time: string,
  module: string,
  function: string,
  read: boolean,
  new: boolean
  fromUserId: string
}

export interface NotificationEdge {
  cursor: string
  node: Notification | null
}
