import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WIDGET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

const topicColumns = [
  'id',
  'type',
  'subjectId',
  'creatorId',
  'creator',
  'createdAt',
  'lastSentAt',
  'name',
  'isDeleted',
];

function getSubjectTopicsGraphql(data: { subjectId: string, isDeleted: boolean, types: string[], limit: number | null }) {
  return useQuery(
    gql`
            query($subjectId: String!, $isDeleted: Boolean!, $types: [String]!, $limit: Int) {
                subjectTopics(subjectId: $subjectId, isDeleted: $isDeleted, types: $types, limit: $limit) {
                    ${topicColumns.join(' ')}
                }
            }
        `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getSubjectTopicsPageGraphql(data: { subjectId: string, isDeleted: boolean, types: string[], limit: number | null }) {
  return useQuery(
    gql`
          query($subjectId: String!, $isDeleted: Boolean!, $types: [String]!, $limit: Int) {
              subjectTopicsPage(subjectId: $subjectId, isDeleted: $isDeleted, types: $types, limit: $limit) {
                  content {
                      ${topicColumns.join(' ')}
                  }
                  totalPages
                  totalElements
              }
          }
      `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getTopicsGraphql(data: { isDeleted: boolean, types: string[], limit: number | null }) {
  return useQuery(
    gql`
            query($isDeleted: Boolean!, $types: [String]!, $limit: Int) {
                topics(isDeleted: $isDeleted, types: $types, limit: $limit) {
                    ${topicColumns.join(' ')}
                }
            }
        `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getTopicGraphql(topicId: string) {
  return useQuery(
    gql`
            query($topicId: String!) {
                topic(topicId: $topicId) {
                    ${topicColumns.join(' ')}
                }
            }
        `, { topicId },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getSubjectTopicsLazyGraphql(data: { subjectId: string, isDeleted: boolean, types: string[], limit: number | null }) {
  return useLazyQuery(
    gql`
            query($subjectId: String!, $isDeleted: Boolean!, $types: [String]!, $limit: Int) {
                subjectTopics(subjectId: $subjectId, isDeleted: $isDeleted, types: $types, limit: $limit) {
                    ${topicColumns.join(' ')}
                }
            }
        `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function getTopicsLazyGraphql(data: { isDeleted: boolean, types: string[], limit: number | null }) {
  return useLazyQuery(
    gql`
            query($isDeleted: Boolean!, $types: [String]!, $limit: Int) {
                topics(isDeleted: $isDeleted, types: $types, limit: $limit) {
                    ${topicColumns.join(' ')}
                }
            }
        `, { ...data },
    {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function saveTopicGraphql() {
  return useMutation(
    gql`
            mutation($topic: TopicInput!) {
                saveTopic(topic: $topic) {
                    ${topicColumns.join(' ')}
                }
            }
        `, { clientId: WIDGET_CLIENT_ID });
}

function deleteTopicGraphql() {
  return useMutation(
    gql`
            mutation($topicId: String!) {
                deleteTopic(topicId: $topicId) {
                    id
                }
            }
        `, { clientId: WIDGET_CLIENT_ID });
}

function restoreTopicGraphql() {
  return useMutation(
    gql`
            mutation($topicId: String!) {
                restoreTopic(topicId: $topicId) {
                    id
                }
            }
        `, { clientId: WIDGET_CLIENT_ID });
}

function removeTopicGraphql() {
  return useMutation(
    gql`
            mutation($topicId: String!) {
                removeTopic(topicId: $topicId)
            }
        `, { clientId: WIDGET_CLIENT_ID });
}

function getTopicCommentsGraphql(data: { topicId: string, pageable: object }) {
  return useLazyQuery(
    gql`
            query($topicId: String!, $pageable: Pageable!) {
                topicComments(topicId: $topicId, pageable: $pageable) {
                    totalCount
                    edges {
                        node {
                            id
                            topicId
                            content
                            senderId
                            sentAt
                            avatar
                            sender
                        }
                    }
                }
            }
        `, { ...data }
    , {
      clientId: WIDGET_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  deleteTopicGraphql,
  getSubjectTopicsGraphql,
  getSubjectTopicsLazyGraphql,
  getSubjectTopicsPageGraphql,
  getTopicCommentsGraphql,
  getTopicGraphql,
  getTopicsGraphql,
  getTopicsLazyGraphql,
  removeTopicGraphql,
  restoreTopicGraphql,
  saveTopicGraphql
};