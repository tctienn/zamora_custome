import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getCategoryGroupGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String!, $pageable: Pageable) {
            categoryGroups(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        code
                        name
                        parentName
                        description
                        parentCode
                        order
                        isGlobal
                        status
                        apps
                    }
                }
            }
        }
    `,
    { ...data },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getCategoryGroupByCodeGraphql(code: string) {
  return useQuery(
    gql`
        query ($code: String!) {
            categoryGroup(code: $code) {
                code
                name
                description
                parentCode
                order
                status
            }
        }
    `,
    { code },
    { clientId: ADMIN_CLIENT_ID }
  );
}

function getCategoryGroupsByParentGraphql(parentCode: string) {
  return useQuery(
    gql`
        query ($parentCode: String!) {
            childCategoryGroups(parentCode: $parentCode) {
                code
                name
                description
                parentCode
                order
                status
            }
        }
    `,
    { parentCode },
    { clientId: ADMIN_CLIENT_ID }
  );
}

function getAllCategoryGroupGraphql() {
  return useQuery(
    gql`
        query {
            allCategoryGroup {
                code
                name
                order
                parentCode
                isGlobal
            }
        }
    `,
    {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function createCategoryGroupGraphql() {
  return useMutation(
    gql`
        mutation ($categoryGroupInput: CategoryGroupInput!) {
            createCategoryGroup(categoryGroupInput: $categoryGroupInput) {
                code
                name
                description
                parentCode
                order
                status
            }
        }
    `, { clientId: ADMIN_CLIENT_ID });
}

function updateCategoryGroupGraphql() {
  return useMutation(
    gql`
        mutation ($categoryGroupInput: CategoryGroupInput!) {
            updateCategoryGroup(categoryGroupInput: $categoryGroupInput) {
                code
                name
                description
                parentCode
                order
                status
            }
        }
    `, { clientId: ADMIN_CLIENT_ID });
}

function deleteCategoryGroupGraphql() {
  return useMutation(
    gql`
        mutation ($code: String!) {
            deleteCategoryGroup(code: $code) {
                code
                name
            }
        }
    `, { clientId: ADMIN_CLIENT_ID });
}

function getCategoryGroupByAppGraphql(data: { app: string, keyword: string, pageable: object }) {
  return useQuery(
    gql`
            query searchCategoryGroupByApp($keyword: String, $app: String, $pageable: Pageable){
                searchCategoryGroupByApp(keyword: $keyword, app: $app, pageable: $pageable){
                    edges{
                        node{
                            apps
                            code
                            description
                            isGlobal
                            name
                            order
                            parentCode
                            parentName
                            status
                        }
                    }
                    totalCount
                }
            }
        `,
    { ...data },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllCategoryGroupByAppGraph(app: string) {
  return useQuery(
    gql`
            query getCategoryGroupByApp($app: String){
                getCategoryGroupByApp(app: $app){
                    code
                    name
                    apps
                    description
                    isGlobal
                    order
                    parentCode
                    parentName
                    status
                }
            }
        `,
    { app },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  createCategoryGroupGraphql,
  deleteCategoryGroupGraphql,
  getAllCategoryGroupByAppGraph,
  getAllCategoryGroupGraphql,
  getCategoryGroupByAppGraphql,
  getCategoryGroupByCodeGraphql,
  getCategoryGroupGraphql,
  getCategoryGroupsByParentGraphql,
  updateCategoryGroupGraphql
};
