import type { EmailTemplateType } from '@/apps/admin/model/email-template';
import { STATUSES } from '@/common/constants';

export interface EmailConfigurationInterface {
    id: string,
    name: string,
    server: string,
    protocol: EmailServerProtocol | null,
    port: number,
    account: string,
    password: string,
    description: string,
    status: string,

    templateTypes: EmailTemplateType[]
}

export class EmailConfiguration implements EmailConfigurationInterface {
  account: string;

  description: string;

  id: string;

  name: string;

  password: string;

  port: number;

  protocol: EmailServerProtocol | null;

  server: string;

  status: string;

  templateTypes: EmailTemplateType[];

  constructor() {
    this.id = '';
    this.account = '';
    this.name = '';
    this.password = '';
    this.port = 0;
    this.server = '';
    this.protocol = null;
    this.description = '';
    this.status = STATUSES.ACTIVE;
    this.templateTypes = [];
  }

}

export interface EmailConfigurationEdge {
    cursor: string
    node: EmailConfigurationInterface | null
}

export enum EmailServerProtocol {
    WEB_MAIL,
    SMTP,
    IMAP,
    POP3,
}