import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID, MEDIA_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchHonor(data: { keyword?: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable) {
            searchHonor(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges{
                    node {
                        id
                        title
                        type
                        isHighlight
                        allowsDroppingExpressions
                        createdTime
                        createdBy
                        status
                        allowsComment
                        honorViewed {
                            userId
                            createdAt
                        }
                    }
                }
            }
        }
    `, { ...data }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getHonorById(id: string) {
  return useQuery(
    gql`
        query getHonorById($id: String!) {
            getHonorById(id: $id) {
                id
                title
                type
                users
                organizations
                description
                norder
                isHighlight
                allowsDroppingExpressions
                allowsComment
                createdDate
                status
                style
                createdBy
            }
        }
    `, { id }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getListHonorGroupByYear() {
  return useQuery(
    gql`
        query getListHonorGroupByYear {
            getListHonorGroupByYear {
                honorsByYear {
                    year
                    honors {
                        id
                        title
                        users
                        type
                        organizations
                        isHighlight
                        createdDate
                        style
                        createdDate
                        honorViewed {
                            userId
                            createdAt
                        }
                    }
                }
            }
        }
    `, {}, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getListHonorByIsHighlight() {
  return useQuery(
    gql`
        query getListHonorByIsHighlight {
            getListHonorByIsHighlight {
                honorsByYear {
                    year
                    honors {
                        id
                        title
                        users
                        type
                        organizations
                        isHighlight
                        createdDate
                        style
                        createdDate
                        honorViewed {
                            userId
                            createdAt
                        }
                    }
                }
            }
        }
    `, {}, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function maxNOrderHonor() {
  return useQuery(
    gql`
        query maxOrderActiveHonor {
            maxOrderActiveHonor
        }
    `, {}, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteHonor() {
  return useMutation(
    gql`
        mutation ($id: String!) {
            deleteHonor(id: $id) {
                id
            }
        }`, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getUsersInOrganizationByCode(code: string) {
  return useQuery(
    gql`
        query getUsersInOrganizationByCode($code: String) {
            getUsersInOrganizationByCode(code: $code) {
                code
                name
                users {
                    id
                }
            }
        }`, { code }, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    });
}

export { deleteHonor, getHonorById, getListHonorByIsHighlight, getListHonorGroupByYear, getUsersInOrganizationByCode, maxNOrderHonor, searchHonor };