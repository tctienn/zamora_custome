<template>
  <div
    class='align-self-center column-gap-3 flex'>
    <EcmCreationButton v-if='hasCreateAction'/>
    <EcmUploadButton v-if='hasCreateAction'/>
    <EcmDeleteAllButton v-if='serviceCanDelete'/>
    <EcmRestoreAllButton v-if='serviceCanDelete'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';

import { useStorageStore } from '@/apps/ecm/store/storage';
import EcmDeleteAllButton from '@/apps/ecm/views/components/view/header/group-action-butons/EcmDeleteAllButton.vue';
import EcmRestoreAllButton from '@/apps/ecm/views/components/view/header/group-action-butons/EcmRestoreAllButton.vue';

const {
  hasCreateAction,
  serviceCanDelete
} = storeToRefs(useStorageStore());

</script>

<script lang='ts'>
import EcmCreationButton from '@/apps/ecm/views/components/view/header/group-action-butons/EcmCreationButton.vue';
import EcmUploadButton from '@/apps/ecm/views/components/view/header/group-action-butons/EcmUploadButton.vue';

export default {
  name: 'EcmGroupAction',

  components: {
    EcmCreationButton,
    EcmUploadButton
  }
};
</script>