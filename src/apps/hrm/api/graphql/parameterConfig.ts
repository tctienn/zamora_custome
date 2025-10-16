import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findParameterConfig() {
  return useQuery(
    gql`
        query findParameterConfig {
            findParameterConfig {
                id
                parameterBHXH
                parameterBHYT
                parameterBHTN
                parameterBHTNLD
                parameterTotalPay
                parameterCompanyPay
                parameterEmployeePay
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

function saveParameterConfig() {
  return useMutation(
    gql`
        mutation saveParameterConfig($parameterConfig: ParameterConfigInput) {
            saveParameterConfig(parameterConfig: $parameterConfig)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findAutoIncrementCodeByType(type: string) {
  return useQuery(
    gql`
        query findAutoIncrementCodeByType($type: CodeType) {
            findAutoIncrementCodeByType(type: $type) {
                id
                symbol
                length
                initializationNumber
                applicable
                type
            }
        }
    `,
    { type },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveAutoIncrementCode() {
  return useMutation(
    gql`
        mutation saveAutoIncrementCode($autoIncrementCode: AutoIncrementCodeInput) {
            saveAutoIncrementCode(autoIncrementCode: $autoIncrementCode)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function generateAutoIncrementCode(type: string) {
  return useQuery(
    gql`
        query generateAutoIncrementCode($type: CodeType) {
            generateAutoIncrementCode(type: $type)
        }
    `,
    { type },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findAutoIncrementCodeContract() {
  return useQuery(
    gql`
        query findAutoIncrementCodeContract {
            findAutoIncrementCodeContract
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveAutoIncrementCodeContract() {
  return useMutation(
    gql`
        mutation saveAutoIncrementCodeContract($autoIncrementCodeContract: JSON) {
            saveAutoIncrementCodeContract(autoIncrementCodeContract: $autoIncrementCodeContract)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findSubmissionDeadlineByType(type: string) {
  return useQuery(
    gql`
        query findSubmissionDeadlineByType($type: SubmissionDeadlineType) {
            findSubmissionDeadlineByType(type: $type) {
                id
                fromDay
                toDay
                applicable
                type
            }
        }
    `,
    { type },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveSubmissionDeadline() {
  return useMutation(
    gql`
        mutation saveSubmissionDeadline($submissionDeadline: SubmissionDeadlineInput) {
            saveSubmissionDeadline(submissionDeadline: $submissionDeadline)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  findAutoIncrementCodeByType,
  findAutoIncrementCodeContract,
  findParameterConfig,
  findSubmissionDeadlineByType,
  generateAutoIncrementCode,
  saveAutoIncrementCode,
  saveAutoIncrementCodeContract,
  saveParameterConfig,
  saveSubmissionDeadline
};