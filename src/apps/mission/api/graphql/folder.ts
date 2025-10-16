import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllByFolderName(folderName: string | null, isMyEmployee: boolean, pageable: object) {
  return useQuery(
    gql`
        query ($folderName: String, $isMyEmployee: Boolean, $pageable: Pageable) {
            getAllByFolderName(folderName: $folderName, isMyEmployee: $isMyEmployee, pageable: $pageable) {
                id
                folderName
                folderParent
                folderType
                folderYear
                numOrder
                createdBy
                status
                note
            }
        }
    `,
    {
      folderName,
      isMyEmployee,
      pageable,
    },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllFolder() {
  return useQuery(
    gql`
        query getAllFolder {
            getAllFolder {
                id
                folderName
                folderParent
                folderType
                folderYear
                numOrder
                createdBy
                status
                note
            }
        }
    `,
    {},
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getMaxFolderNumOrder(userId: string, folderParentId: string) {
  return useQuery(
    gql`
        query getMaxFolderNumOrder($userId: String, $folderParentId: String) {
            getMaxFolderNumOrder(userId: $userId, folderParentId: $folderParentId)
        }
    `,
    {
      userId,
      folderParentId,
    },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getFolderInfoById(id: string) {
  return useQuery(
    gql`
        query ($id: String) {
            getFolderInfoById(id: $id) {
                id
                folderName
                folderParent
                folderType
                folderYear
                numOrder
                createdTime
                createdBy
                status
                note
                jobIds
            }
        }
    `,
    { id },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveFolder() {
  return useMutation(
    gql`
        mutation saveFolder($folder: FolderModel) {
            saveFolder(folder: $folder)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveFolderJobs() {
  return useMutation(
    gql`
        mutation saveFolderJobs($id: String, $listJobs: [String]) {
            saveFolderJobs(id: $id, listJobs: $listJobs)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteFolder() {
  return useMutation(
    gql`
        mutation deleteFolder($id: String) {
            deleteFolder(id: $id)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteJobInFolder() {
  return useMutation(
    gql`
        mutation deleteJobInFolder($id: String, $idJob: String) {
            deleteJobInFolder(id: $id, idJob: $idJob)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getJobsInFolder(id: string) {
  return useQuery(
    gql`
        query getJobsInFolder($id: String) {
            getJobsInFolder(id: $id) {
                id
                jobName
                activityName
                missionName
                processingDeadline
                hostUnit
                assignIds
                createdTime
                createdBy
                status
            }
        }
    `,
    { id },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllDocsByFolderId(id: string) {
  return useQuery(
    gql`
        query getAllDocsByFolderId($id: String) {
            getAllDocsByFolderId(id: $id) {
                docId
                quote
                docDate
                docCode
                objectType
                status
            }
        }
    `,
    { id },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveFolderShareUser() {
  return useMutation(
    gql`
        mutation saveFolderShareUser($id: String, $shareUsers: [UserPermissionInput]) {
            saveFolderShareUser(id: $id, shareUsers: $shareUsers)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteFolder,
  deleteJobInFolder,
  getAllByFolderName,
  getAllDocsByFolderId,
  getAllFolder,
  getFolderInfoById,
  getJobsInFolder,
  getMaxFolderNumOrder,
  saveFolder,
  saveFolderJobs, saveFolderShareUser
};