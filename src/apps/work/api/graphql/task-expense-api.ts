import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveExpenseGraphql() {
  return useMutation(
    gql`
        mutation saveExpense($taskExpense: TaskExpenseInput, $attachments: [Upload]){
            saveExpense(taskExpense: $taskExpense, attachments: $attachments){
                id,
                taskId,
                code,
                type,
                expenseCategory,
                totalMoney,
                moneyType,
                expenseTime,
                description,
                payerId,
                payerName,
                receiverId,
                receiverName,
            }
        }
    `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findAllTaskExpenseByTaskIdGraphql(taskId: string) {
  return useQuery(
    gql`
        query ($taskId: String!){
            findAllTaskExpenseByTaskId(taskId: $taskId){
                id,
                taskId,
                code,
                type,
                expenseCategory,
                totalMoney,
                moneyType,
                expenseTime,
                description,
                payerId,
                payerName,
                receiverId,
                receiverName,
                lastModifiedBy
                expenseAttachments {
                    id
                    name
                    extension
                    path
                    size
                    taskId
                    orderNo
                    objectType
                    objectId
                }
            }
        }
    `, { taskId }, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteExpenseGraphql() {
  return useMutation(
    gql`
        mutation ($id: String!, $taskId:String!){
            deleteExpense(id: $id, taskId: $taskId)
        }
    `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteExpenseGraphql, findAllTaskExpenseByTaskIdGraphql, saveExpenseGraphql };