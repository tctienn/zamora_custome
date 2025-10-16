import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchCategory() {
  return useLazyQuery(
    gql`
        query searchCategory(
            $userDeptRole: UserDeptRole!
            $type: CategoryType!
            $keyword: String
            $pageable: Pageable
        ) {
            searchCategory(userDeptRole: $userDeptRole, type: $type, keyword: $keyword, pageable: $pageable)
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getCategory(type: string, code: string) {
  return useQuery(
    gql`
        query getCategory($type: CategoryType!, $code: String!) {
            getCategory(type: $type, code: $code)
        }
    `,
    {
      type,
      code,
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllCategory(userDeptRole: UserDeptRoleInput, type: string) {
  return useQuery(
    gql`
        query getAllCategory($userDeptRole: UserDeptRole!, $type: CategoryType!) {
            getAllCategory(userDeptRole: $userDeptRole,type: $type)
        }
    `,
    {
      userDeptRole,
      type
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllByReasonType(reasonType: string) {
  return useQuery(
    gql`
      query getAllByReasonType($reasonType: ReasonType){
          getAllByReasonType(reasonType : $reasonType)
      }
    `,
    { reasonType },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function createCategory() {
  return useMutation(
    gql`
        mutation createCategory($userDeptRole: UserDeptRole!, $type: CategoryType!, $payload: JSON) {
            createCategory(userDeptRole: $userDeptRole,type: $type, payload: $payload)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function updateCategory() {
  return useMutation(
    gql`
        mutation updateCategory(
            $userDeptRole: UserDeptRole!
            $type: CategoryType!
            $code: String!
            $payload: JSON
        ) {
            updateCategory(userDeptRole: $userDeptRole,type: $type, code: $code, payload: $payload)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getMaxOrderNumber(type: string) {
  return useQuery(
    gql`
        query getMaxOrderNumber($type: CategoryType!) {
            getMaxOrderNumber(type: $type)
        }
    `,
    { type },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteCategory() {
  return useMutation(
    gql`
        mutation deleteCategory($userDeptRole: UserDeptRole!, $type: CategoryType!, $code: String!) {
            deleteCategory(userDeptRole: $userDeptRole,type: $type, code: $code)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  createCategory,
  deleteCategory,
  getAllByReasonType,
  getAllCategory,
  getCategory,
  getMaxOrderNumber,
  searchCategory,
  updateCategory
};
