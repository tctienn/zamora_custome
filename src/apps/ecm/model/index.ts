export interface StorageFilterOption {
  value: string,
  label: string,
  icon: string
}

export interface StorageFilters {
  filterFileTypes: string[],
  filterLastModified: string[]
}