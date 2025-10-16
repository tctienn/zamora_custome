<template>
  <div class='flex flex-column'>
    <span
      class='white-space-pre-wrap'>
      <template
        v-for='(split, index) in splitMessage'
        :key='index'>
        <a
          v-if='split.isLink'
          class='underline'
          :href='split.href'
          target='_blank'>{{ split.text }}</a>
        <template v-else>{{ split.text }}</template>
      </template>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, type PropType, ref } from 'vue';

import type { ProjectDiscussionInterface } from '@/apps/work/model/projectDiscussion';
import { convertLinkContent } from '@/common/helpers/utils';
import type { SplitLinkContent } from '@/common/model';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  item: {
    type: Object as PropType<ProjectDiscussionInterface>,
    default: {} as ProjectDiscussionInterface
  }
});

const { user } = useUserStore();

const splitMessage = ref<SplitLinkContent[]>([]);

onMounted(() => {
  if (props.item) {
    const { content } = props.item;
    splitMessage.value = convertLinkContent(content);
  }
});

</script>

<script lang="ts">
export default { name: 'LinkMessage' };
</script>