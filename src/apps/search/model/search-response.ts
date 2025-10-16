export type SearchResponse = {
  source?: SearchSource;
  highlight?: { [key: string]: string[] };
}

export type SearchSource = {
  id?: string;
  name?: string;
  type?: string;
  module?: string;
  [key: string]: any;
}