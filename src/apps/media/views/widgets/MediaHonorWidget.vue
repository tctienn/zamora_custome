<template>
  <div class='border-round card p-2'>
    <div class='font-bold text-primary text-xl'>
      {{ t('media.menu.mediaHonors') }}
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <Carousel
      :autoplay-interval='3000'
      circular
      class='mt-2'
      :num-scroll='1'
      :num-visible='1'
      :show-indicators='false'
      :show-navigators='false'
      :value='listHonor'
      @click='goToBirthdayService'>
      <template #item='slotProps'>
        <HonorCardTypeUser
          v-for='(user, index) in slotProps.data.users'
          :key='index'
          class='m-1'
          :honor='slotProps.data'
          :user-id='user'/>
        <HonorCardTypeOrganization
          v-for='(organization, index) in slotProps.data.organizations'
          :key='index'
          class='m-1'
          :honor='slotProps.data'
          :organization-code='organization'/>
      </template>
    </Carousel>
  </div>
</template>

<script lang='ts' setup>
import { get } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { getListHonorByIsHighlight } from '@/apps/media/graphql/honor';
import HonorCardTypeOrganization from '@/apps/media/views/honor/HonorCardTypeOrganization.vue';
import HonorCardTypeUser from '@/apps/media/views/honor/HonorCardTypeUser.vue';

const { t } = useI18n();
const router = useRouter();
const listHonor = ref();
const { onResult: getListHonorByIsHighlightResult } = getListHonorByIsHighlight();

getListHonorByIsHighlightResult((res) => {
  const data = get(res, 'data.getListHonorByIsHighlight', { honorsByYear: [] });

  if (!data.honorsByYear.length) {
    listHonor.value = [];
    return;
  }

  const maxYear = Math.max(...data.honorsByYear.map((item: any) => item.year));

  const honors =
    data.honorsByYear.find((item: any) => item.year === maxYear)?.honors || [];

  const normalizeHonors = (honors: any[]) => {
    return honors.flatMap((honor) => {
      if (honor.users?.length) {
        return honor.users.map((userId: string) => ({
          ...honor,
          users: [userId],
        }));
      }
      if (honor.organizations?.length) {
        return honor.organizations.map((orgId: string) => ({
          ...honor,
          organizations: [orgId],
        }));
      }
      return [honor];
    });
  };
  listHonor.value = normalizeHonors(honors);
});

function goToBirthdayService() {
  router.push({ path: '/media/honors' });
}
</script>

<style scoped></style>
