export type DataSourceType = 'static' | 'catalog'

export type StaticDataSource = {
  dataType: 'static';
  options: {
    label: string;
    value: string;
  }[];
};

export type CatalogDataSource = {
  dataType: 'catalog';
  group: string;
  filters?: MongoFilterCondition[];
}

export type MongoFilterCondition = {
  field: string;
  operator: '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$nin' | '$exists';
  value: any;
};

export type DataSourceConfig = StaticDataSource | CatalogDataSource;