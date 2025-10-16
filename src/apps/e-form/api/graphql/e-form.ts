import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { E_FORM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function createEForm() {
  return useMutation(
    gql`
      mutation createEForm($payload: EFormInput!) {
        createEForm(payload: $payload) {
          code
          name
          description
          orderNumber
          groupId
          isActive
        }
      }
    `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function updateEForm() {
  return useMutation(
    gql`
      mutation updateEForm($payload: EFormInput!) {
        updateEForm(payload: $payload) {
            code
            name
            description
            orderNumber
            groupId
            isActive
        }
      }
        `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function eFormsByGroupId(groupId: string | undefined) {
  return useQuery(
    gql`
        query eFormsByGroupId($groupId: String) {
            eFormsByGroupId(groupId: $groupId) {
              code
              name
              description
              orderNumber
              groupId
              isActive
              
              versions {
                id
                eFormCode
                name
                status
              }
            }
        }
        `,
    { groupId },
    {
      clientId: E_FORM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function eForm(code: string | undefined) {
  return useQuery(
    gql`
        query eForm($code: String!) {
            eForm(code: $code) {
              code
              name
              description
              orderNumber
              groupId
              isActive
              
              versions {
                id
                eFormCode
                name
                status
              }
            }
        }
        `,
    { code },
    {
      clientId: E_FORM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function eFormFullTree() {
  return useQuery(
    gql`
      query eFormFullTree {
        eFormFullTree 
      }
    `,
    {},
    {
      clientId: E_FORM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getEFormConfig() {
  return useLazyQuery(
    gql`
        query getEFormConfig($code: String!) {
            getEFormConfig(code: $code)        
        }
        `,
    {},
    {
      clientId: E_FORM_CLIENT_ID,
      fetchPolicy: 'network-only'
    },
  );
}

export {
  createEForm,
  eForm,
  eFormFullTree,
  eFormsByGroupId,
  getEFormConfig,
  updateEForm
};