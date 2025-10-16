export interface DocTemplateInterface {
  id: string | undefined;
  deptId: string;
  signal: string;
  docTemplateName: string;
  description: string;
  docTemplateType: DocTemplateType;
  status: boolean;
}

export class DocTemplate implements DocTemplateInterface {
  id: string | undefined;

  deptId: string;

  signal: string;

  docTemplateName: string;

  description: string;

  docTemplateType: DocTemplateType;

  status: boolean;

  constructor() {
    this.id = undefined;
    this.deptId = '';
    this.signal = '';
    this.docTemplateName = '';
    this.description = '';
    this.docTemplateType = DocTemplateType.DOC;
    this.status = true;
  }
}

export interface DocTemplateEdge {
  cursor: string;
  node: DocTemplateInterface | null;
}

export enum DocTemplateType {
  DOC = 'DOC',
  CONTRACT = 'CONTRACT',
}
