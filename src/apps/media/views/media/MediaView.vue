<template>
  <div class='grid justify-content-center'>
    <div class='col-12 md:col-10 xl:col-8'>
      <MediaDetailComponent
        :model='media'
        :type='type'/>
    </div>
  </div>

</template>

<script lang='ts' setup>

import { upperCase } from 'lodash';
import { computed, provide, watch } from 'vue';
import { useRoute } from 'vue-router';

import MediaDetailComponent from '@/apps/media/components/MediaDetailComponent.vue';
import { addEmotion } from '@/apps/media/graphql/emotion';
import { readMedia } from '@/apps/media/graphql/media';
import { type IMedia, MediaType } from '@/apps/media/model/media';

const route = useRoute();
const type = getTypeFromRoute();
const {
  result,
  refetch
} = readMedia(type, route.params.id as string);
const media = computed(() => result.value?.readMedia || {} as IMedia);

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      refetch({
        type,
        id: newId as string
      });
    }
  },
  { immediate: true }
);

function saveEmotion(emoji: string) {
  addEmotion().mutate({
    mediaType: type,
    mediaId: route.params.id as string,
    emotionType: emoji
  }).then(() => refetch());
}

function getTypeFromRoute() {
  return upperCase(route.name?.toString().replace('Media', '').replace('Detail', '')) as MediaType;
}

provide('saveEmotion', saveEmotion);
</script>

<style scoped>

</style>