import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

const fullField = `
        id
        code
        field
        objectTraining
        duration
        trainingLevel
        expense
        trainingUnit
        trainingPlace
        trainingAddress
        implementingUnit
        departmentProposed
        diploma
        target
        note
        proposeName
        isOnline
        isOffline
        fromDate
        toDate
        numbStudent
        status
        proposeType
        createdTime
        createdBy
        lastModifiedTime
        lastModifiedBy
        takeCharge{
            id
            proposeId
            userId
            userName
            participantType
        }
        follow{
            id
            proposeId
            userId
            userName
            participantType
        }
        schedule{
            id
            proposeId
            trainingContent
            scope
            teacher
            telephoneNumber
            startTime
            endTime
        }
        file{
            id
            objectId
            name
            extension
            path
            size
            type
        }
`;

function searchPropose() {
  return useLazyQuery(
    gql`
      query searchPropose($keyword: String, $proposeType: ProposeType){
          searchPropose(keyword: $keyword, proposeType: $proposeType){
            ${fullField}
          }
      }
      `,
    {},
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function findProposeById(id: string) {
  return useQuery(
    gql`
      query findProposeById($id: String){
          findProposeById(id: $id){
            ${fullField}
          }
      }
      `,
    { id },
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function deletePropose() {
  return useMutation(
    gql`
      mutation deletePropose($id: String){
          deletePropose(id: $id)
      }
      `,
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

export { deletePropose, findProposeById, searchPropose };