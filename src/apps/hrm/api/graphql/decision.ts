import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
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
                otherDecisionType
                employeeGeneral{
                    fullName
                    avatar
                }
                employeeCommendations{
                  employeeOrganizationId
                  employeeOrganizationName
                  avatar
                }
                
                employeeDisciplines{
                  employeeOrganizationId
                  employeeOrganizationName
                  avatar
                }`;

function searchDecisions() {
  return useLazyQuery(
    gql`
        query searchDecisions($keyword: String, $decisionType: DecisionType){
            searchDecisions(keyword: $keyword, decisionType: $decisionType){
              allDecision{
                ${fields}
              }
              draftDecision{
                ${fields}
              }
              approvedDecision{
                ${fields}
              }
              rejectDecision{
                ${fields}
              }
              waitingApproveDecision{
                ${fields}
              }
              totalAll
              totalDraft
              totalWaitingApprove
              totalApproved
              totalRejected
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

function searchDecisionAdvance() {
  return useLazyQuery(
    gql`
        query searchDecisionAdvance($keyword: String, $decisionPayload: DecisionPayload, $pageable: Pageable){
            searchDecisionAdvance(keyword: $keyword, decisionPayload: $decisionPayload, pageable: $pageable){
                totalCount
                pageInfo{
                    hasPreviousPage
                    hasNextPage
                }
                edges{
                    cursor
                    node{
                        ${fields}
                    }
                }
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

function getStatusesDecision() {
  return useLazyQuery(
    gql`
        query getStatusesDecision($keyword: String, $decisionPayload: DecisionPayload) {
            getStatusesDecision(keyword: $keyword, decisionPayload: $decisionPayload) {
                status
                total
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

function searchAdvanceReward() {
  return useLazyQuery(
    gql`
        query searchAdvanceReward($keyword: String, $rewardPayload: RewardPayload){
            searchAdvanceReward(keyword: $keyword, rewardPayload: $rewardPayload){
              allDecision{
                ${fields}
              }
              draftDecision{
                ${fields}
              }
              approvedDecision{
                ${fields}
              }
              rejectDecision{
                ${fields}
              }
              waitingApproveDecision{
                ${fields}
              }
              totalAll
              totalDraft
              totalWaitingApprove
              totalApproved
              totalRejected
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

function findReward() {
  return useLazyQuery(
    gql`
        query findReward($keyword: String, $decisionType: DecisionType){
            findReward(keyword: $keyword, decisionType: $decisionType){
              allDecision{
                ${fields}
              }
              draftDecision{
                ${fields}
              }
              approvedDecision{
                ${fields}
              }
              rejectDecision{
                ${fields}
              }
              waitingApproveDecision{
                ${fields}
              }
              totalAll
              totalDraft
              totalWaitingApprove
              totalApproved
              totalRejected
            }
        }
        `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
};

function deleteById() {
  return useMutation(
    gql`
        mutation deleteById($id: String){
            deleteById(id: $id)
        }
        `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findById(id: string) {
  return useQuery(
    gql`
        query findDecisionById($id: String){
            findDecisionById(id: $id){
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
                contract
                dismissalDate
                commendationObject
                otherDecisionType
                salaryDecision {
                    id
                    type
                    jobTitle
                    rank
                    grade
                    scale
                    coefficient
                    coefficientSalary
                    regionalMinimum
                    agreementSalary
                    totalSalary
                    bonuses {
                      id
                      salaryId
                      type
                      amount
                    }
                  }
                  
                files{
                    id
                    employeeId
                    objectId
                    type
                    name
                    extension
                    path
                    size
                }
                
                employeeDecisions{
                  id
                  decisionId
                  employeeId
                  employeeName
                  oldDeptId
                  oldTitleId
                  oldPositionId
                  newDeptId
                  newTitleId
                  newPositionId
                  receptionId
                  decisionName
                  employeeName
                  oldDeptName
                  oldTitleName
                  oldPositionName
                  newDeptName
                  newTitleName
                  newPositionName
                  receptionName
                  isConcurrent
                  employeeType
                  professionalWork
                }
                
                employeeCommendations{
                  id
                  decisionId
                  employeeOrganizationId
                  employeeOrganizationName
                  reward
                  typePayment
                  form
                  title
                  commendationObject
                }
                
                employeeDisciplines{
                  id
                  decisionId
                  employeeOrganizationId
                  employeeOrganizationName
                  compensationAmount
                  typeExecution
                  form
                  disciplineObject
                }
                
                salaryAdjustmentDecision{
                  id
                  decisionId
                  salaryGradeOld
                  salaryScaleOld
                  salaryCoefficientOld
                  salaryLevelOld
                  regionalMinimumWageOld
                  salaryGradeNew
                  salaryScaleNew
                  salaryCoefficientNew
                  salaryLevelNew
                  regionalMinimumWageNew
                  isAutoUpdateProcessSalary
                }
            }
        }
        `, { id },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findCommendationDecisionById(id: string) {
  return useQuery(
    gql`
        query findDecisionById($id: String){
            findDecisionById(id: $id){
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
                contract
                template2c
                commendationObject
                files{
                    id
                    employeeId
                    objectId
                    type
                    name
                    extension
                    path
                    size
                }
                
                employeeCommendations{
                  id
                  decisionId
                  employeeOrganizationId
                  employeeOrganizationName
                  reward
                  typePayment
                  form
                  title
                  commendationObject
                }
            }
        }
        `, { id },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findDisciplineDecisionById(id: string) {
  return useQuery(
    gql`
        query findDecisionById($id: String){
            findDecisionById(id: $id){
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
                contract
                template2c
                commendationObject
                files{
                    id
                    employeeId
                    objectId
                    type
                    name
                    extension
                    path
                    size
                }
                
                employeeDisciplines{
                  id
                  decisionId
                  employeeOrganizationId
                  employeeOrganizationName
                  compensationAmount
                  typeExecution
                  form
                  disciplineObject
                }
            }
        }
        `, { id },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function settingStatus() {
  return useMutation(
    gql`
        mutation settingStatus($decisionId: String, $status: StatusType){
            settingStatus(decisionId: $decisionId, status: $status)
        }
        `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteById,
  findById,
  findCommendationDecisionById,
  findDisciplineDecisionById,
  findReward,
  getStatusesDecision,
  searchAdvanceReward,
  searchDecisionAdvance,
  searchDecisions,
  settingStatus
};
