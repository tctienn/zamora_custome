import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function findEmployeeBankTaxByOrganization(workingStatues: string[], organization: string, pageable: Pageable) {
  return useQuery(
    gql`
        query findEmployeeBankTaxByOrganization(
            $workingStatues: [String]
            $organization: String
            $pageable: Pageable)
        {
            findEmployeeBankTaxByOrganization(
                workingStatues: $workingStatues
                organization: $organization
                pageable: $pageable
            ) {
                edges {
                    node {
                        id
                        snapshotId
                        userId
                        locked
                        code
                        status
                        fullName
                        birthDay
                        joinDate
                        gender
                        avatar

                        jobTitle
                        jobTitleName
                        organizationId
                        organizationName
                        workLocation
                        position
                        positionName

                        accountNumber
                        accountName
                        personalTaxCode
                        codeSynchronizedTax
                        bank
                        bankBranch
                    }
                }
            }
        }
    `, {
      workingStatues,
      organization,
      pageable
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findEmployeeBankTaxByOrganization };