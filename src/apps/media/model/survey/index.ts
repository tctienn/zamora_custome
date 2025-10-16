export type QuickSurvey = {
  id: string
  code: string
  createdDate: Date
  questionContent: string
  deadlineReply: string
  hideRespondent: boolean
  highlight: boolean
  isMultiSelect: boolean
  optionIds: string[]
  participants: string[]
  status: string
}