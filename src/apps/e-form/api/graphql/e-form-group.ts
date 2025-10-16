import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { E_FORM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function eFormGroupById(id: string) {
  return useQuery(
    gql`
        query eFormGroup($id: String!) {
          eFormGroup(id: $id) {
            id
            name
            parentId
            description
            orderNumber
          }
        }
        `,
    { id },
    { clientId: E_FORM_CLIENT_ID }
  );
}

function allEFormGroups() {
  return useQuery(
    gql`
        query eFormGroups {
          eFormGroups {
            id
            name
            parentId
            description
            orderNumber
          }
        }
        `,
    {},
    {
      clientId: E_FORM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function createEFormGroup() {
  return useMutation(
    gql`
        mutation createEFormGroup($payload: EFormGroupInput!) {
          createEFormGroup(payload: $payload) {
            id
            name
            parentId
            description
            orderNumber
          }
        }
    `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function updateEFormGroup() {
  return useMutation(
    gql`
        mutation updateEFormGroup($id: String!, $payload: EFormGroupInput!) {
          updateEFormGroup(id: $id, payload: $payload) {
            id
            name
            parentId
            description
            orderNumber
          }
        }
        `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function deleteEFormGroup() {
  return useMutation(
    gql`
        mutation deleteEFormGroup($id: String!) {
         deleteEFormGroup(id: $id)
        }
        `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

export {
  allEFormGroups,
  createEFormGroup,
  deleteEFormGroup,
  eFormGroupById,
  updateEFormGroup
};