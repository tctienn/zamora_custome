import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { useEcmPermissions } from '@/apps/ecm/store/ecm_group_permissions';

export enum ECM_ACTION {
  VIEW, DOWNLOAD, CREATE, EDIT, COPY, MOVE, VERSION_MANAGEMENT, MOVE_TO_TRASH, TRASH_MANAGEMENT
}

export enum SUBJECT {
  FOLDER, FILE, TRASH
}

function hasEcmPermission(serviceType: ServiceType, path: string, action: string, permissionType: string) {
  switch (serviceType) {
  case ServiceType.GROUP:
  case ServiceType.GROUP_TRASH:
    return useEcmPermissions().hasPermission(permissionType, path, action);
  default:
    return true;
  }
}

function hasDownloadPermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.DOWNLOAD], SUBJECT[SUBJECT.FILE])
    && hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.DOWNLOAD], SUBJECT[SUBJECT.FOLDER]);
}

function hasCreatePermission(serviceType: ServiceType, path: string) {
  return hasFileCreatePermission(serviceType, path) || hasFolderCreatePermission(serviceType, path);
}

function hasFileCreatePermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.CREATE], SUBJECT[SUBJECT.FILE]);
}

function hasFolderCreatePermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.CREATE], SUBJECT[SUBJECT.FOLDER]);
}

function hasFileEditPermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.EDIT], SUBJECT[SUBJECT.FILE]);
}

function hasFolderEditPermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.EDIT], SUBJECT[SUBJECT.FOLDER]);
}

function hasFileCopyPermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.COPY], SUBJECT[SUBJECT.FILE]);
}

function hasFolderCopyPermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.COPY], SUBJECT[SUBJECT.FOLDER]);
}

function hasCopyPermission(serviceType: ServiceType, path: string) {
  return hasFileCopyPermission(serviceType, path) && hasFolderCopyPermission(serviceType, path);
}

function hasFileMovePermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.MOVE], SUBJECT[SUBJECT.FILE]);
}

function hasFolderMovePermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.MOVE], SUBJECT[SUBJECT.FOLDER]);
}

function hasMovePermission(serviceType: ServiceType, path: string) {
  return hasFileMovePermission(serviceType, path) && hasFolderMovePermission(serviceType, path);
}

function hasVersionManagePermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.VERSION_MANAGEMENT], SUBJECT[SUBJECT.FILE]);
}

function hasFileMoveToTrashPermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.MOVE_TO_TRASH], SUBJECT[SUBJECT.FILE]);
}

function hasFolderMoveToTrashPermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.MOVE_TO_TRASH], SUBJECT[SUBJECT.FOLDER]);
}

function hasMoveToTrashPermission(serviceType: ServiceType, path: string) {
  return hasFileMoveToTrashPermission(serviceType, path) && hasFolderMoveToTrashPermission(serviceType, path);
}

function hasTrashManagePermission(serviceType: ServiceType, path: string) {
  return hasEcmPermission(serviceType, path, ECM_ACTION[ECM_ACTION.TRASH_MANAGEMENT], SUBJECT[SUBJECT.TRASH]);
}

export {
  hasCopyPermission,
  hasCreatePermission,
  hasDownloadPermission,
  hasEcmPermission,
  hasFileCopyPermission,
  hasFileCreatePermission,
  hasFileEditPermission,
  hasFileMovePermission,
  hasFileMoveToTrashPermission,
  hasFolderCopyPermission,
  hasFolderCreatePermission,
  hasFolderEditPermission,
  hasFolderMovePermission,
  hasFolderMoveToTrashPermission,
  hasMovePermission,
  hasMoveToTrashPermission,
  hasTrashManagePermission,
  hasVersionManagePermission,
};