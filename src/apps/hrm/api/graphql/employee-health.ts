import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllEmployeeHealth(snapshotId: string) {
  return useQuery(
    gql`
        query getAllEmployeeHealth($snapshotId: String) {
            getAllEmployeeHealth(snapshotId: $snapshotId) {
                id
                snapshotId
                height
                weight
                bloodType
                bloodPressure
                heartRate
                healthStatus
                cholesterol
                triglycerid
                bloodSugarLevel
                waist
                updateDate
            }
        }
    `, { snapshotId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllEmployeeVaccineInfo(snapshotId: string) {
  return useQuery(
    gql`
        query getAllEmployeeVaccineInfo($snapshotId: String) {
            getAllEmployeeVaccineInfo(snapshotId: $snapshotId) {
                id
                snapshotId
                doseNumber
                vaccinationDate
                vaccineType
                batchNumber
                vaccinationFacility
                signer
                position
            }
        }
    `, { snapshotId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveEmployeeHealth() {
  return useMutation(
    gql`
        mutation saveEmployeeHealth($payload: EmployeeHealthPayload) {
            saveEmployeeHealth(payload: $payload) {
                id
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveEmployeeVaccineInfo() {
  return useMutation(
    gql`
        mutation saveEmployeeVaccineInfo($payload: [EmployeeVaccineInfoPayload]) {
            saveEmployeeVaccineInfo(payload: $payload)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteEmployeeHealth() {
  return useMutation(
    gql`
        mutation deleteEmployeeHealth($id: String) {
            deleteEmployeeHealth(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteEmployeeVaccineInfo() {
  return useMutation(
    gql`
        mutation deleteEmployeeVaccineInfo($id: String) {
            deleteEmployeeVaccineInfo(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteEmployeeHealth,
  deleteEmployeeVaccineInfo,
  getAllEmployeeHealth,
  getAllEmployeeVaccineInfo,
  saveEmployeeHealth,
  saveEmployeeVaccineInfo
};