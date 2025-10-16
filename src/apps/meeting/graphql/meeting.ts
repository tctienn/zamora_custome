import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MEETING_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function listMeetingByStartEnd() {
  return useQuery(
    gql`
        query listMeetingByStartEnd(
            $searchModel: SearchModel
        ) {
            listMeetingByStartEnd(
                searchModel: $searchModel
            ) {
                id
                content
                startTime
                endTime
                hostId
                roomId
                meetingType
                onlineUrl
                departmentIds
                mediaDeviceIds
                guest
                setup
                note
                isImportant
                isPrivate
                repeat
                numberAttendees
                status
                isDeleted
                isBase
                flowId
                isConflict
                createdTime
                createdBy
                remind
                remindTimeType
                remindType
                cronConfig
                fileAttachments {
                    name
                    path
                    size
                    extension
                    objectType
                    objectId
                    id
                }
                attendees {
                    userId
                }
                meetingRoom {
                    id
                    name
                }
            }
        }
    `,
    {},
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function listMeetingByStartEndForWidget() {
  return useLazyQuery(
    gql`
        query listMeetingByStartEnd(
            $searchModel: SearchModel
        ) {
            listMeetingByStartEnd(
                searchModel: $searchModel
            ) {
                id
                content
                startTime
                endTime
                hostId
                roomId
                meetingType
                onlineUrl
                departmentIds
                mediaDeviceIds
                guest
                setup
                note
                isImportant
                repeat
                numberAttendees
                status
                isDeleted
                isBase
                flowId
                isConflict
                createdTime
                createdBy
                remind
                remindTimeType
                remindType
                cronConfig
                fileAttachments {
                    name
                    path
                    size
                    extension
                    objectType
                    objectId
                    id
                }
                attendees {
                    userId
                }
                meetingRoom {
                    id
                    name
                }
            }
        }
    `,
    {},
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findAllByProjectIdAndIsDeletedFalse() {
  return useQuery(
    gql`
        query findAllByProjectIdAndIsDeletedFalse(
            $startDate: Date!
            $endDate: Date!
            $projectId: String
        ) {
            findAllByProjectIdAndIsDeletedFalse(
                startDate: $startDate
                endDate: $endDate
                projectId: $projectId
            ) {
                id
                content
                startTime
                endTime
                hostId
                roomId
                meetingType
                onlineUrl
                departmentIds
                mediaDeviceIds
                guest
                setup
                note
                remind
                remindTimeType
                remindType
                isImportant
                isPrivate
                repeat
                numberAttendees
                status
                isDeleted
                isBase
                isConflict
                flowId
                createdTime
                createdBy
                cronConfig
                fileAttachments {
                    name
                    path
                    size
                    extension
                    objectType
                    objectId
                    id
                }
                attendees {
                    userId
                }
                meetingRoom {
                    id
                    name
                }
            }
        }
    `,
    {},
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getMeetingById(id: string) {
  return useQuery(
    gql`
        query getMeetingById($id: String!) {
            getMeetingById(id: $id) {
                id
                content
                startTime
                endTime
                hostId
                roomId
                meetingType
                onlineUrl
                departmentIds
                remind
                remindTimeType
                remindType
                mediaDeviceIds
                guest
                setup
                note
                flowId
                isImportant
                isPrivate
                repeat
                numberAttendees
                status
                isDeleted
                isBase
                createdTime
                createdBy
                cronConfig
                fileAttachments {
                    name
                    path
                    size
                    extension
                    objectType
                    objectId
                    id
                }
                attendees {
                    userId
                }
                meetingRoom {
                    name
                }
                organizations {
                    id
                    name
                    code
                }
            }
        }
    `,
    { id },
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function viewDetail(id: string) {
  return useQuery(
    gql`
        query viewDetail($id: String!) {
            viewDetail(id: $id) {
                id
                content
                startTime
                endTime
                hostId
                roomId
                meetingType
                onlineUrl
                departmentIds
                mediaDeviceIds
                guest
                setup
                note
                isImportant
                repeat
                numberAttendees
                flowId
                status
                isDeleted
                isPrivate
                remind
                remindTimeType
                remindType
                isBase
                createdTime
                createdBy
                cronConfig
                fileAttachments {
                    name
                    path
                    size
                    extension
                    objectType
                    objectId
                    id
                }
                attendees {
                    userId
                }
                meetingRoom {
                    name
                }
                organizations {
                    id
                    name
                    code
                }
            }
        }
    `,
    { id },
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteMeeting() {
  return useMutation(
    gql`
        mutation deleteMeeting($id: String!) {
            deleteMeeting(id: $id)
        }
    `,
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function meetings(searchModel: any) {
  return useQuery(
    gql`
        query listMeetingByStartEnd($searchModel: SearchModel) {
            listMeetingByStartEnd(searchModel: $searchModel) {
                id
                content
                startTime
                endTime
                hostId
                roomId
                meetingType
                flowId
                onlineUrl
                isImportant
                status
                meetingRoom {
                    id
                    name
                }
            }
        }
    `,
    { searchModel },
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getConflictMeetingsById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getMeetingById(id: $id) {
                id
                conflictMeetings {
                    id
                    content
                }
            }
        }
    `,
    { id },
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function updateStatusMeeting() {
  return useMutation(
    gql`
        mutation updateStatusMeeting($id: String!, $status: StatusMeetingEnum!) {
            updateStatusMeeting(id: $id, status: $status) {
                id
            }
        }
    `,
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countMeeting() {
  return useQuery(
    gql`
        query countMeeting(
            $searchModel: SearchModel
        ) {
            countMeeting(
                searchModel: $searchModel
            ) {
                mine
                approval
                all
            }
        }
    `,
    {},
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findConflictMeeting(idMeeting: string, hostId: string, startTime: any, endTime: any) {
  return useQuery(
    gql`
        query findConflictMeeting(
            $idMeeting: String,
            $hostId: String,
            $startTime: DateTime,
            $endTime: DateTime
        ) {
            findConflictMeeting(
                idMeeting: $idMeeting
                hostId: $hostId
                startTime: $startTime
                endTime: $endTime
            ) {
                id
                content
                startTime
                endTime
                hostId
                roomId
            }
        }
    `,
    {
      idMeeting,
      hostId,
      startTime,
      endTime
    },
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  countMeeting,
  deleteMeeting,
  findAllByProjectIdAndIsDeletedFalse,
  findConflictMeeting,
  getConflictMeetingsById,
  getMeetingById,
  listMeetingByStartEnd,
  listMeetingByStartEndForWidget,
  meetings,
  updateStatusMeeting,
  viewDetail
};
