import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveTaskCommonSetting() {
  return useMutation(
    gql`
            mutation saveTaskCommonSetting($taskCommonSettingInput: TaskCommonSettingInput){
                saveTaskCommonSetting(taskCommonSettingInput: $taskCommonSettingInput){
                    id
                    isActive
                    isDelete
                    orderNo
                    paramCode
                    paramValue
                    tenantId
                    description
                    groupCode
                }
            }
        `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findAllByParamCodes(paramCodes: string[]) {
  return useQuery(
    gql`
            query findAllByParamCodes($paramCodes: [String]){
                findAllByParamCodes(paramCodes: $paramCodes){
                    id
                    isActive
                    isDelete
                    orderNo
                    paramCode
                    paramValue
                    tenantId
                    description
                    groupCode
                }
            }
        `, { paramCodes },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findAllByParamCodes, saveTaskCommonSetting };

