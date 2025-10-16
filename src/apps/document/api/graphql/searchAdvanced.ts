import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function getListDocInSignerByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
        query getListDocInSignerByKeyWord($keyword: String,$page:Pageable) {
            getListDocInSignerByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          signerId
                          signerName
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListDocInPublisherByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
        query getListDocInPublisherByKeyWord($keyword: String,$page:Pageable) {
            getListDocInPublisherByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          publisherId
                          publisherName
                          publisherType
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListDocInDocCodeByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
        query getListDocInDocCodeByKeyWord($keyword: String,$page:Pageable) {
            getListDocInDocCodeByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          docCode
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListDocInQuoteByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
          query getListDocInQuoteByKeyWord($keyword: String,$page:Pageable) {
              getListDocInQuoteByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          quote
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListDocOutSignerByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
          query getListDocOutSignerByKeyWord($keyword: String,$page:Pageable) {
              getListDocOutSignerByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          signerId
                          signerName
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListDocOutPublisherByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
          query getListDocOutPublisherByKeyWord($keyword: String,$page:Pageable) {
              getListDocOutPublisherByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          publisherId
                          publisherName
                          publisherType
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListDocOutDocCodeByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
          query getListDocOutDocCodeByKeyWord($keyword: String,$page:Pageable) {
              getListDocOutDocCodeByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          docCode
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListDocOutQuoteByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
          query getListDocOutQuoteByKeyWord($keyword: String,$page:Pageable) {
              getListDocOutQuoteByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          quote
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getListDocSubmitAboutByKeyWord(
  keyword: string,
  page: Pageable
) {
  return useLazyQuery(
    gql`
          query getListDocSubmitAboutByKeyWord($keyword: String,$page:Pageable) {
              getListDocSubmitAboutByKeyWord(keyword: $keyword, page:$page) {
                  edges {
                      node {
                          about
                          __typename
                      }
                  }
                  totalCount

              }
          }
      `,
    {
      keyword: keyword,
      page: page,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countSearchAdvance(userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
            query countSearchAdvance($userDeptRole: UserDeptRole) {
                countSearchAdvance(userDeptRole: $userDeptRole) {
                  countDocIn
                  countDocOut
                  countDocSubmit
                }
            }
        `,
    { userDeptRole },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  countSearchAdvance,
  getListDocInDocCodeByKeyWord,
  getListDocInPublisherByKeyWord,
  getListDocInQuoteByKeyWord,
  getListDocInSignerByKeyWord,
  getListDocOutDocCodeByKeyWord,
  getListDocOutPublisherByKeyWord,
  getListDocOutQuoteByKeyWord,
  getListDocOutSignerByKeyWord,
};
