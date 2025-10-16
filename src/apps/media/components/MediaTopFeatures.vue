<template>
  <Carousel
    :autoplay-interval='model.length > 2 ? 3000: undefined'
    circular
    :num-visible='Math.min(2, model.length)'
    :value='model'>
    <template #item='{data}'>
      <router-link :to='{name: `Media${startCase(camelCase(type))}Detail`, params: {id: data.id}}'>
        <div class='media-wrapper p-2 relative'>
          <ImageOrSkeleton
            height='15rem'
            :src='generatePreviewFileUrl(data.thumbnail)'
            :title='data.title'>
          </ImageOrSkeleton>
          <div class='overlay-info p-3 text-white'>
            <div class='font-bold media-title text-xl'>{{ data.title }}</div>
            <MediaCreatorInfo
              :created-time='data.publishDate'
              :user-id='data.publisher'/>
          </div>
        </div>
      </router-link>

    </template>
  </Carousel>
</template>

<script lang='ts' setup>
import { camelCase, startCase } from 'lodash';
import type { PropType } from 'vue';

import ImageOrSkeleton from '@/apps/media/components/ImageOrSkeleton.vue';
import MediaCreatorInfo from '@/apps/media/components/MediaCreatorInfo.vue';
import { type IMedia, MediaType } from '@/apps/media/model/media';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';

defineProps({
  model: {
    type: Array as PropType<IMedia[]>,
    required: true
  },
  type: {
    type: String as PropType<MediaType>,
    required: true
  }
});
</script>

<style lang='scss' scoped>
.media-wrapper {
  &:hover {
    .media-title {
      color: var(--primary-color);
    }
  }
}

.overlay-info {
  position: absolute;
  bottom: 0;
  left: 0;
  margin-right: 7px;
  margin-left: 7px;
  margin-bottom: 7px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6); // màu đen trong suốt
  backdrop-filter: blur(2px); // tuỳ chọn: làm mờ nền sau
  color: white;
}
</style>
