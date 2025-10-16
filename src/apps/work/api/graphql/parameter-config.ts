import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

export function findParameterConfig() {
  return useQuery(
    gql`
          query findParameterConfig {
              findParameterConfig {
                  value {
                      task {
                          autoChangeStatus
                          allowCreatorDelete
                          restrictChildTaskView
                          restrictFollowerView
                          editableFields {
                              descriptionGoal
                              addAssignee
                              updateDate
                          }
                          codeSettings {
                              enabled
                              structure
                              startValue
                              allowEdit
                          }
                      }
                      project {
                          autoChangeStatus
                          restrictChildTaskView
                          restrictFollowerView
                          addAssignee
                          addFollower
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
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function saveParameterConfig() {
  return useMutation(
    gql`
          mutation saveParameterConfig($parameterConfig: ParameterConfigInput) {
              saveParameterConfig(parameterConfig: $parameterConfig) {
                  value {
                      task {
                          autoChangeStatus
                          allowCreatorDelete
                          restrictChildTaskView
                          restrictFollowerView
                          editableFields {
                              descriptionGoal
                              addAssignee
                              updateDate
                          }
                          codeSettings {
                              enabled
                              structure
                              startValue
                              allowEdit
                          }
                      }
                      project {
                          autoChangeStatus
                          restrictChildTaskView
                          restrictFollowerView
                          addAssignee
                          addFollower
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
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getTaskCodeGraphql() {
  return useQuery(
    gql`
          query getTaskCode {
              getTaskCode
          }
      `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function increaseTaskStartValue() {
  return useMutation(
    gql`
          mutation increaseTaskStartValue {
              increaseTaskStartValue
          }
      `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getProjectCodeGraphql() {
  return useQuery(
    gql`
          query getProjectCode {
              getProjectCode
          }
      `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function increaseProjectStartValue() {
  return useMutation(
    gql`
          mutation increaseProjectStartValue {
              increaseProjectStartValue
          }
      `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}