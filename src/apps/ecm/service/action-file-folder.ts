import { some } from 'lodash';
import { storeToRefs } from 'pinia';

import { copyMultiple, dels, moveMultiple, restores, ServiceType, toggleImportantGraphql, trashMultiple } from '@/apps/ecm/api/graphql/file-manage';
import { downloadMultiple } from '@/apps/ecm/api/rest/manage';
import { EDITABLE_EXT } from '@/apps/ecm/constants';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { ECM_ACTION, hasEcmPermission, hasFileCreatePermission, hasFolderCreatePermission, hasTrashManagePermission, SUBJECT } from '@/apps/ecm/service/permission_helper';
import { useBreadcrumbStore } from '@/apps/ecm/store/breadcrumb';
import { CopyPaste, useStorageStore } from '@/apps/ecm/store/storage';
import { confirm } from '@/common/helpers/custom-confirmation-service';
import { toastError } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { downloadFile, generateFileEditorUrl } from '@/common/helpers/file-utils';
import i18n from '@/common/i18n';

const store = useStorageStore();
const { t } = i18n.global;

const {
  copyPasteFileFolders,
  copyPasteAction,
  selectedFileFolders,
  folderId,
  selectedIds,
  currentIds,
  folders,
  files,
  serviceType
} = storeToRefs(store);
const { path } = storeToRefs(useBreadcrumbStore());
const { mutate: restoresMutate, onError: restoresOnError } = restores();

function editable(file: EcmFile | EcmFolder) {
  return !file.isDeleted && 'extension' in file && EDITABLE_EXT.includes(file.extension);
}

function hasPermission(fileFolder: EcmFile | EcmFolder, action: ECM_ACTION) {
  if (action === ECM_ACTION.TRASH_MANAGEMENT) {
    return hasTrashManagePermission(serviceType.value, fileFolder.treePath);
  }
  if ('extension' in fileFolder) {
    return hasEcmPermission(serviceType.value, fileFolder.treePath, ECM_ACTION[action], SUBJECT[SUBJECT.FILE]);
  } else {
    return hasEcmPermission(serviceType.value, fileFolder.treePath, ECM_ACTION[action], SUBJECT[SUBJECT.FOLDER]);
  }
}

function checkPermissionBeforeRun(fileFolders: (EcmFile | EcmFolder)[], action: ECM_ACTION, run: () => void, extraCheck?: boolean) {
  if (fileFolders.every(f => hasPermission(f, action)) && extraCheck !== false) {
    run();
  } else {
    toastError({
      title: t('common.result.title.warn'),
      message: t('ecm.storage.fileFolderActions.error.noPermission')
    });
  }
}

function openFileToEdit() {
  function editFile() {
    const file = selectedFileFolders.value[0];
    if (editable(file)) {
      const editUrl = generateFileEditorUrl(file.id);
      window.open(editUrl);
    }
  }

  if (selectedFileFolders.value.length == 1) {
    checkPermissionBeforeRun(selectedFileFolders.value, ECM_ACTION.EDIT, editFile);
  }
}

function downloadFileFolder() {
  function download() {
    downloadMultiple(serviceType.value, selectedIds.value).then((res) => {
      downloadFile(res.data, res.headers['content-disposition'] ? decodeURI(res.headers['content-disposition']
        .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)[1]
        .replaceAll('"', '')) : 'unknown');
    });
  }

  if (selectedFileFolders.value.length) {
    checkPermissionBeforeRun(selectedFileFolders.value, ECM_ACTION.DOWNLOAD, download);
  }
}

type FileFolderParam = {
    type: string,
    ids: { id: string, isFolder: boolean }[],
    targetFolderId: string
}

function pasteInCurrentFolder() {
  const param: FileFolderParam = {
    type: getType(serviceType.value),
    ids: copyPasteFileFolders.value.map(f => {
      return {
        id: f.id,
        isFolder: !('extension' in f)
      };
    }),
    targetFolderId: folderId.value
  };

  function updateCurrentFolder(param: FileFolderParam, data: (EcmFolder | EcmFile)[]) {
    if (copyPasteAction.value === CopyPaste.CUT) {
      store.moveToCurrentFolder(data);
    } else {
      store.copyToCurrentFolder(data);
    }
  }

  checkPermissionBeforeRun(copyPasteFileFolders.value, copyPasteAction.value === CopyPaste.CUT ? ECM_ACTION.MOVE : ECM_ACTION.COPY,
    () => paste(param, updateCurrentFolder),
    copyPasteFileFolders.value.every(f =>
      'extension' in f ? hasFileCreatePermission(serviceType.value, path.value) : hasFolderCreatePermission(serviceType.value, path.value)
    )
  );
}

function pasteToFolder() {
  function updateCurrentFolder(param: FileFolderParam, data: (EcmFolder | EcmFile)[]) {
    if (copyPasteAction.value === CopyPaste.CUT) {
      store.moveToTargetFolder(data);
    }
  }

  if (selectedFileFolders.value.length === 1) {
    const param = {
      type: getType(serviceType.value),
      ids: copyPasteFileFolders.value.map(f => {
        return {
          id: f.id,
          isFolder: !('extension' in f)
        };
      }),
      targetFolderId: selectedFileFolders.value[0].id
    };

    checkPermissionBeforeRun(copyPasteFileFolders.value, copyPasteAction.value === CopyPaste.CUT ? ECM_ACTION.MOVE : ECM_ACTION.COPY,
      () => paste(param, updateCurrentFolder),
      copyPasteFileFolders.value.every(f =>
        'extension' in f ? hasFileCreatePermission(serviceType.value, selectedFileFolders.value[0].treePath)
          : hasFolderCreatePermission(serviceType.value, selectedFileFolders.value[0].treePath)
      )
    );

  }
}

function paste(param: FileFolderParam, updateFunction: (param: FileFolderParam, data: (EcmFolder | EcmFile)[]) => void) {
  if (param.type == ServiceType.SHARED.toString()) {
    param.type = ServiceType.PERSON.toString();
  }
  if (copyPasteAction.value === CopyPaste.CUT) {
    moveMultiple().mutate(param)
      .then((a) => {
        if (a?.data) {
          updateFunction(param, a.data.moveMultiple);
          emitUpdateFolderTree();
          store.resetCopyPaste();
        }
      });
  } else {
    copyMultiple().mutate(param)
      .then((a) => {
        if (a?.data) {
          updateFunction(param, a.data.copyMultiple);
          emitUpdateFolderTree();
          store.resetCopyPaste();
        }
      });
  }
}

function confirmMoveToTrash() {
  if (selectedFileFolders.value.length) {
    checkPermissionBeforeRun(selectedFileFolders.value, ECM_ACTION.MOVE_TO_TRASH,
      () => confirm({
        message: t('ecm.storage.confirmMessage.moveToTrash'),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: moveFileFolderToTrash
      }));
  }
}

function moveFileFolderToTrash() {
  trashMultiple().mutate({
    type: getType(serviceType.value),
    ids: selectedIds.value
  }).then((a) => {
    if (a?.data) {
      store.deletesCurrentFileFolder(a.data.moveToTrashMultiple);
      emitUpdateFolderTree();
    }
  });
}

function confirmDelete() {
  if (selectedFileFolders.value.length) {
    checkPermissionBeforeRun(selectedFileFolders.value, ECM_ACTION.TRASH_MANAGEMENT,
      () => confirm({
        message: t('common.confirmDeleteMultiple'),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => deletes(selectedIds.value)
      }));
  }
}

function confirmDeleteAll() {
  if (currentIds.value.length) {
    checkPermissionBeforeRun([...folders.value, ...files.value], ECM_ACTION.TRASH_MANAGEMENT,
      () => confirm({
        message: t('ecm.storage.confirmMessage.deletesAll'),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => deletes(currentIds.value)
      })
    );
  }
}

function deletes(ids: { id: string, isFolder: boolean }[]) {
  dels().mutate({
    type: getType(serviceType.value),
    ids: ids
  }).then((a) => {
    if (a?.data) {
      store.deletesCurrentFileFolder(a.data.deletes);
    }
  });
}

function confirmRestore() {
  if (selectedFileFolders.value.length) {
    checkPermissionBeforeRun(selectedFileFolders.value, ECM_ACTION.TRASH_MANAGEMENT,
      () => confirm({
        message: t('ecm.storage.confirmMessage.restores'),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => restoresFileFolder(selectedIds.value)
      }));
  }
}

function confirmRestoreAll() {
  if (currentIds.value.length) {
    checkPermissionBeforeRun([...folders.value, ...files.value], ECM_ACTION.TRASH_MANAGEMENT,
      () => confirm({
        message: t('ecm.storage.confirmMessage.restoresAll'),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => restoresFileFolder(currentIds.value)
      }));
  }
}

function restoresFileFolder(ids: { id: string, isFolder: boolean }[]) {
  restoresMutate({
    type: getType(serviceType.value),
    ids: ids
  }).then((a) => {
    if (a?.data) {
      store.deletesCurrentFileFolder(a.data.restores);
    }
  });
}

restoresOnError((err) => {
  toastError({ message: t('ecm.fileFolder.error.' + err.graphQLErrors[0].extensions.errorCode) });
});

function emitUpdateFolderTree() {
  EventBus.emit('updateFolderTree');
}

function important() {
  if (selectedFileFolders.value.length) {
    const mark = some(selectedFileFolders.value, { isImportant: false });

    toggleImportantGraphql().mutate({
      type: getType(serviceType.value),
      ids: selectedIds.value,
      mark
    }).then((response) => {
      if (response?.data) {
        for (const fileFolder of response.data.toggleImportant) {
          store.updateFileFolder(fileFolder);
        }
      }
    });
  }
}

function getType(serviceType: number) {
  return ServiceType[serviceType ? serviceType : ServiceType.PERSON];
}

export {
  confirmDelete,
  confirmDeleteAll,
  confirmMoveToTrash,
  confirmRestore,
  confirmRestoreAll,
  downloadFileFolder,
  editable,
  important,
  openFileToEdit,
  paste,
  pasteInCurrentFolder,
  pasteToFolder
};
