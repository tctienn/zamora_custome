import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchBookNumReserve(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
      query ($keyword: String, $pageable: Pageable) {
        searchBookNumReserve(keyword: $keyword, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              bookType
              bookId
              bookDate
              bookNumber
              bookNumberUsed
              requestUserId
              note
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

function getBookNumReserveById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getBookNumReserveById(id: $id) {
          id
          bookType
          bookId
          bookDate
          bookNumber
          bookNumberUsed
          requestUserId
          note
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

function saveBookNumReserve() {
  return useMutation(
    gql`
      mutation saveBookNumReserve($bookNumReserve: BookNumReserveModel) {
        saveBookNumReserve(bookNumReserve: $bookNumReserve) {
          id
          bookType
          bookId
          bookDate
          bookNumber
          requestUserId
          note
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteBookNumReserve() {
  return useMutation(
    gql`
      mutation deleteBookNumReserve($id: String) {
        deleteBookNumReserve(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findByBookIdAndRequestUserId() {
  return useLazyQuery(
    gql`
          query findByBookIdAndRequestUserId($bookId: String!, $requestUserId: String!) {
          findByBookIdAndRequestUserId(bookId: $bookId,requestUserId: $requestUserId) {
              id
              bookType
              bookDate
              bookId
              requestUserId
              bookNumber
              bookNumberUsed
              note
              bookInfo{
                bookName
              }
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

function getAllNumbReserveByBookId() {
  return useLazyQuery(
    gql`
          query getAllNumbReserveByBookId($bookId: String) {
          getAllNumbReserveByBookId(bookId: $bookId) {
              id
              bookType
              bookDate
              bookId
              requestUserId
              bookNumber
              bookNumberUsed
              note
              bookNumbers
              bookInfo{
                bookName
              }
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

export {
  deleteBookNumReserve,
  findByBookIdAndRequestUserId,
  getAllNumbReserveByBookId,
  getBookNumReserveById,
  saveBookNumReserve,
  searchBookNumReserve
};
