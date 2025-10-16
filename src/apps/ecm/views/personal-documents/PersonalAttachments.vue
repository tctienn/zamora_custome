<template>
  <!--  <div-->
  <!--    class='align-items-center border-1 border-round content-header flex flex-row justify-content-between shadow-1 surface-border surface-ground'>-->
  <!--    <AppBreadcrumb class='bg-transparent'/>-->
  <!--  </div>-->

  <component :is='viewerType' />
</template>

<script setup lang='ts'>

import { isEmpty } from 'lodash';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { conversationId } = route.query;

const viewerType = ref(isEmpty(conversationId) ? 'EcmChatConversations' : 'EcmChatAttachments');

</script>

<script lang='ts'>
import EcmChatAttachments from '@/apps/ecm/views/components/chat-attachments/EcmChatAttachments.vue';
import EcmChatConversations from '@/apps/ecm/views/components/chat-attachments/EcmChatConversations.vue';

export default {
  name: 'PersonalAttachments',

  components: {
    EcmChatAttachments,
    EcmChatConversations
  }
};
</script>