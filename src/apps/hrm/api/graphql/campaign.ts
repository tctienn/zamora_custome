import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchRecruitmentCampaign(data: { searchRecruitmentCampaignProposalReq: object; pageable: object }) {
  return useQuery(
    gql`
      query searchRecruitmentCampaign($searchRecruitmentCampaignProposalReq: SearchRecruitmentCampaignProposalReq, $pageable: Pageable) {
        searchRecruitmentCampaign(searchRecruitmentCampaignProposalReq: $searchRecruitmentCampaignProposalReq, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            code
            recruitmentProposalId
            name
            personInChargeId
            personInChargeName
            personFollowerId
            personFollowerName
            expectedCosts
            workTypeCode
            workTypeName
            workLocationCode
            workLocationName
            salaryFrom
            salaryTo
            status
            positionCode
            positionName
            fromDate
            toDate
            numberOfRecruits
            createdBy
            createdTime
          }
        }
      }
    `,
    { ...data },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only', 
    },
  );
}

function getDetailRecruitmentCampaignById(id: string) {
  return useQuery(
    gql`
      query GetDetailRecruitmentCampaignById($id: String!) {
        getDetailRecruitmentCampaignById(id: $id) {
            id
            code
            recruitmentProposalId
            name
            personInChargeId
            personInChargeName
            personFollowerId
            personFollowerName
            expectedCosts
            workTypeCode
            workTypeName
            workLocationCode
            workLocationName
            salaryFrom
            salaryTo
            createdBy
            createdTime
            files {
                id
                quote
                attachment
                size
                downloadPath
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

function deleteRecruitmentCampaignAttachmentById() {
  return useMutation(
    gql`
        mutation DeleteRecruitmentCampaignAttachmentById($attachmentId: String!) {
            deleteRecruitmentCampaignAttachmentById(attachmentId: $attachmentId)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteRecruitmentCampaignById() {
  return useMutation(
    gql`
        mutation DeleteRecruitmentCampaignById($id: String!) {
            deleteRecruitmentCampaignById(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countAllRecruitmentCampaignAndByEachStatus () {
  return useQuery(
    gql`
      query countAllRecruitmentCampaignAndByEachStatus {
        countAllRecruitmentCampaignAndByEachStatus  {
          plan
          waitingForApproval
          inProgress
          completed
          pause
          giveBack
          canceled
          totalAll
        }
      }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

export {
  countAllRecruitmentCampaignAndByEachStatus,
  deleteRecruitmentCampaignAttachmentById,
  deleteRecruitmentCampaignById,
  getDetailRecruitmentCampaignById, 
  searchRecruitmentCampaign 
};
