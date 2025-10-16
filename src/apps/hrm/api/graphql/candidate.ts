import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchRecruitmentCandidate(data: { searchRecruitmentCandidateReq: object; pageable: object }) {
  return useQuery(
    gql`
      query searchRecruitmentCandidate($searchRecruitmentCandidateReq: SearchRecruitmentCandidateReq, $pageable: Pageable) {
        searchRecruitmentCandidate(searchRecruitmentCandidateReq: $searchRecruitmentCandidateReq, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            campaignId
            campaignName
            campaignCode
            candidates {
              id
              avatarImg
              candidateCode
              fullName
              dateOfBirth
              gender
              address
              phoneNumber
              email
              status
              createdBy
              createdDate
            }
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

function getDetailRecruitmentCandidateById(id: string) {
  return useQuery(
    gql`
      query getDetailRecruitmentCandidateById($id: String!) {
        getDetailRecruitmentCandidateById(id: $id) {
            id
            avatarImg
            recruitmentCampaignId
            candidateCode
            recruitmentSource
            fullName
            dateOfBirth
            gender
            isMemberOfCommunistParty
            placeOfPermanentResidenceRegistration
            citizenID
            ethnicityCode
            ethnicityName
            dateOfIssue
            nationalityCode
            nationalityName
            placeOfIssue
            maritalStatus
            phoneNumber
            email
            websiteLink1
            websiteLink2
            address
            careerGoals
            educations {
                id
                fromYear
                toYear
                schoolName
                majorCode
                majorName
                graduationClassification
                relatedSubjects
                outstandingAchievements
            }
            workExperiences {
                id
                fromMonthYear
                toMonthYear
                companyName
                jobTitleCode
                jobTitleName
                jobDescription
                outstandingAchievements
            }
            extracurricularActivities {
                id
                fromMonthYear
                toMonthYear
                organizationName
                positionName
                description
            }
            candidateCertificates {
                id
                receivedIn
                certificateName
            }
            candidateTitlesAndAwards {
                id
                receivedIn
                titleAndAwardName
            }
            hardSkill
            softSkill
            referencePersons {
                id
                fullName
                jobPositionCode
                jobPositionName
                companyName
                phoneNumber
                email
            }
            hobbies {
            code
            name
            }
            createdBy
            createdDate
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

function deleteRecruitmentCandidateById() {
  return useMutation(
    gql`
        mutation deleteRecruitmentCandidateById($id: String!) {
            deleteRecruitmentCandidateById(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countAllRecruitmentCandidateAndByEachStatus() {
  return useQuery(
    gql`
      query countAllRecruitmentCandidateAndByEachStatus  {
        countAllRecruitmentCandidateAndByEachStatus   {
          applied
        applying
        passed
        failed
        transferredCandidateProfile
        suitableForOtherPositions
        contactLater
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
  countAllRecruitmentCandidateAndByEachStatus,
  deleteRecruitmentCandidateById,
  getDetailRecruitmentCandidateById, 
  searchRecruitmentCandidate 
};
