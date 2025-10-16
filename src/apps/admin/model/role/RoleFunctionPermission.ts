export interface Role {
  code: string,
  name: string,
  description?: string,
  status: string,
  apps: WebMobileApps,
}

export interface AppPermission {
  app: string;
  modules: ModulePermission[];
}

export interface WebMobileApps {
  web: [AppPermission];
  mobile: [AppPermission];
}

export interface ModulePermission {
  module: string;
  functions: FunctionPermission[];
}

export interface FunctionPermission {
  function: string;
  actions: string[];
}

export enum functionType {
  WEB = 'WEB',
  MOBILE = 'MOBILE'
}