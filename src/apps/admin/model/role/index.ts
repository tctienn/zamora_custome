export interface RoleInterface {
    code: string,
    name: string,
    description: string,
    status: string
}

export class Role implements RoleInterface {
  code: string;

  name: string;

  description: string;

  status: string;

  constructor() {
    this.code = '';
    this.name = '';
    this.description = '';
    this.status = '';
  }
}