export interface Category {
  id: string,
  app: string,
  name: string,
  description: string,
  status: string,
  children: Category[]
}