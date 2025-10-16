import { reactive, ref } from 'vue';

import type { FileViewerState } from '../types';

export function useFileViewer() {
  // Reactive state
  const fileViewerState = reactive<FileViewerState>({
    isVisible: false,
    fileBlob: null,
    viewType: ''
  });

  // Methods
  const openPdfFile = (file: Blob, viewType = '') => {
    if (!(file instanceof Blob)) {
      throw new Error('Invalid file type - expected Blob');
    }
    
    fileViewerState.fileBlob = file;
    fileViewerState.viewType = viewType;
    fileViewerState.isVisible = true;
  };
  
  const closeFileViewer = () => {
    fileViewerState.isVisible = false;
    fileViewerState.fileBlob = null;
    fileViewerState.viewType = '';
  };
  
  const openPdfInNewTab = (file: Blob) => {
    if (!(file instanceof Blob)) {
      throw new Error('Invalid file type - expected Blob');
    }
    
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    
    // Clean up the URL after a delay to free memory
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  };
  
  const downloadFile = (file: Blob, filename: string) => {
    if (!(file instanceof Blob)) {
      throw new Error('Invalid file type - expected Blob');
    }
    
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    fileViewerState,
    openPdfFile,
    closeFileViewer,
    openPdfInNewTab,
    downloadFile
  };
}
