export interface WorkingTime {
  id: string,
  shiftType: string,
  shiftName: string,
  start: Date,
  end: Date,
  labour: number
}

export interface WorkSchedule {
  idMonday: string,
  mondayStatus: string,
  mondayLabour: number,

  idTuesday: string,
  tuesdayStatus: string,
  tuesdayLabour: number,

  idWednesday: string,
  wednesdayStatus: string,
  wednesdayLabour: number,

  idThursday: string,
  thursdayStatus: string,
  thursdayLabour: number,

  idFriday: string,
  fridayStatus: string,
  fridayLabour: number,

  idSaturday: string,
  saturdayStatus: string,
  saturdayLabour: number,

  idSunday: string,
  sundayStatus: string,
  sundayLabour: number,
}