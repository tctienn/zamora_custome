<template>
  <div class='border-round card p-2'>
    <router-link
      class='font-bold text-primary text-xl'
      :to='{name: "MediaAnnouncementView"}'>
      {{ t('media.common.announcement.announcementInternal') }}
    </router-link>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <ul class='flex flex-column gap-3 m-0 pl-2 pl-4'>
      <li
        v-for='media in medias'
        :key='media.title'
        class='cursor-pointer hover:text-blue-600'>
        <router-link :to='{name: `MediaAnnouncementDetail`, params: {id: media.id}}'>
          {{ media.title }} ({{ moment(media.publishDate).format('DD/MM/YYYY HH:mm:ss') }})
        </router-link>
      </li>
    </ul>
    <!--    <router-link
          class='font-italic hover:text-primary-700 p-2 text-primary'
          :to='{name: "MediaAnnouncementView"}'>
          {{ t('common.viewAll') }}
        </router-link>-->
  </div>

</template>

<script lang='ts' setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { mediasByStatus } from '@/apps/media/graphql/media';
import { type IMedia, MediaStatus, MediaType } from '@/apps/media/model/media';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n();
const { moment } = useMoment();
const pageable = reactive<Pageable>({
  page: 0,
  size: 5,
  sort: [
    {
      property: 'publishDate',
      direction: Direction.DESC
    },
    {
      property: 'createdTime',
      direction: Direction.DESC
    }
  ]
});
const {
  onResult: mediasOnResult,
  load: mediasLoad
} = mediasByStatus();
const medias = ref();
mediasOnResult((res) => {
  medias.value = res.data.mediasByStatus.edges.map((edge: Edge<IMedia>) => edge.node) || [];
});

mediasLoad(undefined, {
  keyword: '',
  type: MediaType.ANNOUNCEMENT,
  status: MediaStatus.APPROVED,
  pageable: pageable
});

</script>

<style scoped>

</style>