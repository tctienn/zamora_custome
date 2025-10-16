import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getPositionGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable) {
            positions(keyword: $keyword, pageable: $pageable) {
                edges {
                    node {
                        id
                        code
                        name
                        description
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

function getAllPositionGraphql() {
  return useQuery(
    gql`
        query {
            allPosition {
                id
                code
                name
                description
                status
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

function savePositionGraphql() {
  return useMutation(
    gql`
        mutation ($positionInput: PositionInput!) {
            savePosition(positionInput: $positionInput) {
                id
                code
                name
                description
                status
            }
        }
    `, { clientId: ADMIN_CLIENT_ID }
  );
}

function deletePositionGraphql() {
  return useMutation(
    gql`
        mutation ($id: String!){
            deletePosition(id : $id){
                id
                code
                name
                description
                status
            }
        }
    `, { clientId: ADMIN_CLIENT_ID }
  );
}

export {
  deletePositionGraphql,
  getAllPositionGraphql,
  getPositionGraphql,
  savePositionGraphql
};
