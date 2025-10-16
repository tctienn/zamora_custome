import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { necessaryTaskModel } from '@/apps/work/api/graphql/task-api';
import { BoardType } from '@/apps/work/model/board';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function boardWithoutTask(type: BoardType) {
  return useQuery(
    gql`
    query boardWithoutTask($type: BoardType!) {
      boardWithoutTask(type: $type) {
        columns {
          id
          title
          order
          color
          type
        }
      }
    }
    `, { type: BoardType[type] },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function changeColumn(boardType: BoardType) {
  return useMutation(
    gql`
    mutation ($type: BoardType!, $taskId: String!, $id: String!) {
      changeColumn(type: $type, taskId: $taskId, id: $id) {
          ${ necessaryTaskModel(boardType) }
      }
    }
    `, { clientId: WORK_CLIENT_ID }
  );
}

export { boardWithoutTask, changeColumn };
