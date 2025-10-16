<template>
  <div
    v-if='avatar&&!error'
    class='image-container'>
    <img
      alt='avatar'
      :src='avatar'
      :style='{ width }'
      @error='error = true'/>
  </div>
  <img
    v-else
    alt='avatar'
    src='@/common/assets/images/avatar-default.png'
    :style='{ width }'/>
</template>

<script lang='ts' setup>
import { ref } from 'vue';

defineProps({
  avatar: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '4rem'
  },
});

const error = ref(false);
</script>

<style scoped>
.image-container {
  width: v-bind(width);
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 2px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>