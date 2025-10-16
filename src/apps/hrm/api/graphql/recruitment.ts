import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchRecruitmentProposal(data: { searchRecruitmentProposalReq: object; pageable: object }) {
  return useQuery(
    gql`
      query SearchRecruitmentProposal($searchRecruitmentProposalReq: SearchRecruitmentProposalReq, $pageable: Pageable) {
        searchRecruitmentProposal(searchRecruitmentProposalReq: $searchRecruitmentProposalReq, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            name
            reasonCode
            reasonName
            positionCode
            positionName
            titleCode
            titleName
            departmentId
            departmentName
            fromTime
            toTime
            currentNumberOfEmployees
            boundaryQuantity
            numberOfRecruits
            isRecruitUntilIsEnough
            levelCode
            levelName
            majorCode
            majorName
            experienceCode
            experienceName
            foreignLanguageCode
            foreignLanguageName
            ageFrom
            ageTo
            gender
            heightFrom
            heightTo
            weightFrom
            weightTo
            description
            status
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

function getDetailRecruitmentProposalById(id: string) {
  return useQuery(
    gql`
      query GetDetailRecruitmentProposalById($id: String) {
        getDetailRecruitmentProposalById(id: $id) {
            id
            name
            reasonCode
            reasonName
            positionCode
            positionName
            titleCode
            titleName
            departmentId
            departmentName
            fromTime
            toTime
            currentNumberOfEmployees
            boundaryQuantity
            numberOfRecruits
            isRecruitUntilIsEnough
            levelCode
            levelName
            majorCode
            majorName
            experienceCode
            experienceName
            foreignLanguageCode
            foreignLanguageName
            ageFrom
            ageTo
            gender
            heightFrom
            heightTo
            weightFrom
            weightTo
            description
            status
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

function deleteRecruitmentProposal() {
  return useMutation(
    gql`
        mutation DeleteRecruitmentProposal($id: String!) {
            deleteRecruitmentProposal(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteRecruitmentProposalAttachment() {
  return useMutation(
    gql`
        mutation DeleteRecruitmentProposalAttachment($id: String!) {
            deleteRecruitmentProposalAttachment(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countAllRecruitmentProposalAndByEachStatus() {
  return useQuery(
    gql`
      query CountAllRecruitmentProposalAndByEachStatus{
        countAllRecruitmentProposalAndByEachStatus {
          draft
          waitingForApproval
          totalAll
          approved
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
  countAllRecruitmentProposalAndByEachStatus,
  deleteRecruitmentProposal,
  deleteRecruitmentProposalAttachment,
  getDetailRecruitmentProposalById,
  searchRecruitmentProposal 
};