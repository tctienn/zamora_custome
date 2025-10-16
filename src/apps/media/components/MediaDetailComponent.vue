<template>
  <div class='card flex flex-column gap-2'>
    <div class='font-bold text-xl'>{{ model.title }}</div>
    <MediaCreatorInfo
      :created-time='model.publishDate'
      :user-id='model.publisher'></MediaCreatorInfo>
    <p class='text-color-secondary'>{{ model.summary }}</p>
    <p v-sanitize-html='model.content'></p>
    <div
      v-if='model.listFileAttachments && model.listFileAttachments.length'>
      <UploadFilesGrid
        :is-view='true'
        :list-file='model.listFileAttachments'>
      </UploadFilesGrid>
    </div>
    <div
      v-if='model.childrenMedia?.length > 0'>
      <SubMedia
        :id='model.id'
        :is-view='true'
        :media-type='type'
        :sub-media='model.childrenMedia'
        :sub-media-from-d-b='model.subMedias'>
      </SubMedia>
    </div>
    <div
      v-if='(model.isAllowsEmojis && model.emotions) || model.viewed'
      class='flex font-semibold justify-content-between'>
      <EmotionComponent
        v-if='model.isAllowsEmojis && model.emotions'
        :emotions='model.emotions || []'/>
      <div
        v-if='model.viewed'
        style='cursor: pointer'
        @click='dialogViewedUser = true;'>
        {{ t('media.common.views', { count: model.viewed?.length }) }}
      </div>
    </div>

    <CommentMain
      v-if='model.isAllowsComment'
      :media-type='type'
      :object-id='model.id'></CommentMain>
  </div>

  <OtherMedias :type='type'/>

  <DialogViewed
    v-model:visible='dialogViewedUser'
    :list-viewed='model.viewed || []'/>
</template>

<script lang='ts' setup>

import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CommentMain from '@/apps/media/components/comment/CommentMain.vue';
import EmotionComponent from '@/apps/media/components/emotion/EmotionComponent.vue';
import MediaCreatorInfo from '@/apps/media/components/MediaCreatorInfo.vue';
import OtherMedias from '@/apps/media/components/OtherMedias.vue';
import { type IMedia, MediaType } from '@/apps/media/model/media';
import SubMedia from '@/apps/media/views/media/SubMedia.vue';
import DialogViewed from '@/common/components/custom/DialogViewed.vue';
import UploadFilesGrid from '@/common/components/custom/UploadFilesGrid.vue';

defineProps({
  model: {
    type: Object as PropType<IMedia>,
    required: true
  },
  type: {
    type: String as PropType<MediaType>,
    required: true
  }
});
const dialogViewedUser = ref(false);
const { t } = useI18n();
</script>

<style scoped>
:deep(img) {
  max-width: 100%;
}
</style>
