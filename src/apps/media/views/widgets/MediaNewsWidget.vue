<template>
  <div class='border-round card p-2'>
    <router-link
      class='font-bold text-primary text-xl'
      :to='{name: "MediaAnnouncementView"}'>
      {{ t('media.common.news.newInternal') }}
    </router-link>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>

    <Galleria
      auto-play
      circular
      indicators-position='bottom'
      show-indicators-on-item
      :show-item-navigators='true'
      :show-item-navigators-on-hover='true'
      :show-thumbnails='false'
      :value='features'>
      <template #item='{item}'>
        <div
          class='w-full'>
          <div class='media-wrapper relative'>
            <ImageOrSkeleton
              height='15rem'
              :src='generatePreviewFileUrl(item.thumbnail)'
              :title='item.title'>
            </ImageOrSkeleton>
          </div>
        </div>
      </template>
      <template #caption='slotProps'>
        <router-link
          class='block cursor-pointer font-bold mb-2 text-xl'
          :to="{ name: 'MediaNewsDetail', params: { id: slotProps.item.id } }">
          {{ slotProps.item.title }}
        </router-link>
        <p class='text-white'>{{ slotProps.item.alt }}</p>
      </template>
    </Galleria>
  </div>
</template>

<script lang='ts' setup>

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import ImageOrSkeleton from '@/apps/media/components/ImageOrSkeleton.vue';
import { featuredMedias } from '@/apps/media/graphql/media';
import { MediaType } from '@/apps/media/model/media';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';

const { t } = useI18n();
const { result: featuredRs } = featuredMedias(MediaType.NEWS);
const features = computed(() => featuredRs.value?.featuredMedias);
</script>

<style scoped>
.media-wrapper {
  &:hover {
    .media-title {
      color: var(--primary-color);
    }
  }
}
</style>