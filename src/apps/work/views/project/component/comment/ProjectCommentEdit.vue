<template>
  <div class='align-items-center flex justify-content-between'>
    <div class='align-items-center flex gap-2 w-full'>
      <AppIcon
        name='edit'
        size='1.5'>
      </AppIcon>
      <div class='bg-blue-100 border-round p-1 w-full'>
        Đang chỉnh sửa
        <div class='mt-1'>
          {{ comment.content }}
        </div>
        <div>
          {{ comment.attachments?.map(e => e.name).join(", ") }}
        </div>
      </div>
    </div>
    <AppIcon
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
  }
});
const emits = defineEmits<{
  (e: 'cancelEdit',): void
}>();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());

function cancelReply() {
  emits('cancelEdit');
}
</script>

<style scoped>

</style>