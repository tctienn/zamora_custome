<template>
  <AvatarUploadOnly
    ref='avatarUpload'
    :avatar-url='avatarUrl'
    :empty-image-icon='emptyImageIcon'
    :shape='shape'/>

  <div class='flex flex-row mt-2 w-full'>
    <Button
      v-tooltip.top="t('common.update')"
      class='flex-1 flex-basis-0 flex-grow-1 justify-content-center ml-5 mr-1 p-button-outlined w-auto'
      @click='upload'>
      {{ t('common.update') }}
    </Button>

    <Button
      v-tooltip.top="t('common.removeAvatar')"
      class='flex-1 flex-basis-0 flex-grow-1 justify-content-center ml-1 mr-5 p-button-outlined w-auto'
      @click='removeImage'>
      {{ t('common.removeAvatar') }}
    </Button>
  </div>

</template>

<script setup lang='ts'>
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AvatarUploadOnly from '@/common/components/custom/AvatarUploadOnly.vue';

defineProps({
  avatarUrl: {
    type: String,
    default: ''
  },
  shape: {
    type: String as PropType<'circle' | 'rectangle'>,
    default: 'circle'
  },
  emptyImageIcon: {
    type: String,
    default: 'photo_camera'
  }
});

const { t } = useI18n();
const avatarUpload = ref();

function upload() {
  avatarUpload.value.upload();
}

function removeImage(e: Event) {
  avatarUpload.value.removeImage(e);
}
</script>

<script lang='ts'>
export default { name: 'AvatarUpload' };
</script>

<style scoped>

</style>