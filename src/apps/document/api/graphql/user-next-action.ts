import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { SkipChooseUserModel, UserSelectNextActionModel } from '@/apps/document/model/userNextAction';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getListUserSelectNext(model: UserSelectNextActionModel, userDeptRole:UserDeptRoleInput) {
  return useLazyQuery(
    gql`
        query getListUserSelectNext($model: UserSelectNextActionModel,$userDeptRole:UserDeptRole) {
            getListUserSelectNext(model:$model, userDeptRole:$userDeptRole){
                node {
                    id
                    data
                    type
                }
                edge {
                    id
                    data
                }
                usersSelectNext {
                    userId
                    userName
                    roleId
                    roleName
                    deptId
                    deptName
                    email
                    avatar
                    positionName
                    isClericalCharged
                }
            }
        }
    `, {
      model: model,
      userDeptRole: userDeptRole 
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function canSkipChooseUser(model?: SkipChooseUserModel) {
  return useLazyQuery(
    gql`
          query canSkipChooseUser($model: SkipChooseUserModel) {
              canSkipChooseUser(model:$model)
          }
      `, { model: model },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { canSkipChooseUser, getListUserSelectNext };