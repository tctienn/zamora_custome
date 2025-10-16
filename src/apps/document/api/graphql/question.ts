import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { OrganizationType } from '@/apps/document/model/organization';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function addQuestion() {
  return useMutation(
    gql`
      mutation addQuestion($questionModel: QuestionModel){
          addQuestion(questionModel: $questionModel){
              id
              label
              docId
              orderNumber
              isYesNoQuestion
          }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAnswersQuestionByDocId(docId: string, userDeptRoleModel: UserDeptRoleInput) {
  return useQuery(
    gql`
      query getAnswersQuestionByDocId($docId: String, $userDeptRoleModel: UserDeptRole){
          getAnswersQuestionByDocId(docId: $docId, userDeptRoleModel: $userDeptRoleModel){
              id
              label
              docId
              orderNumber
              isYesNoQuestion
              answer{
                  id
                  label
                  questionId
                  text
                  otherOpinion
              }
              answers{
                  id
                  label
                  questionId
                  userId
                  userName
                  deptId
                  deptName
                  roleId
                  roleName
                  text
              }
              options{
                  id
                  label
                  questionId
                  orderNumber
                  otherOpinion
                  text
              }
          }
      }
    `, {
      docId,
      userDeptRoleModel
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { addQuestion, getAnswersQuestionByDocId };
