import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getEmployeeProfessionalSkillsBySnapshotId(snapshotId: string) {
  return useQuery(
    gql`
        query getEmployeeProfessionalSkillsBySnapshotId($snapshotId: String) {
            getEmployeeProfessionalSkillsBySnapshotId(snapshotId: $snapshotId) {
                snapshotId
                listProfessionalSkills
            }
        }
    `, { snapshotId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveEmployeeProfessionalSkills() {
  return useMutation(
    gql`
        mutation saveEmployeeProfessionalSkills($snapshotId: String, $payload: EmployeeProfessionalSkillsInput) {
            saveEmployeeProfessionalSkills(snapshotId: $snapshotId, payload: $payload)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteEmployeeProfessionalSkill() {
  return useMutation(
    gql`
        mutation deleteEmployeeProfessionalSkill($snapshotId: String, $professionalSkill: String) {
            deleteEmployeeProfessionalSkill(snapshotId: $snapshotId, professionalSkill: $professionalSkill)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { deleteEmployeeProfessionalSkill, getEmployeeProfessionalSkillsBySnapshotId, saveEmployeeProfessionalSkills };