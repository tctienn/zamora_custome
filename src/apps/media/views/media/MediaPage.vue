<template>
  <div
    class='h-full overflow-y-auto'
    @scrollend='scroll'>
    <MediaTopFeatures
      v-if='features&& features.length'
      :model='features'
      :type='type'/>

    <MediaSummaryList
      :model='medias'
      :type='type'/>
  </div>

</template>

<script lang='ts' setup>
import { computed, inject, type PropType, reactive, ref, watch } from 'vue';

import MediaSummaryList from '@/apps/media/components/MediaSummaryList.vue';
import MediaTopFeatures from '@/apps/media/components/MediaTopFeatures.vue';
import { featuredMedias, mediasByStatus } from '@/apps/media/graphql/media';
import { type IMedia, MediaStatus, MediaType } from '@/apps/media/model/media';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  type: {
    type: String as PropType<MediaType>,
    required: true
  }
});
const searchTerm = inject('searchTerm', ref(''));
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: []
});
const medias = ref<IMedia[]>([]);
const totalMedia = ref(0);

const { result: featuredRs } = featuredMedias(props.type);
const {
  onResult: onResultMedias,
  load: mediasLoad,
  result: mediasRs,
} = mediasByStatus();

const features = computed(() => featuredRs.value?.featuredMedias);

onResultMedias(() => {
  medias.value = [...medias.value, ...mediasRs.value?.mediasByStatus.edges.map((edge: Edge<IMedia>) => edge.node) || []];
  totalMedia.value = mediasRs.value?.mediasByStatus.totalCount || 0;
});

mediasLoad(undefined, {
  keyword: '',
  type: props.type,
  status: MediaStatus.APPROVED,
  pageable: pageable
});

function moreMedias() {
  if (medias.value.length < totalMedia.value) {
    pageable.page++;
  }
}

function scroll(e: Event) {
  e.target instanceof HTMLElement && e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight && moreMedias();
}

watch(searchTerm, (newValue) => {
  medias.value = [];
  mediasLoad(undefined, {
    keyword: newValue,
    type: props.type,
    status: MediaStatus.APPROVED,
    pageable: pageable
  });
});

</script>
