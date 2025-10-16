<template>
  <div class='h-full surface-0'>
    <DataView
      data-key='id'
      layout='grid'
      style='height: 100%'
      :value='model'>
      <template #empty>
        <EmptyResult>
          <h4>{{ t('common.emptyRecords', { itemType: t(`media.common.${type?.toLowerCase() || ''}.name`) }) }}</h4>
        </EmptyResult>
      </template>
      <template #grid='{items}'>
        <div class='grid grid-nogutter'>
          <template
            v-for='(item) in items'
            :key='item.id'>

            <div class='col-12 flex gap-2 media-wrapper p-2 xl:col-6'>
              <router-link :to='{name: `Media${startCase(camelCase(type))}Detail`, params: {id: item.id}}'>
                <ImageOrSkeleton
                  height='12rem'
                  :src='generatePreviewFileUrl(item.thumbnail)'
                  style='flex: 0 0 auto; border-radius: 0'
                  :title='item.title'
                  width='20rem'/>
              </router-link>

              <div class='flex flex-column gap-2'>
                <router-link
                  class='font-bold media-title text-xl'
                  :to='{name: `Media${startCase(camelCase(type))}Detail`, params: {id: item.id}}'>{{ item.title }}
                </router-link>
                <MediaCreatorInfo
                  :created-time='item.publishDate'
                  :user-id='item.publisher'></MediaCreatorInfo>
                <div class='summary text-secondary'>{{ item.summary }}</div>
              </div>
            </div>

          </template>
        </div>

      </template>
    </DataView>
  </div>
</template>

<script lang='ts' setup>
import { camelCase, startCase } from 'lodash';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import ImageOrSkeleton from '@/apps/media/components/ImageOrSkeleton.vue';
import MediaCreatorInfo from '@/apps/media/components/MediaCreatorInfo.vue';
import type { IMedia } from '@/apps/media/model/media';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';

defineProps({
  model: {
    type: Array as PropType<IMedia[]>,
    required: true
  },
  type: {
    type: String as PropType<string>,
    required: true
  }
});
const { t } = useI18n();
</script>

<style scoped>
.media-wrapper {
  &:hover {
    .media-title {
      color: var(--primary-color);
    }
  }
}

.summary {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
}
</style>