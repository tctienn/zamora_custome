<template>
  <div v-if='imgs.length == 1'>
    <div class='h-10rem w-full'>
      <img
        alt=''
        class='custom-image'
        :src='getPreviewFile(imgs[0].downloadPath)'>
    </div>
  </div>

  <div v-if='imgs.length == 2'>
    <div class='flex gap-1'>
      <div class='h-10rem w-full'>
        <img
          alt=''
          class='custom-image'
          :src='getPreviewFile(imgs[0].downloadPath)'>
      </div>

      <div class='h-10rem w-full'>
        <img
          alt=''
          class='custom-image'
          :src='getPreviewFile(imgs[1].downloadPath)'>
      </div>
    </div>
  </div>

  <div v-if='imgs.length == 3'>
    <div class='flex flex-column gap-1'>
      <div class='flex gap-1'>
        <div class='h-10rem w-full'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[0].downloadPath)'>
        </div>

        <div class='h-10rem w-full'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[1].downloadPath)'>
        </div>
      </div>
      <div class='h-10rem w-full'>
        <img
          alt=''
          class='custom-image'
          :src='getPreviewFile(imgs[2].downloadPath)'>
      </div>
    </div>
  </div>

  <div v-if='imgs.length == 4'>
    <div class='flex flex-column gap-1'>
      <div class='flex gap-1'>
        <div class='h-10rem overflow-hidden w-full'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(getPreviewFile(imgs[0].downloadPath))'>
        </div>

        <div class='h-10rem w-full'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[1].downloadPath)'>
        </div>
      </div>
      <div class='flex gap-1'>
        <div class='h-10rem w-full'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[2].downloadPath)'>
        </div>

        <div class='h-10rem w-full'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[3].downloadPath)'>
        </div>
      </div>
    </div>
  </div>

  <div v-if='imgs.length == 5'>
    <div class='flex flex-column gap-1'>
      <div class='flex gap-1 w-full'>
        <div class='h-10rem w-full'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[0].downloadPath)'>
        </div>

        <div class='h-10rem w-full'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[1].downloadPath)'>
        </div>
      </div>
      <div class='flex gap-1'>
        <div class='h-10rem p-0 w-4'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[2].downloadPath)'>
        </div>
        <div class='h-10rem p-0 w-4'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[3].downloadPath)'>
        </div>
        <div class='h-10rem p-0 w-4'>
          <img
            alt=''
            class='custom-image'
            :src='getPreviewFile(imgs[4].downloadPath)'>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang='ts'>
import type { PropType } from 'vue';

import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import { getPreviewFile } from '@/common/helpers/file-utils';

const props = defineProps({
  imgs: {
    type: Array as PropType<WorkAttachment[]>,
    default: [] as WorkAttachment[]
  }
});
</script>

<style scoped>
.custom-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>

<script lang='ts'>
export default { name: 'LayoutImg' };
</script>