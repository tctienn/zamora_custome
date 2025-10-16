<template>
  <Toolbar class='align-content-center h-4rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2 py-2'>
        <AppIcon
          fill
          name='emoji_events'
          size='2'
          style='color: #fff000'/>
        <h5 class='m-0'>Sự kiện | Vinh danh</h5>
      </div>
    </template>
  </Toolbar>

  <div
    v-for='(year, index) in listHonor'
    :key='index'
    class='mt-1'>
    <h6 class='my-3'>NĂM {{ year?.year }}</h6>
    <div class='grid-4'>
      <template
        v-for='honor in year?.honors'
        :key='honor?.id'>
        <template v-if='honor.users?.length > 0'>
          <HonorCardTypeUser
            v-for='user in honor.users'
            :key='user?.id'
            :honor='honor'
            :user-id='user'/>
        </template>
        <template v-if='honor.organizations?.length > 0'>
          <HonorCardTypeOrganization
            v-for='organization in honor.organizations'
            :key='organization.id'
            :honor='honor'
            :organization-code='organization'/>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">

import { get } from 'lodash';
import { ref } from 'vue';

import { getListHonorGroupByYear } from '@/apps/media/graphql/honor';
import HonorCardTypeOrganization from '@/apps/media/views/honor/HonorCardTypeOrganization.vue';
import HonorCardTypeUser from '@/apps/media/views/honor/HonorCardTypeUser.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const listHonor = ref();
const { onResult: getListHonorGroupByYearResult } = getListHonorGroupByYear();

getListHonorGroupByYearResult((res) => {
  const data = get(res, 'data.getListHonorGroupByYear', { honorsByYear: [] });
  listHonor.value = data.honorsByYear;
});
</script>

<style scoped>
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
</style>