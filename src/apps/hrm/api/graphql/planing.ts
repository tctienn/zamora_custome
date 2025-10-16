import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getListPlaning() {
  return useQuery(
    gql`
      query ListPlaning {
            listPlaning {
                  id
                  code
                  planingDate
                  planingName
                  classification
                  term
                  formNumber
                  creator
                  status
                  totalEmployees
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

function getDataPlaningById(id: string) {
  return useQuery(
    gql`
      query FindPlaningById($id: String!) {
            findPlaningById(id: $id) {
                id
                code
                planingDate
                planingName
                classification
                term
                formNumber
                creator
                status
                totalEmployees
                effectDate
                expireDate
                planingGroups {
                    id
                    planingId
                    groupName
                    employees {
                        id
                        planingGroupId
                        employeeId
                        employeeName
                        gender
                        birthDate
                        position
                        nation
                        dateOfJoiningParty
                        specialization
                        politicalTheoryLevel
                        computerSkill
                        languageSkill
                        note
                        organizationName
                    }
                }
                attachments {
                    id
                    objectId
                    name
                    extension
                    path
                    size
                    type
                    fileName
                }
            }
        }

    `,
    { id },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDataPlaningByEmployeeId(employeeId: string) {
  return useQuery(
    gql`
      query GetPlaningByEmployeeId($employeeId: String!) {
            getPlaningByEmployeeId(employeeId: $employeeId) {
                position
                groupName
                organizationName
                specialization
                jobTitle
                note
                expireDate
                effectDate
            }
        }

    `,
    { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deletePlaningById() {
  return useMutation(
    gql`
        mutation DeletePlaning($id: String!) {
            deletePlaning(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function settingPlanStatus() {
  return useMutation(
    gql`
      mutation SettingPlaningStatus($id: String!, $status: PlaningStatus!) {
        settingPlaningStatus(id: $id, status: $status)
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { deletePlaningById, getDataPlaningByEmployeeId, getDataPlaningById, getListPlaning, settingPlanStatus };
