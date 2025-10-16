export interface ILocationPoint {
  id: string;
  name: string;
}

export interface LocationPointEdge {
  cursor: string;
  node: ILocationPoint | null;
}
