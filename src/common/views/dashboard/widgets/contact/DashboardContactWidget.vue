<template>
  <SystemDashboardWidget :widget='widget'>

    <!--    <template #header-action>-->
    <!--      <ButtonIcon-->
    <!--        icon='add_circle'-->
    <!--        rounded-->
    <!--        text/>-->
    <!--    </template>-->

    <template #body>
      <div class='flex flex-column row-gap-2'>
        <router-link
          v-for='contact in contacts'
          :key='contact.id'
          class='border-round-xl color-inherit cursor-pointer flex flex-column hover:surface-100 px-2 py-1'
          :to='{name: "AppChat", params: {conversationId: contact.id}}'>
          <div class='column-gap-2 flex flex-row'>
            <ChatAvatar :item='contact' />
            <div class='flex flex-column'>
              <span class='color-link font-bold line-number-2'>{{ contact.name }}</span>
              <small
                v-if='contact.lastMessage'
                class='font-italic opacity-80'>{{ convertReadableDate(new Date(contact.lastMessage?.sentAt)) }}</small>
            </div>
          </div>
        </router-link>
      </div>
    </template>

    <template #footer>
      <router-link
        class='align-self-end font-italic mx-3 my-1 text-color underline'
        :to='{name: "AppChat"}'>
        <small>{{ `${toLower(t("common.viewMore"))}` }}</small>
      </router-link>
    </template>

  </SystemDashboardWidget>
</template>

<script setup lang='ts'>
import { get, slice, toLower } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatAvatar from '@/apps/chat/components/ChatAvatar.vue';
import { getChatConversationsGraphql } from '@/common/api/graphql/dashboard-widget-graphql';
import { convertReadableDate } from '@/common/helpers/utils';
import type { ChatConversation, WidgetInstance } from '@/common/model';
import SystemDashboardWidget from '@/common/views/dashboard/component/SystemDashboardWidget.vue';

const props = defineProps({
  widget: {
    type: Object as PropType<WidgetInstance>,
    default: {} as WidgetInstance
  }
});

const contacts = ref<ChatConversation[]>([]);

const { t } = useI18n();

const { onResult: getChatConversationsResult } = getChatConversationsGraphql();
getChatConversationsResult((response) => {
  contacts.value = slice(get(response, 'data.chatConversations', []), 0, props.widget?.recordNumber ?? 3);
});
</script>

<script lang='ts'>
export default { name: 'DashboardContactWidget' };
</script>