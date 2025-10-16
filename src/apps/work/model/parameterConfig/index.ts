export interface TaskCommonSetting {
  id: string;
  groupCode: string;
  paramCode: string;
  paramValue: boolean;
  description: string;
  orderNo: number;
  tenantId: string;
  isActive: boolean;
  isDelete: boolean;
}

export interface EditableFields {
  descriptionGoal?: boolean;
  addAssignee?: boolean;
  updateDate?: boolean;
}

export interface CodeSettings {
  enabled?: boolean;
  structure: string | null;
  startValue: number | null;
  allowEdit?: boolean;
}

export interface ParameterTask {
  autoChangeStatus?: boolean;
  allowCreatorDelete?: boolean;
  restrictChildTaskView?: boolean;
  restrictFollowerView?: boolean;
  editableFields: EditableFields;
  codeSettings: CodeSettings;
}

export interface ParameterProject {
  autoChangeStatus?: boolean;
  restrictChildTaskView?: boolean;
  restrictFollowerView?: boolean;
  addAssignee?: boolean;
  addFollower?: boolean;
  codeSettings: CodeSettings;
}
