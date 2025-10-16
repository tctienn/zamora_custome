import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MEDIA_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchQuickSurvey(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query searchQuickSurvey($keyword: String, $pageable:Pageable) {
            searchQuickSurvey(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges{
                    node{
                        id
                        code
                        createdDate
                        questionContent
                        deadlineReply
                        hideRespondent
                        highlight
                        isMultiSelect
                        optionIds
                        participants
                        status
                    }
                }
            }
        }
    `, { ...data }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchQuickSurveyByUserId(data: { keyword: string, year: number | null, pageable: object }) {
  return useQuery(
    gql`
        query searchQuickSurveyByUserId($keyword: String, $year: Int, $pageable:Pageable) {
            searchQuickSurveyByUserId(keyword: $keyword, year: $year, pageable: $pageable)
        }
    `, { ...data }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getQuickSurveyById(id: string) {
  return useQuery(
    gql`
        query getQuickSurveyById($id: String) {
            getQuickSurveyById(id: $id) {
                id
                code
                createdDate
                questionContent
                deadlineReply
                hideRespondent
                highlight
                isMultiSelect
                optionIds
                participants
                status
            }

        }
    `, { id }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getOptionsQuickSurvey(surveyId: string) {
  return useQuery(
    gql`
        query getOptionsQuickSurvey($surveyId: String) {
            getOptionsQuickSurvey(surveyId: $surveyId) {
                id
                numOrder
                content
            }

        }
    `, { surveyId }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getSurveyVoteByMe(surveyId: string) {
  return useQuery(
    gql`
        query getSurveyVoteByMe($surveyId: String) {
            getSurveyVoteByMe(surveyId: $surveyId)
        }
    `, { surveyId }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllQuickSurvey() {
  return useQuery(
    gql`
        query getAllQuickSurvey {
            getAllQuickSurvey {
                id
                code
                createdDate
                questionContent
                deadlineReply
                hideRespondent
                highlight
                isMultiSelect
                optionIds
                participants
                status
            }

        }
    `, {}, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveQuickSurvey() {
  return useMutation(
    gql`
        mutation saveQuickSurvey($quickSurvey: QuickSurveyPayload) {
            saveQuickSurvey(quickSurvey: $quickSurvey)
        }
    `, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteQuickSurvey() {
  return useMutation(
    gql`
        mutation deleteQuickSurvey($id: String) {
            deleteQuickSurvey(id: $id)
        }
    `, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function voteSurvey() {
  return useMutation(
    gql`
        mutation voteSurvey($surveyId: String!, $optionId: String!) {
            voteSurvey(surveyId: $surveyId, optionId: $optionId)
        }
    `, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  deleteQuickSurvey,
  getAllQuickSurvey,
  getOptionsQuickSurvey,
  getQuickSurveyById,
  getSurveyVoteByMe,
  saveQuickSurvey,
  searchQuickSurvey,
  searchQuickSurveyByUserId,
  voteSurvey
};