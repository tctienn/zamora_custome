<template>
  <div class='card'>
    <div class='font-bold text-xl'>{{ t(`media.common.${lowerCase(props.type)}.name`) }} khác</div>
    <MediaSummaryList
      :model='medias'
      :type='type'/>
  </div>

</template>

<script setup lang='ts'>

import { lowerCase } from 'lodash';
import { type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import MediaSummaryList from '@/apps/media/components/MediaSummaryList.vue';
import { mediasByStatus } from '@/apps/media/graphql/media';
import { type IMedia, MediaStatus, MediaType } from '@/apps/media/model/media';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  type: {
    type: String as PropType<MediaType>,
    required: true
  }
});
const { t } = useI18n();
const pageable = reactive<Pageable>({
  page: 0,
  size: 6,
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
const route = useRoute();
const medias = ref<IMedia[]>([]);
const {
  onResult: onResultMedias,
  load: mediasLoad,
  result: mediasRs,
  refetch
} = mediasByStatus();

onResultMedias(() => {
  const newMedias = mediasRs.value?.mediasByStatus.edges.map((edge: Edge<IMedia>) => edge.node) || [];
  medias.value = [
    ...newMedias.filter((media: any) => media.id !== route.params.id)
  ];
});

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      refetch();
    }
  },
  { immediate: true }
);

mediasLoad(undefined, {
  keyword: '',
  type: props.type,
  status: MediaStatus.APPROVED,
  pageable: pageable
});
</script>

<style scoped>

</style>