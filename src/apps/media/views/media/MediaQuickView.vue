<template>
  <div class='grid justify-content-center'>
    <div class='col-12 md:col-10 xl:col-8'>
      <ButtonIcon
        class='btn-create'
        icon='arrow_back'
        :label='t("common.back")'
        text
        @click='goBack'/>
      <MediaDetailComponent
        :model='{...media, isAllowsComment: false}'
        :type='type'/>
    </div>
  </div>

</template>

<script lang='ts' setup>

import { upperCase } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import MediaDetailComponent from '@/apps/media/components/MediaDetailComponent.vue';
import { previewMedia } from '@/apps/media/graphql/media';
import { type IMedia, MediaType } from '@/apps/media/model/media';

const { t } = useI18n() || {
  t: (key: string) => {
    return key;
  }
};

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const type = getTypeFromRoute();
const { result } = previewMedia(type, id as string);
const media = computed(() => result.value?.media || {} as IMedia);

const goBack = () => {
  router.push({ name: 'MediaConfigAnnouncement' });
};

function getTypeFromRoute() {
  return upperCase(route.name?.toString().replace('Media', '').replace('QuickView', '')) as MediaType;
}
</script>

<style scoped>

</style>