<template>
  <div
    ref='scrollContainer'
    class='flex flex-column gap-3 h-full overflow-auto'
    :style='contentStyle'>
    <CommentDocItem
      v-for='comment in sortedComments'
      :key='comment?.chatId'
      :comment='comment'>
    </CommentDocItem>
  </div>
</template>

<script lang='ts' setup>
import { inject, nextTick, type PropType, ref, watch } from 'vue';

import type { DocComment } from '@/apps/mission/model/doc/doc-in';

import CommentDocItem from './comment-doc-item/CommentDocItem.vue';

const props = defineProps({
  comments: {
    type: Array as PropType<DocComment[]>,
    default: () => []
  },
});
const sortedComments = ref<DocComment[]>([]);
const scrollContainer = ref<HTMLElement | null>(null);

watch(() => props.comments, (comments) => {
  sortedComments.value = sortComments(comments);
  if (scrollContainer.value) {
    scrollToEnd();
  }
}, { immediate: true });

function sortComments(comments: DocComment[]): DocComment[] {
  return comments.sort((a, b) => {
    return (a?.createdTime || 0) > (b?.createdTime || 0) ? 1 : (a?.createdTime || 0) == (b?.createdTime || 0) ? 0 : -1;
  });
}

function scrollToEnd() {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTo({
        top: scrollContainer.value.scrollHeight,
        behavior: 'smooth',
      });
    }
  });
}

const contentStyle = inject('contentStyle', {});
</script>

<style scoped>

</style>
