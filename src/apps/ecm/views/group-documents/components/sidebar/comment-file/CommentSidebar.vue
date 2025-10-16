<template>
  <div
    class='column-gap-2 flex flex-row flex-shrink-0 justify-content-between ml-auto widget-sidebar'
    :class='expandedSidebar ? "w-27rem" : ""'
    :style='expandedSidebar ? "" : "width: 2.125rem;"'>
    <div
      class='border-round flex flex-column h-full overflow-hidden surface-200 w-0 w-full widget-content'>
      <CommentFileGroup v-if='expandedSidebar'/>
    </div>

    <CommentSidebarMenu
      :expanded-sidebar='expandedSidebar'
      :widget-component='widgetComponent'
      @toggle-expand-sidebar='toggleExpandSidebar'/>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';

import CommentFileGroup from '@/apps/ecm/views/components/view-file/CommentFileGroup.vue';
import CommentSidebarMenu
  from '@/apps/ecm/views/group-documents/components/sidebar/comment-file/CommentSidebarMenu.vue';

const expandedSidebar = ref(true);
const widgetComponent = ref('');

function toggleExpandSidebar() {
  expandedSidebar.value = !expandedSidebar.value;
}

</script>

<script lang='ts'>

export default { name: 'CommentSidebar', };
</script>