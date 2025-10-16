import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { AttachmentType } from '@/apps/work/model/workAttachment';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

const fullFieldOfFileFolder = [
  'id',
  'name',
  'extension',
  'parentPath',
  'downloadPath',
  'size',
  'objectType',
  'objectId',
  'isFolder',
  'parentId',
  'isDeleted',
  'createdTime',
  'createdBy',
  'lastModifiedTime',
  'lastModifiedBy'
];

function getFileFolderFromRootFolder(objectId: string, objectType: AttachmentType) {
  return useQuery(
    gql`
       query getFileFolderFromRootFolder($objectId: String, $objectType: AttachmentType){
            getFileFolderFromRootFolder(objectId: $objectId, objectType: $objectType) {
                ${ fullFieldOfFileFolder }
            }
        }
    `, {
      objectId,
      objectType
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getFileFolderByParentId() {
  return useLazyQuery(
    gql`
       query getFileFolderByParentId($parentId: String){
            getFileFolderByParentId(parentId: $parentId) {
                ${ fullFieldOfFileFolder }
            }
        }
    `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getImgByObjectId() {
  return useLazyQuery(
    gql`
        query getImgByObjectId($objectId: String){
            getImgByObjectId(objectId: $objectId){
                downloadPath
                name
                size
                createdTime
            }
        }
    `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function backFolder() {
  return useLazyQuery(
    gql`
       query backFolder($path: String!){
            backFolder(path: $path) {
                ${ fullFieldOfFileFolder }
            }
        }
    `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getFileFolderByPath() {
  return useLazyQuery(
    gql`
       query getFileFolderByPath($path: String!){
            getFileFolderByPath(path: $path) {
                ${ fullFieldOfFileFolder }
            }
        }
    `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function createFolder() {
  return useMutation(
    gql`
       mutation createFolder($name: String, $path: String, $objectType: AttachmentType, $objectId: String, $parentId: String){
            createFolder(name: $name, path: $path, objectType: $objectType, objectId: $objectId, parentId: $parentId) {
                id
                name
                parentPath
            }
        }
        `, { clientId: WORK_CLIENT_ID }
  );
}

function deleteFileFolder() {
  return useMutation(
    gql`
       mutation deleteFileFolder($id: String, $path: String, $objectId: String){
            deleteFileFolder(id: $id, path: $path, objectId: $objectId){
              ${ fullFieldOfFileFolder }
            }
        }
      `, { clientId: WORK_CLIENT_ID }
  );
}

function findById(id: any) {
  return useQuery(
    gql`
       query findById($id: String!){
            findById(id: $id){
                ${ fullFieldOfFileFolder }
            }
        }
      `, { id },
    { clientId: WORK_CLIENT_ID }
  );
}

function readFile(objectId: any, id: any) {
  return useQuery(
    gql`
       query readFile($objectId: String, $id: String!){
            readFile(objectId: $objectId, id: $id){
                ${ fullFieldOfFileFolder }
            }
        }
      `, {
      objectId,
      id
    },
    { clientId: WORK_CLIENT_ID }
  );
}

function getChartInfo(rootPath: string) {
  return useQuery(
    gql`
       query getChartInfo($rootPath: String!){
            getChartInfo(rootPath: $rootPath){
                totalImage
                totalPdf
                totalExcel
                totalDoc
                totalOther
                capacity
            }
        }
      `, { rootPath },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getListFileOfDiscussion(projectId: string, onlyImg: boolean) {
  return useQuery(
    gql`
         query getListFileOfDiscussion($projectId: String!, $onlyImg: Boolean){
                    getListFileOfDiscussion(projectId: $projectId, onlyImg: $onlyImg) {
                       date
                       workAttachments{
                        id
                           objectId
                        name
                        downloadPath
                        extension
                        size
                       }
                    }
                }
      `, {
      projectId,
      onlyImg
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function rename(path: string, newName: string) {
  return useMutation(
    gql`
        
      `
  );
}

export {
  backFolder,
  createFolder,
  deleteFileFolder,
  findById,
  getChartInfo,
  getFileFolderByParentId,
  getFileFolderByPath,
  getFileFolderFromRootFolder,
  getImgByObjectId,
  getListFileOfDiscussion,
  readFile
};
