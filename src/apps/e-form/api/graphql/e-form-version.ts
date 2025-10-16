import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { E_FORM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function createEFormVersion() {
  return useMutation(
    gql`
      mutation createEFormVersion($eFormCode: String!) {
        createEFormVersion(eFormCode: $eFormCode) {
          id
        }
      }
    `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function cloneEFormVersion() {
  return useMutation(
    gql`
        mutation cloneEFormVersion($id: String!) {
          cloneEFormVersion(id: $id) {
            id
          }
        }
        `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function eFormVersionInfo(id: string) {
  return useQuery(
    gql`
      query eFormVersionInfo($id: String!) {
        eFormVersionInfo(id: $id) {
          id
          eFormCode
          eFormName
          name
          status
        }
      }
    `,
    { id },
    { clientId: E_FORM_CLIENT_ID }
  );
}

function getEFormVersionConfig(id: string) {
  return useQuery(
    gql`
      query getEFormVersionConfig($id: String!) {
        getEFormVersionConfig(id: $id)        
      }
    `,
    { id },
    {
      clientId: E_FORM_CLIENT_ID,
      fetchPolicy: 'network-only'
    },
  );
}

function saveEFormVersionConfig() {
  return useMutation(
    gql`
      mutation saveEFormVersionConfig($id: String!, $config: JSON!) {
        saveEFormVersionConfig(id: $id, config: $config)
      }
    `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function publishVersion() {
  return useMutation(
    gql`
      mutation publishVersion($id: String!) {
        publishVersion(id: $id) {
          id
        }
      }
      `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function activateVersion() {
  return useMutation(
    gql`
      mutation activateVersion($id: String!) {
        activateVersion(id: $id) {
          id
        }
      }
      `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function deleteEFormVersionById() {
  return useMutation(
    gql`
      mutation deleteEFormVersionById($id: String!){
        deleteEFormVersionById(id: $id)
      }
    `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

function deleteEForm() {
  return useMutation(
    gql`
      mutation deleteEForm($code: String!){
        deleteEForm(code: $code)
      }
    `,
    { clientId: E_FORM_CLIENT_ID }
  );
}

export {
  activateVersion,
  cloneEFormVersion,
  createEFormVersion,
  deleteEForm,
  deleteEFormVersionById,
  eFormVersionInfo,
  getEFormVersionConfig,
  publishVersion,
  saveEFormVersionConfig
};