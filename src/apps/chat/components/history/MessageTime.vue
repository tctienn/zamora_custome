<template>
  <div
    v-if='time.length'
    class='message-time py-3 relative w-full'>
    <div class='border-gray-400 border-top-1 w-full'></div>
    <div class='-translate-x-50 absolute left-50 mt-1 top-0'>
      <small class='px-3 py-1 surface-400 text-white'>
        {{ moment(time).format("DD/MM/yyyy") }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  time: {
    type: String,
    default: ''
  }
});

const { moment } = useMoment();

</script>

<script lang="ts">
export default { name: 'MessageTime' };
</script>