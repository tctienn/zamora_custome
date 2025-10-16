export type Connection<T> = {
  totalCount: number,
  pageInfo: PageInfo,
  edges: Edge<T>[]
}

export type Edge<T> = {
  cursor: string,
  node: T
}

export type PageInfo = {
  startCursor: string,
  endCursor: string,
  hasPreviousPage: boolean,
  hasNextPage: boolean
}