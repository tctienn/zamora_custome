import { clone, get } from 'lodash';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import type { EcmFile, EcmFolder } from '@/apps/ecm/model/file-folder';
import { FILE_TYPES } from '@/common/constants';

export const useStorageStore = defineStore(
  'ecm_storage',
  () => {
    const foldersFull = ref<EcmFolder[]>([]);
    const filesFull = ref<EcmFile[]>([]);
    const serviceType = ref<ServiceType>(ServiceType.PERSON);
    const rootFolderId = ref<string>('');
    const folderId = ref<string>('');
    const selectedFileFolders = ref<(EcmFolder | EcmFile)[]>([]);
    const copyPasteFileFolders = ref<(EcmFolder | EcmFile)[]>([]);
    const copyPasteAction = ref<CopyPaste>();
    const layout = ref<'list' | 'grid'>('grid');
    const showFilter = ref(false);

    const fileTypeFilter = ref<{ value: string, icon: string, label: string }>();
    const sharedFilter = ref<string>();
    const lastModifiedFilter = ref<number>();
    const sortOption = ref<{ column: string, direction: string }>();

    const layoutBefore = ref<'list' | 'grid'>('grid');
    const sortOptionBefore = ref<{ column: string, direction: string }>();

    const folders = computed(() => clone(foldersFull.value)
      ?.filter(() => !fileTypeFilter.value?.value)
      ?.filter(f => filterShare(f))
      ?.filter(f => filterLastModified(f))
      ?.sort((a, b) => sortByOption(a, b)));
    const files = computed(() => clone(filesFull.value)
      ?.filter(f => filterShare(f))
      ?.filter(f => filterFileType(f))
      ?.filter(f => filterLastModified(f))
      ?.sort((a, b) => sortByOption(a, b)));
    const selectedFiles = computed(() => selectedFileFolders.value.filter(f => 'extension' in f));
    const selectedHasFolder = computed(() => selectedFileFolders.value.some(f => !('extension' in f)));
    const selectedIds = computed(() => selectedFileFolders.value.map(f => {
      return {
        id: f.id,
        isFolder: !('extension' in f)
      };
    }));
    const currentIds = computed(() => [
      ...folders.value.map(f => {
        return {
          id: f.id,
          isFolder: true
        };
      }),
      ...files.value.map(f => {
        return {
          id: f.id,
          isFolder: false
        };
      })
    ]);
    const hasCreateAction = computed(() => serviceType.value !== undefined ? [ServiceType.PERSON, ServiceType.GROUP].includes(serviceType.value) : false);
    const serviceCanDelete = computed(() => serviceType.value !== undefined
      ? [ServiceType.PERSON_TRASH, ServiceType.GROUP_TRASH, ServiceType.ADMIN_TRASH].includes(serviceType.value) : false);
    const showTree = computed(() => serviceType.value !== undefined ? [ServiceType.PERSON, ServiceType.GROUP].includes(serviceType.value) : false);
    const serviceCanPermission = computed(() => serviceType.value !== undefined ? [ServiceType.GROUP].includes(serviceType.value) : false);
    const isSharedFile = computed(() => serviceType.value !== undefined ? ServiceType.SHARED === serviceType.value : false);

    function setFilesFolders(filesValue: EcmFile[], foldersValue: EcmFolder[]) {
      filesFull.value = filesValue;
      foldersFull.value = foldersValue;
      selectedFileFolders.value = [];
    }

    function pushToSelected(data: EcmFolder | EcmFile) {
      const selected = selectedFileFolders.value || [];
      if (!selected.includes(data)) {
        selected.push(data);
        selectedFileFolders.value = selected;
      }
    }

    function selectFileFolder(data: EcmFolder | EcmFile) {
      selectedFileFolders.value = [data];
    }

    function pushFolder(folder: EcmFolder) {
      foldersFull.value = [...foldersFull.value, folder];
    }

    function updateFileFolder(data: EcmFile | EcmFolder) {
      if ('extension' in data) {
        filesFull.value = filesFull.value.map(f => f.id == data.id ? data : f);
      } else {
        foldersFull.value = foldersFull.value.map(f => f.id == data.id ? data : f);
      }
      selectedFileFolders.value = [];
    }

    function pushFile(file: EcmFile) {
      filesFull.value = [...filesFull.value, file];
    }

    function pushFiles(files: EcmFile[]) {
      filesFull.value = [...filesFull.value, ...files];
    }

    function deleteFileFolder(data: EcmFile | EcmFolder) {
      if ('extension' in data) {
        filesFull.value = filesFull.value.filter(f => f.id !== data.id);
      } else {
        foldersFull.value = foldersFull.value.filter(f => f.id !== data.id);
      }
      selectedFileFolders.value = selectedFileFolders.value.filter(f => f.treePath !== data.treePath);
    }

    function deletesCurrentFileFolder(data: (EcmFolder | EcmFile)[]) {
      data.forEach(d => deleteFileFolder(d));
    }

    function filterLastModified(a: EcmFile | EcmFolder) {
      if (!lastModifiedFilter.value) {
        return true;
      }
      const current = new Date();
      const date = new Date(current.getTime() - 86400000 * lastModifiedFilter.value);
      return new Date(a.lastModifiedAt) >= date;
    }

    function filterFileType(file: EcmFile) {
      const types = FILE_TYPES.get(fileTypeFilter.value?.value || '');
      if (!types) {
        return true;
      }
      return types.some(t => t === file.extension);
    }

    function filterShare(fileFolder: EcmFile | EcmFolder) {
      return !sharedFilter.value || sharedFilter.value === 'shared' && fileFolder.isShare || sharedFilter.value === 'notShare' && !fileFolder.isShare;
    }

    function sortByOption(a: EcmFolder | EcmFile, b: EcmFolder | EcmFile) {
      const op = sortOption.value || {
        column: 'name',
        direction: 'asc'
      };
      return (op.direction === 'asc' ? 1 : -1) * sortBy(a, b, op.column);
    }

    function sortBy(a: object, b: object, filed: string) {
      const aFiled = get(a, filed);
      const bFiled = get(b, filed);
      if (typeof aFiled === 'string' && typeof bFiled === 'string') {
        return aFiled.localeCompare(bFiled);
      }
      return aFiled > bFiled ? 1 : bFiled > aFiled ? -1 : 0;
    }

    function cut() {
      copyPasteFileFolders.value = selectedFileFolders.value;
      copyPasteAction.value = CopyPaste.CUT;
    }

    function copy() {
      copyPasteFileFolders.value = selectedFileFolders.value;
      copyPasteAction.value = CopyPaste.COPY;
    }

    function moveToCurrentFolder(fileFolders: (EcmFolder | EcmFile)[]) {
      fileFolders.forEach(f => {
        if ('extension' in f) {
          filesFull.value = [...filesFull.value, f];
        } else {
          foldersFull.value = [...foldersFull.value, f];
        }
      });
      resetCopyPaste();
    }

    function copyToCurrentFolder(fileFolders: (EcmFolder | EcmFile)[]) {
      fileFolders.forEach(f => {
        if ('extension' in f) {
          pushFile(f);
        } else {
          pushFolder(f);
        }
      });
      resetCopyPaste();
    }

    function moveToTargetFolder(fileFolders: (EcmFolder | EcmFile)[]) {
      // if (foldersFull.value.some(f => f.id === targetFolderId)) {
      fileFolders.forEach(f => {
        if ('extension' in f) {
          filesFull.value = filesFull.value.filter(a => a.id !== f.id);
        } else {
          foldersFull.value = foldersFull.value.filter(a => a.id !== f.id);
        }
      });
      // }
      resetCopyPaste();
    }

    function saveLayoutBefore(defaultLayout: 'list' | 'grid', defaultSortOption: {
            column: string;
            direction: string
        } | undefined) {
      layoutBefore.value = layout.value;
      sortOptionBefore.value = sortOption.value;
      layout.value = defaultLayout;
      sortOption.value = defaultSortOption;
    }

    function changeToLayoutBefore() {
      layout.value = layoutBefore.value;
      sortOption.value = sortOptionBefore.value;
    }

    function resetCopyPaste() {
      selectedFileFolders.value = [];
      copyPasteFileFolders.value = [];
      copyPasteAction.value = undefined;
    }

    function resetFolderIds() {
      folderId.value = '';
      rootFolderId.value = '';
    }

    return {
      copy,
      cut,
      copyPasteAction,
      copyPasteFileFolders,
      copyToCurrentFolder,
      currentIds,
      deleteFileFolder,
      deletesCurrentFileFolder,
      fileTypeFilter,
      sharedFilter,
      isSharedFile,
      files,
      folderId,
      folders,
      serviceCanPermission,
      hasCreateAction,
      lastModifiedFilter,
      layout,
      moveToCurrentFolder,
      moveToTargetFolder,
      pushFile,
      pushFiles,
      pushFolder,
      pushToSelected,
      selectFileFolder,
      resetFolderIds,
      rootFolderId,
      saveLayoutBefore,
      changeToLayoutBefore,
      selectedFileFolders,
      selectedFiles,
      selectedIds,
      selectedHasFolder,
      serviceType,
      serviceCanDelete,
      setFilesFolders,
      sortOption,
      showFilter,
      showTree,
      resetCopyPaste,
      updateFileFolder,
    };
  }, { persist: { storage: sessionStorage } }
);

export enum CopyPaste {
    COPY, CUT
}