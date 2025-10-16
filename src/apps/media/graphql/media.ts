import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { type MediaType } from '@/apps/media/model/media';
import { MEDIA_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

const ANNOUNCEMENT_FRAGMENT = gql`
    fragment AnnouncementFragment on Announcement {
        childrenMedia {
            id
            title
            createdTime
        }
    }
`;

const NEWS_FRAGMENT = gql`
    fragment NewsFragment on News {
        childrenMedia {
            id
            title
            createdTime
        }
    }
`;

function searchMedia(data: { type: MediaType, keyword?: string, pageable: object }) {
  return useQuery(
    gql`
        query ($type: MediaType!, $keyword: String, $pageable:Pageable) {
            searchTextMedia(type: $type, keyword: $keyword, pageable: $pageable, groupCode: null) {
                totalCount
                edges{
                    node{
                        id
                        title
                        publisher
                        groupCode
                        publishDate
                        groupName
                        isHighlight
                        createdTime
                        status
                        createdBy
                        viewed {
                            userId
                            createdAt
                        }
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

function featuredMedias(type: MediaType) {
  return useQuery(
    gql`
        query ($type: MediaType!) {
            featuredMedias(type: $type) {
                id
                title
                thumbnail
                publisher
                publishDate
                ... AnnouncementFragment
            }
        }
        ${ANNOUNCEMENT_FRAGMENT}
    `, { type }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'cache-and-network'
    }
  );
}

function mediasByStatus() {
  return useLazyQuery(
    gql`
        query ($keyword: String, $type: MediaType!, $status: MediaStatus, $pageable: Pageable) {
            mediasByStatus(keyword: $keyword, type: $type, status: $status, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        summary
                        title
                        thumbnail
                        publisher
                        publishDate
                        ... AnnouncementFragment
                    }
                }
            }
        }
        ${ANNOUNCEMENT_FRAGMENT}
    `, {}, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function previewMedia(type: MediaType, id: string) {
  return useQuery(
    gql`
        query ($type: MediaType!, $id: ID!) {
            media(type: $type, id: $id) {
                id
                title
                content
                thumbnail
                publisher
                publishDate
                isAllowsEmojis
                isAllowsComment
                subMedias
                listFileAttachments {
                    id
                    name
                    path
                    size
                    isDeleted
                }
                ... AnnouncementFragment
                ... NewsFragment
            }
        }
        ${ANNOUNCEMENT_FRAGMENT}
        ${NEWS_FRAGMENT}
    `, {
      type,
      id
    }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function readMedia(type: MediaType, id: string) {
  return useQuery(
    gql`
        query ($type: MediaType!, $id: ID!) {
            readMedia(type: $type, id: $id) {
                id
                title
                summary
                content
                thumbnail
                publisher
                publishDate
                isAllowsEmojis
                isAllowsComment
                viewed {
                    userId
                    createdAt
                }
                listFileAttachments {
                    id
                    name
                    path
                    size
                    isDeleted
                }
                emotions {
                    userId
                    emotionType
                    createdAt
                }
                ... AnnouncementFragment
            }
        }
    ${ANNOUNCEMENT_FRAGMENT}`, {
      type,
      id
    }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteMedia() {
  return useMutation(
    gql`
        mutation deleteMedia($type: MediaType!, $id: String!){
            deleteMedia(type: $type, id: $id)
        }
    `, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateStatusMedia() {
  return useMutation(
    gql`
        mutation updateStatusMedia($type: MediaType!, $id: ID!, $status: MediaStatus!) {
            updateStatusMedia(type: $type, id: $id, status: $status) {
                id
                status
            }
        }
    `, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getMediasByIdNot(data: { type: MediaType, id: string, searchKeyword: string, pageable: Pageable }) {
  return useQuery(
    gql`
        query getMediasByIdNot($type: MediaType!, $id: String, $searchKeyword: String,$pageable: Pageable){
            getMediasByIdNot(type: $type, id: $id, searchKeyword: $searchKeyword, pageable: $pageable){
                edges{
                    node{
                        id
                        title
                        publishDate
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

function maxNOrder(type: MediaType) {
  return useQuery(
    gql`
        query maxNOrder($type: MediaType!){
            maxNOrder(type: $type)
        }
    `, { type }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function media(type: MediaType, id: string) {
  return useQuery(
    gql`
        query media($type: MediaType!, $id: ID!) {
            media(type: $type, id: $id) {
                id
                title
                content
                publisher
                thumbnail
                publishDate
                norder
                groupCode
                groupName
                isHighlight
                isAllowsEmojis
                isAllowsComment
                subMedias
                status
                createdTime
                createdBy
                lastModifiedTime
                lastModifiedBy
                summary
                listFileAttachments {
                    id
                    name
                    path
                    size
                    isDeleted
                }
                ... AnnouncementFragment
                ... NewsFragment
            }
        }
        ${ANNOUNCEMENT_FRAGMENT}
        ${NEWS_FRAGMENT}
    `, {
      type,
      id
    }, {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  deleteMedia,
  featuredMedias,
  getMediasByIdNot,
  maxNOrder,
  media,
  mediasByStatus,
  previewMedia,
  readMedia,
  searchMedia,
  updateStatusMedia
};
