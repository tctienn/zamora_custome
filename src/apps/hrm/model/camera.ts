export type Place = {
  id?: string
  name?: string
  address?: string
}

export type CameraDevice = {
  id?: string
  name?: string
  placeId?: string
  placeName?: string
  useForCheckin?: boolean
}

export type CameraPersonEdge = {
  node: CameraPerson
  cursor: string
}

export type CameraPerson = {
  id: string
  name: string
  employeeId: string
  aliasId: string
  title: string
  avatar: string
}