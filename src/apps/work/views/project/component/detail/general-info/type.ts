export type ProjectStatistic = {
  participant: ParticipantStatistic[]
}
export type ParticipantStatistic = {
  participantId: string,
  taskCount: number,
  taskStatusCount: {
    completed: number,
    working: number,
    other: number,
  }
}
export type SummaryTaskProject = {
  completed: TaskTimeCount,
  onGoing: TaskTimeCount,
  other: number,
  totalTask: number
  overdue: number
}

type TaskTimeCount = {
  total: number
  beforeTime: number
  onTime: number
  overTime: number
}
