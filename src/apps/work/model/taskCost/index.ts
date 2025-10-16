import type { Attachment } from '@/common/model';

export type TaskExpense = {
  id?: string,
  taskId: string,
  code: string,
  type: ExpenseType,
  expenseCategory: string | null,
  totalMoney: number,
  moneyType: MoneyType,
  expenseTime: Date,
  description: string | null,
  payerId: string | null,
  payerName: string | null,
  receiverId: string | null,
  receiverName: string | null,
  lastModifiedBy: string | null,
  attachments?: Attachment[]
  oldAttachmentIds?: string[]
}

export enum ExpenseType {
  RECEIPT, PAYMENT
}

export enum MoneyType {
  CASH = 'CASH', TRANSFER = 'TRANSFER', CREDIT = 'CREDIT', OTHER = 'OTHER'
}