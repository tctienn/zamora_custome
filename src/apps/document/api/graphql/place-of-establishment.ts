import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchPlaceOfEstablishment(data: {
  keyword: string;
  pageable: object;
}) {
  return useQuery(
    gql`
      query ($keyword: String, $pageable: Pageable) {
        searchPlaceOfEstablishment(keyword: $keyword, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              name
              code
              status
              isDefault
            }
          }
        }
      }
    `,
    { ...data },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getPlaceOfEstablishmentById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getPlaceOfEstablishmentById(id: $id) {
          id
          name
          code
          status
          isDefault
        }
      }
    `,
    { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllPlaceOfEstablishment() {
  return useQuery(
    gql`
      query getAllPlaceOfEstablishment {
        getAllPlaceOfEstablishment {
          id
          name
          code
          status
          isDefault
        }
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function savePlaceOfEstablishment() {
  return useMutation(
    gql`
      mutation savePlaceOfEstablishment(
        $placeOfEstablishment: PlaceOfEstablishmentModel
      ) {
        savePlaceOfEstablishment(placeOfEstablishment: $placeOfEstablishment) {
          id
          name
          code
          status
          isDefault
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deletePlaceOfEstablishment() {
  return useMutation(
    gql`
      mutation deletePlaceOfEstablishment($id: String) {
        deletePlaceOfEstablishment(id: $id) {
          id
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deletePlaceOfEstablishment,
  getAllPlaceOfEstablishment,
  getPlaceOfEstablishmentById,
  savePlaceOfEstablishment,
  searchPlaceOfEstablishment,
};
