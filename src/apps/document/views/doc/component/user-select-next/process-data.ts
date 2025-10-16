import type { DocumentAttachment } from '@/apps/document/model/attachment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { ProcessType } from '@/apps/document/model/process/incoming';
import type { ProcessInput } from '@/apps/document/model/process/process';
import type { EdgeInputInterface, NodeInputInterface } from '@/apps/work-flow/model/flow';

export type ChosenUserDeptRole = (UserDeptRoleInput & {
  id: string,
  action: 'main' | 'cooperative' | 'receiveToKnow' | undefined
})
export type DataNode = {
  node: NodeInputInterface,
  edge: EdgeInputInterface,
  processes: ProcessInput[],

}
export type DataNextAction = {
  dataNodeMap: Record<string, DataNode>
  note?: string,
  deadlineNumber?: number,
  deadline?: Date,
  attachments: DocumentAttachment[],
  fileList?: FileList
}
export type SelectionMode = 'tree' | 'suggestions'

const mapAction = {
  main: ProcessType.XL_CHINH,
  cooperative: ProcessType.PHOI_HOP,
  receiveToKnow: ProcessType.DE_BIET,
};

export function transformChosenUserDeptRole(chosenUserDeptRole: ChosenUserDeptRole[]) {
  const rs: ProcessInput[] = [];
  for (const userDeptRole of chosenUserDeptRole) {
    const temp: ProcessInput = {} as ProcessInput;
    temp.receiverId = userDeptRole.userId;
    temp.receiverName = userDeptRole.userName;
    temp.receiverDeptId = userDeptRole.deptId;
    temp.receiverDeptName = userDeptRole.deptName;
    temp.receiverRoleId = userDeptRole.roleId;
    temp.receiverRoleName = userDeptRole.roleName;
    if (userDeptRole.action) {
      temp.processType = mapAction[userDeptRole.action];
    }
    rs.push(temp);
  }
  return rs;
}

type OrgTags = {
  id: string,
  tags?: string[]
}

//Sort inplace orgTags
export function sortOrgByTags<T extends OrgTags>(orgTags: T[], tags: string[]): T[] {
  return [...orgTags].sort((a, b) => {
    const relevanceA = a?.tags?.filter(tag => tags.includes(tag)).length ?? 0;
    const relevanceB = b?.tags?.filter(tag => tags.includes(tag)).length ?? 0;
    return relevanceB - relevanceA; // Sắp xếp giảm dần
  });
}
