export type SendTaskDeadlineExtensionEvent = {
  reason?: string,
  newDeadline?: Date,
  attachments?: File[],

}