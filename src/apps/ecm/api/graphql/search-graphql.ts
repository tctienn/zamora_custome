import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

const fileFields = [
  'id',
  'name',
  'treePath',
  'personal',
  'size',
  'extension',
];
const folderFields = [
  'id',
  'name',
  'treePath',
  'personal',
];
const returnedFields = `files { ${ fileFields.join(' ') } } folders { ${ folderFields.join(' ') } }`;

function searchPersonalByNameGraphql(keyword: string) {
  return useQuery(
    gql`
            query ($keyword: String!) {
                searchPersonalByName(keyword: $keyword) {
                    ${ returnedFields }
                }
            }
        `,
    { keyword }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchGroupByNameGraphql(keyword: string) {
  return useQuery(
    gql`
            query ($keyword: String!) {
                searchGroupByName(keyword: $keyword) {
                    ${ returnedFields }
                }
            }
        `,
    { keyword }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchSharedByNameGraphql(keyword: string) {
  return useQuery(
    gql`
            query ($keyword: String!) {
                searchSharedByName(keyword: $keyword) {
                    ${ returnedFields }
                }
            }
        `,
    { keyword }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchPersonalByContentGraphql(keyword: string) {
  return useQuery(
    gql`
            query ($keyword: String!) {
                searchPersonalByContent(keyword: $keyword) {
                    ${ fileFields.join(' ') }
                }
            }
        `,
    { keyword }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchGroupByContentGraphql(keyword: string) {
  return useQuery(
    gql`
            query ($keyword: String!) {
                searchGroupByContent(keyword: $keyword) {
                    ${ fileFields.join(' ') }
                }
            }
        `,
    { keyword }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchSharedByContentGraphql(keyword: string) {
  return useQuery(
    gql`
            query ($keyword: String!) {
                searchSharedByContent(keyword: $keyword) {
                    ${ fileFields.join(' ') }
                }
            }
        `,
    { keyword }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchGroupByKeyword(keyword: string) {
  return useQuery(
    gql`
            query searchGroupByKeyword($keyword: String){
                searchGroupByKeyword(keyword: $keyword){
                    id
                    name
                    groupType
                    description
                    avatar
                    users{
                        fullName
                    }
                }
            }
        `,
    { keyword }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  searchGroupByContentGraphql,
  searchGroupByKeyword,
  searchGroupByNameGraphql,
  searchPersonalByContentGraphql,
  searchPersonalByNameGraphql,
  searchSharedByContentGraphql,
  searchSharedByNameGraphql
};
