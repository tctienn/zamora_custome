import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

export function findParameterMsConfig() {
  return useQuery(
    gql`
      query FindParameterMsConfig {
        findParameterMsConfig {
            id
            value {
                mission {
                    codeSettings {
                        enabled
                        structure
                        startValue
                        allowEdit
                    }
                }
                activity {
                    codeSettings {
                        enabled
                        structure
                        startValue
                        allowEdit
                    }
                }
                job {
                    codeSettings {
                        enabled
                        structure
                        startValue
                        allowEdit
                    }
                }
            }
        }
      }
    `,
    {},
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function saveMsParameterConfig() {
  return useMutation(
    gql`
      mutation SaveMsParameterConfig($msParameterConfig: MsParameterConfigInput) {
        saveMsParameterConfig(msParameterConfig: $msParameterConfig)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getMissionCode() {
  return useQuery(
    gql`
      query GetMissionCode {
        getMissionCode
      }
    `,
    {},
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getActivityCode() {
  return useQuery(
    gql`
      query GetActivityCode {
        getActivityCode
      }
    `,
    {},
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getJobCode() {
  return useQuery(
    gql`
      query GetJobCode {
        getJobCode
      }
    `,
    {},
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function increaseMissionStartValue() {
  return useMutation(
    gql`
      mutation IncreaseMissionStartValue  {
        increaseMissionStartValue 
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function increaseActivityStartValue() {
  return useMutation(
    gql`
      mutation IncreaseActivityStartValue  {
        increaseActivityStartValue 
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function increaseJobStartValue() {
  return useMutation(
    gql`
      mutation IncreaseJobStartValue  {
        increaseJobStartValue 
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}
