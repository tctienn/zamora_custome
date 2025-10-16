<template>
  <div class='border-round card p-2'>
    <div class='flex font-semibold justify-content-between pt-0 text-primary text-xl'>
      <div>{{ t('media.menu.birthday') }}</div>
      <div class='flex gap-1 text-sm'>
        <div class='align-content-end'>Tháng {{ new Date().getMonth() + 1 }}</div>
      </div>
    </div>

    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>

    <Carousel
      :autoplay-interval='3000'
      circular
      class='mt-2'
      :num-scroll='1'
      :num-visible='2'
      :show-indicators='false'
      :show-navigators='false'
      :value='birthdayMonth'>
      <template #item='slotProps'>
        <BirthdayItem
          :key='slotProps.data?.id'
          class='h-full mx-1'
          :is-in-dashboard='true'
          :is-today="moment(new Date(slotProps.data?.birthDay)).format('MM-DD') == moment(new Date()).format('MM-DD')"
          :user='slotProps.data'
          @click='goToBirthdayService'/>
      </template>
    </Carousel>
  </div>
</template>

<script lang='ts' setup>
import { get } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { getUserBirthdays } from '@/apps/media/graphql/user-birthday';
import { sortUsersByBirthday } from '@/apps/media/helpers/birthday';
import BirthdayItem from '@/apps/media/views/birthday/BirthdayItem.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const { moment } = useMoment();
const { t } = useI18n();
const birthdayMonth = ref();
const router = useRouter();
const {
  onResult: getUserBirthdaysResult,
  load: getUserBirthdaysLoad
} = getUserBirthdays();

getUserBirthdaysResult((res) => {
  const birthdayData = get(res, 'data.getUserBirthdays', { today: [] });
  birthdayMonth.value = sortUsersByBirthday(birthdayData.month0) || [];
});

getUserBirthdaysLoad(undefined, { fullName: '' });

function goToBirthdayService() {
  router.push({ path: '/media/birthday' });
}
</script>

<style scoped></style>
