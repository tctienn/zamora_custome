export interface EmailTemplateInterface {
    id: string,
    subject: string,
    content: string,
    isDefault: boolean,
    status: string,
    templateType: string
}

export class EmailTemplate implements EmailTemplateInterface {
  content: string;

  id: string;

  isDefault: boolean;

  status: string;

  subject: string;

  templateType: string;

  constructor() {
    this.content = '';
    this.id = '';
    this.isDefault = false;
    this.status = '';
    this.subject = '';
    this.templateType = '';
  }
}

export interface EmailTemplateEdge {
    cursor: string
    node: EmailTemplateInterface | null
}

export interface EmailTemplateParam {
    type: string,
    params: string[]
}

export enum EmailTemplateType {
    RESET_PASSWORD,
    FORGOT_PASSWORD,
    CREATE_ACCOUNT,
    CONTRACT_EXPIRATION,
}