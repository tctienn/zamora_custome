import { useLazyQuery, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

const monthFields = ` 
            jan
            feb
            mar
            apr
            may
            jun
            jul
            aug
            sep
            oct
            nov
            dec
    `;

function docInProcessedStatistic(
  year: number,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
            query docInProcessedStatistic($year: Int!, $userDeptRole: UserDeptRole!) {
              docInProcessedStatistic(year: $year, userDeptRole: $userDeptRole) {
                ${ monthFields }
              }
            }
        `,
    {
      year,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutProcessedStatistic(
  year: number,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
            query docOutProcessedStatistic($year: Int!, $userDeptRole: UserDeptRole!) {
              docOutProcessedStatistic(year: $year, userDeptRole: $userDeptRole) {
                ${ monthFields }
              }
            }
        `,
    {
      year,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInProcessingByDept(year: number, deptId: string) {
  return useLazyQuery(
    gql`
      query docInProcessingByDept($year: Int!, $deptId: String!) {
        docInProcessingByDept(year: $year, deptId: $deptId)
      }
    `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInProcessedByDept(year: number, deptId: string) {
  return useLazyQuery(
    gql`
      query docInProcessedByDept($year: Int!, $deptId: String!) {
        docInProcessedByDept(year: $year, deptId: $deptId)
      }
    `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInOverdueByDept(deptId: string) {
  return useLazyQuery(
    gql`
      query docInOverdueByDept($deptId: String!) {
        docInOverdueByDept(deptId: $deptId)
      }
    `,
    { deptId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInDeadlineByDept(daysBefore: number | undefined, deptId: string) {
  return useLazyQuery(
    gql`
      query docInDeadlineByDept($daysBefore: Int, $deptId: String!) {
        docInDeadlineByDept(daysBefore: $daysBefore, deptId: $deptId)
      }
    `,
    {
      daysBefore,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInProcessedStatisticByDept(year: number, deptId: string) {
  return useLazyQuery(
    gql`
            query docInProcessedStatisticByDept($year: Int!, $deptId: String!) {
              docInProcessedStatisticByDept(year: $year, deptId: $deptId) {
                ${ monthFields }
              }
            }
        `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutProcessingByDept(year: number, deptId: string) {
  return useLazyQuery(
    gql`
      query docOutProcessingByDept($year: Int!, $deptId: String!) {
        docOutProcessingByDept(year: $year, deptId: $deptId)
      }
    `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutProcessedByDept(year: number, deptId: string) {
  return useLazyQuery(
    gql`
      query docOutProcessedByDept($year: Int!, $deptId: String!) {
        docOutProcessedByDept(year: $year, deptId: $deptId)
      }
    `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutOverdueByDept(deptId: string) {
  return useLazyQuery(
    gql`
      query docOutOverdueByDept($deptId: String!) {
        docOutOverdueByDept(deptId: $deptId)
      }
    `,
    { deptId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutDeadlineByDept(daysBefore: number | undefined, deptId: string) {
  return useLazyQuery(
    gql`
      query docOutDeadlineByDept($daysBefore: Int, $deptId: String!) {
        docOutDeadlineByDept(daysBefore: $daysBefore, deptId: $deptId)
      }
    `,
    {
      daysBefore,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutProcessedStatisticByDept(year: number, deptId: string) {
  return useLazyQuery(
    gql`
            query docOutProcessedStatisticByDept($year: Int!, $deptId: String!) {
              docOutProcessedStatisticByDept(year: $year, deptId: $deptId) {
               ${ monthFields }
              }
            }
        `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function reportLeadersOfChildren(
  year: number,
  deptId: string,
  daysBefore: number,
  userDeptRole: any,
) {
  return useLazyQuery(
    gql`
      query reportLeadersOfChildren(
        $year: Int!
        $deptId: String!
        $daysBefore: Int
        $userDeptRole: UserDeptRole!
      ) {
        reportLeadersOfChildren(
          year: $year
          deptId: $deptId
          daysBefore: $daysBefore
          userDeptRole: $userDeptRole
        ) {
          name
          position
          total
          processed
          processing
          processedOnTime
          processedLate
          processingOnTime
          processingCloseToDeadline
          processingLate
        }
      }
    `,
    {
      year,
      deptId,
      daysBefore,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function reportChildren(
  year: number,
  deptId: string,
  daysBefore: number,
  userDeptRole: any,
) {
  return useLazyQuery(
    gql`
      query reportChildren(
        $year: Int!
        $deptId: String!
        $daysBefore: Int
        $userDeptRole: UserDeptRole!
      ) {
        reportChildren(
          year: $year
          deptId: $deptId
          daysBefore: $daysBefore
          userDeptRole: $userDeptRole
        ) {
          name
          position
          total
          processedOnTime
          processedLate
          processingOnTime
          processingCloseToDeadline
          processingLate
        }
      }
    `,
    {
      year,
      deptId,
      daysBefore,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInCountByTypeInDept(year: number, deptId: string) {
  return useQuery(
    gql`
      query docInCountByTypeInDept($year: Int!, $deptId: String!) {
        docInCountByTypeInDept(year: $year, deptId: $deptId) {
          docTypeId
          docTypeName
          count
        }
      }
    `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInCountByAreaInDept(year: number, deptId: string) {
  return useQuery(
    gql`
      query docInCountByAreaInDept($year: Int!, $deptId: String!) {
        docInCountByAreaInDept(year: $year, deptId: $deptId) {
          areaId
          areaName
          count
        }
      }
    `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInCountByPublisherInDept(year: number, deptId: string, publisherIds: string[]) {
  return useQuery(
    gql`
        query GetDocInCountByPublisher($year: Int!, $deptId: String!, $publisherIds: [String!]!) {
          docInCountByPublisherInDept(year: $year, deptId: $deptId, publisherIds: $publisherIds) {
              publisherId
              publisherName
              count 
            }
          }
    `,
    {
      year,
      deptId,
      publisherIds
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutCountByTypeInDept(year: number, deptId: string) {
  return useQuery(
    gql`
      query docOutCountByTypeInDept($year: Int!, $deptId: String!) {
        docOutCountByTypeInDept(year: $year, deptId: $deptId) {
          docTypeId
          docTypeName
          count
        }
      }
    `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutCountByAreaInDept(year: number, deptId: string) {
  return useQuery(
    gql`
      query docOutCountByAreaInDept($year: Int!, $deptId: String!) {
        docOutCountByAreaInDept(year: $year, deptId: $deptId) {
          areaId
          areaName
          count
        }
      }
    `,
    {
      year,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  docInCountByAreaInDept,
  docInCountByPublisherInDept,
  docInCountByTypeInDept,
  docInDeadlineByDept,
  docInOverdueByDept,
  docInProcessedByDept,
  docInProcessedStatistic,
  docInProcessedStatisticByDept,
  docInProcessingByDept,
  docOutCountByAreaInDept,
  docOutCountByTypeInDept,
  docOutDeadlineByDept,
  docOutOverdueByDept,
  docOutProcessedByDept,
  docOutProcessedStatistic,
  docOutProcessedStatisticByDept,
  docOutProcessingByDept,
  reportChildren,
  reportLeadersOfChildren
};
