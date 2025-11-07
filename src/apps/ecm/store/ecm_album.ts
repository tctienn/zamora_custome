import { computed, ref } from 'vue';
import { defineStore } from 'pinia';




export const useAlbumStore = defineStore(
  'ecm_album',
  () => {
   
    const rootFolderId = ref<string>('');
    const folderId = ref<string>('');
    const myFolderPageList = ref<String[]>([])

    // function pushFile(file: EcmFile) {
    //   filesFull.value = [...filesFull.value, file];
    // }

    // function pushFiles(files: EcmFile[]) {
    //   filesFull.value = [...filesFull.value, ...files];
    // }

   

    return {
      rootFolderId,
      myFolderPageList
      
    };
  }, { persist: { storage: sessionStorage } }
);

