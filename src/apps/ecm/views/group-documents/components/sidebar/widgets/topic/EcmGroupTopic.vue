<template>
  <component
    :is='viewerType'
    v-if='viewerType.length'
    :topics='sortTopics'
    @change-viewer-type='changeViewerType'
    @move-first-topic-item='moveFirstTopicItem'
    @save-topic-item='saveTopicItem'/>
</template>

<script setup lang='ts'>
import { clone, cloneDeep, findIndex, get } from 'lodash';
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';

import {
  deleteTopicGraphql,
  getSubjectTopicsGraphql,
  removeTopicGraphql,
  restoreTopicGraphql
} from '@/common/api/graphql/topic-graphql';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import type { Group, GroupTopic } from '@/common/model/group';
import { type Topic, TopicType } from '@/common/model/widget/topic';

const topics = ref<GroupTopic[]>([]);
const sortTopics = computed(() => clone(topics.value)
  .sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime()));
const viewerType = ref('EcmGroupTopicWidget');

const group = inject('group', ref<Group>({} as Group));

const {
  onResult: getTopicsResult,
  onError: getTopicsError,
  refetch: getTopicsRefetch
} = getSubjectTopicsGraphql({
  subjectId: group.value.id,
  isDeleted: false,
  types: [TopicType[TopicType.GROUP]],
  limit: null
});

getTopicsResult((response) => {
  topics.value = get(response, 'data.subjectTopics', []);
});

getTopicsError((error) => {
});

function changeViewerType(type: string) {
  viewerType.value = type;
}

watch(() => viewerType.value, () => {
  if (['EcmGroupTopicWidget', 'EcmGroupTopicWidgetTrash'].includes(viewerType.value)) {
    topics.value = [];
    getTopicsRefetch({
      subjectId: group.value.id,
      isDeleted: viewerType.value !== 'EcmGroupTopicWidget',
      types: [TopicType[TopicType.GROUP]],
      limit: null
    });
  }
});

function saveTopicItem(topic: Topic) {
  const clonedTopics = cloneDeep(topics.value);
  const topicIndex = findIndex(clonedTopics, ['id', topic.id]);
  if (topicIndex >= 0) {
    clonedTopics[topicIndex] = topic;
  } else {
    clonedTopics.unshift(topic);
  }
  topics.value = clonedTopics;
}

function moveFirstTopicItem(topicId: string) {
  const clonedTopics = cloneDeep(topics.value);
  const topicIndex = findIndex(clonedTopics, ['id', topicId]);
  if (topicIndex >= 0) {
    const topic = clonedTopics[topicIndex];
    clonedTopics.splice(topicIndex, 1);
    clonedTopics.unshift(topic);
    topics.value = clonedTopics;
  }
}

function removeTopicItem(topicId: string) {
  const topicIndex = findIndex(topics.value, ['id', topicId]);
  if (topicIndex >= 0) {
    const clonedTopics = cloneDeep(topics.value);
    clonedTopics.splice(topicIndex, 1);
    topics.value = clonedTopics;
  }
}

function deleteTopic(topic: GroupTopic) {
  const {
    mutate: deleteTopicMutate,
    onDone: deleteTopicDone
  } = deleteTopicGraphql();
  deleteTopicMutate({ topicId: topic.id });

  deleteTopicDone((response) => {
    const topicId = get(response, 'data.deleteTopic.id', '');
    removeTopicItem(topicId);
    toastSuccess({});
  });
}

function restoreTopic(topic: GroupTopic) {
  const {
    mutate: restoreTopicMutate,
    onDone: restoreTopicDone
  } = restoreTopicGraphql();
  restoreTopicMutate({ topicId: topic.id });

  restoreTopicDone((response) => {
    const topicId = get(response, 'data.restoreTopic.id', '');
    removeTopicItem(topicId);
    toastSuccess({});
  });
}

function removeTopic(topic: GroupTopic) {
  const {
    mutate: removeTopicMutate,
    onDone: removeTopicDone
  } = removeTopicGraphql();
  removeTopicMutate({ topicId: topic.id });

  removeTopicDone((response) => {
    const topicId = get(response, 'data.removeTopic', '');
    removeTopicItem(topicId);
    toastSuccess({});
  });
}

onMounted(() => {
  EventBus.on('ecm-group-delete-topic', deleteTopic);
  EventBus.on('ecm-group-restore-topic', restoreTopic);
  EventBus.on('ecm-group-remove-topic', removeTopic);
});

onUnmounted(() => {
  EventBus.off('ecm-group-delete-topic', deleteTopic);
  EventBus.off('ecm-group-restore-topic', restoreTopic);
  EventBus.off('ecm-group-remove-topic', removeTopic);
});
</script>

<script lang='ts'>
import EcmGroupTopicWidget
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/topic/EcmGroupTopicWidget.vue';
import EcmGroupTopicWidgetTrash
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/topic/EcmGroupTopicWidgetTrash.vue';

export default {
  name: 'EcmGroupTopic',

  components: {
    EcmGroupTopicWidget,
    EcmGroupTopicWidgetTrash
  }
};
</script>

<style scoped lang='scss'>
:deep(.p-chip-remove-icon) {
  margin-top: 0.25rem
}
</style>