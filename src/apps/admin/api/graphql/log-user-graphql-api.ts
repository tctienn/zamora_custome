import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getLogUserGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query($keyword: String!, $pageable: Pageable) {
            logs(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id,
                        userId,
                        userName,
                        email,
                        fullName,
                        ip,
                        time,
                        module,
                        function,
                        objectName,
                        action,
                    }
                }
            }
        }
    `, { ...data },
    { clientId: ADMIN_CLIENT_ID }
  );
}

function deleteLogByDateRageGraphql() {
  return useMutation(
    gql`
        mutation ($startDate: Date, $endDate: Date) {
            deleteLogByDateRage(startDate: $startDate, endDate: $endDate) 
        }
    `
  );
}

export { deleteLogByDateRageGraphql, getLogUserGraphql };
