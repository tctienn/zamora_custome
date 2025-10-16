import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MEETING_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchByKeyword(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable){
          searchTextMeetingRoom(keyword: $keyword, pageable: $pageable) {
            totalCount
            edges {
              node {
                id
                name
                status
                address
              }
            }
          }
        }
        `, { ...data },
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function maxNOrder() {
  return useQuery(
    gql`
            query maxNOrderQuery {
                maxNOrderMeetingRoom
            }
        `, {}, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getMeetingRoomById(id: string) {
  return useQuery(
    gql`
        query ($id: String!){
          getMeetingRoomById(id: $id) {
            id
            name
            status
            address
            norder
            images{
                id
                objectId
                objectType
                extension
                name
                path
                size
                isDeleted
            }
          }
        }
    `, { id }, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteMeetingRoom() {
  return useMutation(
    gql`
        mutation deleteMeetingRoom($id: String!){
            deleteMeetingRoom(id: $id)
        }
        `, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllMeetingRoomByStatusActive() {
  return useQuery(
    gql`
        query getAllActiveMeetingRooms {
          getAllActiveMeetingRooms {
            id
            name
            status
            address
          }
        }
        `, {}, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteMeetingRoom, getAllMeetingRoomByStatusActive, getMeetingRoomById, maxNOrder, searchByKeyword };
