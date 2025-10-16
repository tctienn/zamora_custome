<template>
  <div class='align-items-center flex justify-content-between'>
    <div class='align-items-center flex gap-2 w-full'>
      <AppIcon
        v-if='isInInput'
        name='reply'
        size='1.5'>
      </AppIcon>
      <div class='bg-blue-100 border-round p-1 w-full'>
        {{ isInInput ? "Trả lời" : "" }} <span
          class='font-semibold'> {{ usersMoreInfo[comment.createdBy]?.fullName }}</span>
        <div class='white-space-normal word-break-break-word'>
          {{ comment.content }}
        </div>
        <div class='white-space-normal word-break-break-word'>
          {{ comment.attachments?.map(e => e.name).join(", ") }}
        </div>
      </div>
    </div>
    <AppIcon
      v-if='isInInput'
      class='border-round cursor-pointer hover:surface-hover'
      name='close'
      size='1.5'
      @click='cancelReply'>
    </AppIcon>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import type { PropType } from 'vue';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { ProjectDiscussion } from '@/apps/work/model/projectDiscussion';

const props = defineProps({
  comment: {
    type: Object as PropType<ProjectDiscussion>,
    required: true
  },
  isInInput: {
    type: Boolean,
    default: true
  }
});
const emits = defineEmits<{
  (e: 'cancelReply',): void
}>();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());

function cancelReply() {
  emits('cancelReply');
}
</script>

<style scoped>

</style>