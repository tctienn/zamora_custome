import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

const fields = `
                id
                fullName
                noDecision
                effectStartDate
                effectEndDate
                decisionDate
                decisionType
                status
                decisionMakingLevelId
                decisionMakingLevelName
                placeOfDecision
                employeeId
                reason
                oldDept
                newDept
                oldTitle
                newTitle
                oldPosition
                newPosition
                signerId
                signerName
                welfareAdjustment
                description
                createdTime
                createdBy
                lastModifiedTime
                lastModifiedBy
                commendationObject
                dismissalDate
                employeeGeneral{
                    fullName
                    avatar
                }
                employeeCommendations{
                  employeeOrganizationId
                  employeeOrganizationName
                  avatar
                  form
                }`;

function reportAdvanceReward() {
  return useQuery(
    gql`
        query reportAdvanceReward($year: Int){
            reportAdvanceReward(year: $year){
                ${fields}
            }
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function reportRewardEmployee() {
  return useQuery(
    gql`
        query reportRewardEmployee($employeeOrganization: [String]){
            reportRewardEmployee(employeeOrganization: $employeeOrganization)
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function reportEmployeeDecisionTitleByYear() {
  return useQuery(
    gql`
        query reportEmployeeDecisionTitleByYear($employeeOrganization: [String]){
            reportEmployeeDecisionTitleByYear(employeeOrganization: $employeeOrganization)
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { reportAdvanceReward, reportEmployeeDecisionTitleByYear, reportRewardEmployee };