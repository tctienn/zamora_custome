<template>
  <div class='flex flex-column h-full overflow-hidden'>
    <EcmGroupWidgetHeader
      icon='forum'
      :right-button='headerButton'
      :title='t("ecm.group.widgets.topic")'/>

    <div class='flex flex-column h-full overflow-hidden row-gap-3'>
      <div
        class='column-gap-1 flex flex-row flex-shrink-0 flex-wrap overflow-x-auto overflow-y-hidden pr-2 row-gap-2'>
        <Chip
          v-for='topic in topics'
          :key='topic.id'
          class='align-items-center align-self-start cursor-pointer flex flex-row vertical-align-middle'
          :class='{"bg-primary": selectedTopic.id === topic.id}'
          removable
          rounded
          @remove='deleteTopic(topic)'>
          <span
            class='py-1 word-break-break-word'
            @click='toggleTopic(topic)'>{{ `# ${topic.name}` }}</span>
        </Chip>
        <ButtonIcon
          v-if='!addingTopic'
          v-tooltip='t("common.create")'
          class='align-self-center h-auto p-0'
          icon='add'
          text
          @click='focusNewTopic'/>
        <div
          class='align-items-center gap-1'
          :class='addingTopic? "p-chip": "hidden"'>
          #
          <div
            ref='newTopic'
            class='div-editable'
            contenteditable
            tabindex='0'
            @keyup.enter='addTopic'
            @keyup.esc='cancelAddTopic'/>
          <AppIcon
            class='cursor-pointer mt-1'
            name='cancel'
            size='1.2'
            @click='cancelAddTopic'/>
        </div>
      </div>

      <template v-if='Object.keys(selectedTopic).length'>
        <Divider class='my-0'/>

        <EcmGroupTopicComment
          ref='ecmGroupTopicComment'
          :topic='selectedTopic'/>
      </template>

    </div>
  </div>
</template>

<script setup lang='ts'>
import { CompatClient, Stomp } from '@stomp/stompjs';
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import { inject, onMounted, onUnmounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import EcmGroupWidgetHeader from '@/apps/ecm/views/group-documents/components/sidebar/widgets/EcmGroupWidgetHeader.vue';
import EcmGroupTopicComment
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/topic/comment/EcmGroupTopicComment.vue';
import { WS_CHAT_SERVER } from '@/common/api/configService';
import { saveTopicGraphql } from '@/common/api/graphql/topic-graphql';
import AppIcon from '@/common/components/app/AppIcon.vue';
import EventBus from '@/common/helpers/event-bus';
import type { Group, GroupTopic, GroupTopicComment } from '@/common/model/group';
import { TopicType } from '@/common/model/widget/topic';
import { useUserStore } from '@/common/store/user';

defineProps({
  topics: {
    type: Array as PropType<GroupTopic[]>,
    default: () => []
  }
});

const emits = defineEmits(['change-viewer-type', 'save-topic-item', 'move-first-topic-item']);
const { authentication } = storeToRefs(useUserStore());

const { t } = useI18n();

const addingTopic = ref(false);
const newTopic = ref();

const selectedTopic = ref<GroupTopic>({} as GroupTopic);

const group = inject('group', ref<Group>({} as Group));

const ecmGroupTopicComment = ref();

const {
  onDone: saveTopicDone,
  mutate: saveTopicMutate
} = saveTopicGraphql();

const headerButton = {
  icon: 'delete',
  label: t('ecm.group.topicWidget.deletedTopics'),
  command: () => {
    emits('change-viewer-type', 'EcmGroupTopicWidgetTrash');
  }
};

function saveTopic(name: string) {
  if (name) {
    saveTopicMutate({
      topic: {
        name: name,
        type: TopicType[TopicType.GROUP],
        subjectId: group.value.id
      }
    });
  }
}

saveTopicDone((response) => {
  const topic = get(response, 'data.saveTopic', {});
  emits('save-topic-item', topic);
});

function focusNewTopic() {
  addingTopic.value = true;
  setTimeout(() => newTopic.value?.focus(), 0);
}

function cancelAddTopic() {
  addingTopic.value = false;
  newTopic.value.innerHTML = '';
}

function addTopic(event: Event) {
  const name = (event.target as HTMLElement).innerText;
  saveTopic(name);
  cancelAddTopic();
}

function toggleTopic(topic: GroupTopic) {
  if (JSON.stringify(selectedTopic.value) === JSON.stringify(topic)) {
    selectedTopic.value = {} as GroupTopic;
  } else {
    selectedTopic.value = topic;
  }
}

let socket: WebSocket;
let stompClient: CompatClient;

const CONVERSATION_DESTINATION = '/app/group-topic/send-comment';

function connectChatServer() {
  socket = new WebSocket(WS_CHAT_SERVER);
  stompClient = Stomp.over(socket);
  stompClient.connect({ Authorization: authentication.value }, (frame: string) => {
    return frame;
  });
}

function disconnectChatServer() {
  stompClient?.disconnect();
  socket?.close();
}

function sendMessage(comment: GroupTopicComment) {
  if (selectedTopic.value) {
    stompClient.send(CONVERSATION_DESTINATION, {}, JSON.stringify({
      ...comment,
      ...{
        groupId: group.value.id,
        topicId: selectedTopic.value.id,
      }
    }));
  }
}

function subscribeTopic(topicId: string) {
  const destination = `/group/topic/${group.value.id}/${topicId}`;
  stompClient.subscribe(destination, function (response) {
    const comment: GroupTopicComment = JSON.parse(response.body);
    if (comment.topicId === selectedTopic.value.id) {
      ecmGroupTopicComment.value.comments.unshift(comment);
      ecmGroupTopicComment.value.loadedComment += 1;
      ecmGroupTopicComment.value.totalComment += 1;
      ecmGroupTopicComment.value.manualAddComment += 1;
    }

    ecmGroupTopicComment.value?.clearCommentContent();

    emits('move-first-topic-item', topicId);
  }, { id: destination });
}

function unsubscribeTopic(topicId: string) {
  stompClient.unsubscribe(`/group/topic/${group.value.id}/${topicId}`);
}

watch(() => selectedTopic.value.id, (_, previousTopicId) => {
  if (selectedTopic.value.id) {
    subscribeTopic(selectedTopic.value.id);
  }
  if (previousTopicId) {
    unsubscribeTopic(previousTopicId);
  }

  ecmGroupTopicComment.value?.resetState();
});

onMounted(() => {
  EventBus.on('send-topic-comment', sendMessage);
  connectChatServer();
});

onUnmounted(() => {
  EventBus.off('send-topic-comment', sendMessage);
  disconnectChatServer();
});

function deleteTopic(topic: GroupTopic) {
  EventBus.emit('ecm-group-delete-topic', topic);
  selectedTopic.value = {} as GroupTopic;
}
</script>

<script lang='ts'>
export default { name: 'EcmGroupTopicWidget' };
</script>

<style scoped lang='scss'>
.div-editable {
  &:focus {
    outline: none;
  }
}
</style>