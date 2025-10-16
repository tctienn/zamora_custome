import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { OrganizationType } from '@/apps/document/model/organization';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchBook(data: {
    keyword: string;
    pageable: object;
    structureType: OrganizationType;
}) {
  return useQuery(
    gql`
      query (
        $keyword: String
        $pageable: Pageable
        $structureType: OrganizationType
      ) {
        searchBook(
          keyword: $keyword
          pageable: $pageable
          structureType: $structureType
        ) {
          totalCount
          edges {
            node {
              id
              bookType
              bookName
              bookOrder
              isDefault
              prefix
              bookYear
              currentNumber
              deptId
              isAuto
              isGenerateByBook
              isGenerateByDoctype
              structureType
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

function getBookById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getBookById(id: $id) {
          id
          bookType
          bookName
          bookOrder
          isDefault
          prefix
          bookYear
          currentNumber
          deptId
          isAuto
          isGenerateByBook
          isGenerateByDoctype
          structureType
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

function getBookByIdReturnList(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getBookByIdReturnList(id: $id) {
          id
          bookType
          bookName
          bookOrder
          isDefault
          prefix
          bookYear
          currentNumber
          deptId
          isAuto
          isGenerateByBook
          isGenerateByDoctype
          structureType
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

function getAllBook() {
  return useQuery(
    gql`
      query getAllBook {
        getAllBook {
          id
          bookType
          bookName
          bookOrder
          isDefault
          prefix
          bookYear
          currentNumber
          deptId
          isAuto
          isGenerateByBook
          isGenerateByDoctype
          structureType
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

function getAllDocOutBook() {
  return useQuery(
    gql`
      query getAllDocOutBook {
        getAllDocOutBook {
          id
          bookType
          bookName
          bookOrder
          isDefault
          prefix
          bookYear
          currentNumber
          deptId
          isAuto
          isGenerateByBook
          isGenerateByDoctype
          structureType
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

function getAllBookByStructureType(structureType: OrganizationType) {
  return useQuery(
    gql`
      query getAllBookByStructureType($structureType: OrganizationType) {
        getAllBookByStructureType(structureType: $structureType) {
          id
          bookType
          bookName
          bookOrder
          isDefault
          prefix
          bookYear
          currentNumber
          deptId
          isAuto
          isGenerateByBook
          isGenerateByDoctype
          structureType
        }
      }
    `,
    { structureType },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveBook() {
  return useMutation(
    gql`
      mutation saveBook($book: BookInput) {
        saveBook(book: $book) {
          id
          bookType
          bookName
          bookOrder
          isDefault
          prefix
          bookYear
          currentNumber
          deptId
          bookYear
          isAuto
          isGenerateByBook
          isGenerateByDoctype
          structureType
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteBook() {
  return useMutation(
    gql`
      mutation deleteBook($id: String) {
        deleteBook(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function maxNOrderBook() {
  return useQuery(
    gql`
      query maxOrderActiveBook {
        maxOrderActiveBook
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getBook() {
  return useLazyQuery(
    gql`
      query getBook(
        $depId: String
        $bookType: BookType
        $structureType: OrganizationType
      ) {
        getBook(
          depId: $depId
          bookType: $bookType
          structureType: $structureType
        ) {
          id
          bookType
          bookName
          bookOrder
          isDefault
          prefix
          bookYear
          currentNumber
          deptId
          isAuto
          isGenerateByBook
          isGenerateByDoctype
          isDeleted
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

function getAllByDeptId() {
  return useLazyQuery(
    gql`
      query getAllByDeptId($id: String) {
        getAllByDeptId(id: $id) {
          id
          bookType
          bookName
          bookOrder
          isDefault
          prefix
          bookYear
          currentNumber
          isAuto
          isGenerateByBook
          isGenerateByDoctype
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
  deleteBook,
  getAllBook,
  getAllBookByStructureType,
  getAllByDeptId,
  getAllDocOutBook,
  getBook,
  getBookById,
  getBookByIdReturnList,
  maxNOrderBook,
  saveBook,
  searchBook
};
