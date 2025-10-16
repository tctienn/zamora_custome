import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getCategoryGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String!, $pageable: Pageable) {
            categories(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        code
                        name
                        description
                        groupCode
                        groupName
                        isGlobal
                        order
                        status
                        isDefault
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

function getCategoryByCodeGraphql() {
  return useLazyQuery(
    gql`
        query ($code: String!) {
            category(code: $code) {
                code
                name
                description
                groupCode
                order
                status
            }
        }
    `, {}, { clientId: ADMIN_CLIENT_ID }
  );
}

function getCategoriesByGroupGraphql() {
  return useLazyQuery(
    gql`
        query ($groupCode: String!) {
            groupCategories(groupCode: $groupCode) {
                code
                name
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

function createCategoryGraphql() {
  return useMutation(
    gql`
        mutation ($categoryInput: CategoryInput!) {
            createCategory(categoryInput: $categoryInput) {
                code
                name
                description
                groupCode
                order
                status
            }
        }
    `, { clientId: ADMIN_CLIENT_ID });
}

function updateCategoryGraphql() {
  return useMutation(
    gql`
        mutation ($categoryInput: CategoryInput!) {
            updateCategory(categoryInput: $categoryInput) {
                code
                name
                description
                groupCode
                order
                status
            }
        }
    `, { clientId: ADMIN_CLIENT_ID });
}

function deleteCategoryGraphql() {
  return useMutation(
    gql`
        mutation ($code: String!) {
            deleteCategory(code: $code) {
                code
                name
                description
                groupCode
                order
                status
            }
        }
    `, { clientId: ADMIN_CLIENT_ID });
}

function getPacketCategoriesGraphql() {
  return useQuery(
    gql`
        query {
            packetCategories {
                priceTypes {
                    code
                    name
                }
                units {
                    code
                    name
                }
                types {
                    code
                    name
                }
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

function getServiceCategoriesGraphql() {
  return useLazyQuery(
    gql`
        query {
            serviceCategories {
                types {
                    code
                    name
                }
                units {
                    code
                    name
                }
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

function getAllCategoriesByGroupGraphql() {
  return useLazyQuery(
    gql`
            query ($groupCode: String!, $pageable: Pageable) {
                allGroupCategories(groupCode: $groupCode, pageable: $pageable) {
                      code
                      name
                      description
                      groupCode
                      isDefault
                      order
                      status
                      groupName
                      isGlobal
                }
            }
        `,
    {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'cache-and-network'
    }
  );
}

function getCategoryByIdGraphql() {
  return useLazyQuery(
    gql`
        query findById($id : String!){
            findCategoryById(id : $id) {
                code
                name
                description
                groupCode
                order
                status
            }
        }
    `,
    {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'cache-and-network'
    }
  );
}

function getCategoryByGroup(groupCode: string) {
  return useQuery(
    gql`
        query ($groupCode: String!) {
            getCategoryByGroup(groupCode: $groupCode) {
                code
                name
            }
        }
    `,
    { groupCode },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getCategoryByGroupCodePublicGraphql(groupCode: string) {
  return useQuery(
    gql`
        query ($groupCode: String!) {
            getCategoryByGroupCodePublic(groupCode: $groupCode) {
                code
                name
            }
        }
    `,
    { groupCode },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllCategoryByListGroupCodePublicGraphql(groupCode: string[]) {
  return useQuery(
    gql`
        query ($groupCode: [String]!) {
            getAllCategoryByListGroupCodePublic(groupCode: $groupCode) {
                code
                name
                groupCode
            }
        }
    `,
    { groupCode },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchCategoryByAppGraphql(data: { app: string, keyword: string, pageable: object }) {
  return useQuery(
    gql`
            query searchCategoryByApp($keyword: String, $app: String, $pageable: Pageable){
                searchCategoryByApp(keyword: $keyword, app: $app, pageable: $pageable){
                    edges{
                        node{
                            code
                            description
                            groupCode
                            groupName
                            isDefault
                            isGlobal
                            name
                            order
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

function getAllChildCategoryByCategoryGroup() {
  return useLazyQuery(
    gql`
            query getAllChildCategoryByCategoryGroup($groupCode: String!){
                getAllChildCategoryByCategoryGroup(groupCode:$groupCode){
                    code
                    name
                    description
                    groupCode
                    order
                    status
                }
            }
        `,
    {},
    {
      fetchPolicy: 'network-only',
      clientId: ADMIN_CLIENT_ID
    }
  );
}

export {
  createCategoryGraphql,
  deleteCategoryGraphql,
  getAllCategoriesByGroupGraphql,
  getAllCategoryByListGroupCodePublicGraphql,
  getAllChildCategoryByCategoryGroup,
  getCategoriesByGroupGraphql,
  getCategoryByCodeGraphql,
  getCategoryByGroup,
  getCategoryByGroupCodePublicGraphql,
  getCategoryByIdGraphql,
  getCategoryGraphql,
  getPacketCategoriesGraphql,
  getServiceCategoriesGraphql,
  searchCategoryByAppGraphql,
  updateCategoryGraphql
};
