<template>
  <div class='flex flex-column h-full overflow-hidden'>
    <EcmGroupWidgetHeader
      :left-button='headerButton'
      :title='t("ecm.group.topicWidget.deletedTopics")'/>

    <div class='flex flex-column h-full mt-3 overflow-hidden row-gap-3'>
      <div class='column-gap-1 flex flex-row flex-wrap row-gap-2'>
        <template v-if='topics.length'>
          <Chip
            v-for='topic in topics'
            :key='topic.id'
            class='align-items-center cursor-pointer flex flex-row vertical-align-middle'
            :class='{"bg-primary": selectedTopic.id === topic.id}'
            removable
            rounded
            @remove='removeTopic(topic)'>
            <div class='align-items-center flex flex-row'>
              <span
                class='py-1'
                @click='toggleTopic(topic)'>{{ `# ${topic.name}` }}</span>

              <AppIcon
                class='ml-2 mt-1'
                name='refresh'
                size='1.4'
                @click='restoreTopic(topic)'/>
            </div>
          </Chip>
        </template>

        <div
          v-else
          class='flex flex-row justify-content-center w-full'>
          <span>{{ t("ecm.group.topicWidget.noTopics") }}</span>
        </div>
      </div>

      <template v-if='Object.keys(selectedTopic).length'>
        <Divider class='my-0'/>

        <EcmGroupTopicComment :topic='selectedTopic'/>
      </template>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EcmGroupWidgetHeader from '@/apps/ecm/views/group-documents/components/sidebar/widgets/EcmGroupWidgetHeader.vue';
import EcmGroupTopicComment
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/topic/comment/EcmGroupTopicComment.vue';
import EventBus from '@/common/helpers/event-bus';
import type { GroupTopic } from '@/common/model/group';

defineProps({
  topics: {
    type: Array as PropType<GroupTopic[]>,
    default: () => []
  }
});

const emits = defineEmits(['change-viewer-type', 'update-topics']);

const { t } = useI18n();

const headerButton = {
  icon: 'arrow_back',
  label: t('common.back'),
  command: () => {
    emits('change-viewer-type', 'EcmGroupTopicWidget');
  }
};

const selectedTopic = ref<GroupTopic>({} as GroupTopic);

function toggleTopic(topic: GroupTopic) {
  if (JSON.stringify(selectedTopic.value) === JSON.stringify(topic)) {
    selectedTopic.value = {} as GroupTopic;
  } else {
    selectedTopic.value = topic;
  }
}

function restoreTopic(topic: GroupTopic) {
  EventBus.emit('ecm-group-restore-topic', topic);
  selectedTopic.value = {} as GroupTopic;
}

function removeTopic(topic: GroupTopic) {
  EventBus.emit('ecm-group-remove-topic', topic);
  selectedTopic.value = {} as GroupTopic;
}
</script>

<script lang='ts'>
export default { name: 'EcmGroupTopicWidgetTrash' };
</script>