<template>
  <Toolbar class='align-content-center h-4rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2 py-2'>
        <AppIcon
          name='cake'
          size='2'
          style='color: deeppink'/>
        <h5 class='m-0'>Sự kiện | Sinh nhật</h5>
      </div>
    </template>
  </Toolbar>

  <div v-if='birthdayInTodayFilter?.length > 0'>
    <h6 class='my-3'>
      Sinh nhật vào hôm nay: {{ moment(new Date()).format('DD/MM/yyyy') }}
    </h6>
    <div class='grid-5'>
      <BirthdayItem
        v-for='user in birthdayInTodayFilter'
        :key='user?.id'
        :is-today='true'
        :user='user'/>
    </div>
  </div>

  <div
    v-for='(month, index) in birthdayMonthsFilter'
    :key='index'
    class='mt-1'>
    <div
      v-if='month?.length > 0'
      class='align-items-center flex justify-content-between'>
      <h6 class='my-3'>
        THÁNG
        {{
          moment()
            .month((moment().month() + index) % 12)
            .format('M')
        }}
      </h6>
      <span class='number-user'>{{ month?.length }}</span>
    </div>
    <div class='grid-5'>
      <BirthdayItem
        v-for='user in month'
        :key='user?.id'
        :user='user'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import { inject, ref, watch } from 'vue';

import { getUserBirthdays } from '@/apps/media/graphql/user-birthday';
import { sortUsersByBirthday } from '@/apps/media/helpers/birthday';
import BirthdayItem from '@/apps/media/views/birthday/BirthdayItem.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { User } from '@/common/model/User';

const { moment } = useMoment();
const searchTerm = inject('searchTerm', ref(''));
const birthdayInToday = ref();
const {
  onResult: getUserBirthdaysResult,
  load: getUserBirthdaysLoad
} = getUserBirthdays();
const birthdayMonths = ref<Array<any>>(Array.from({ length: 12 }, () => []));

const birthdayInTodayFilter = ref();
const birthdayMonthsFilter = ref<Array<any>>(Array.from({ length: 12 }, () => []));

getUserBirthdaysResult((res) => {
  const birthdayData = get(res, 'data.getUserBirthdays', { today: [] });
  
  birthdayInTodayFilter.value = birthdayData.today;
  birthdayInToday.value = birthdayData.today;

  for (let i = 0; i < 12; i++) {
    birthdayMonths.value[i] =
      sortUsersByBirthday(birthdayData[`month${i}`]) || [];
  }

  birthdayData.today.length > 0
  && removeDuplicates(birthdayInToday.value, birthdayMonths.value[0]);
  birthdayMonthsFilter.value = birthdayMonths.value;
});
getUserBirthdaysLoad();

function removeDuplicates(todayUsers: User[], monthUsers: User[]) {
  todayUsers.forEach((todayUser) => {
    const index = monthUsers.findIndex(
      (monthUser) => monthUser.id === todayUser.id,
    );
    if (index !== -1) {
      monthUsers.splice(index, 1);
    }
  });
}

watch(searchTerm, (newValue) => {
  const searchValue = newValue.trim().toLowerCase();

  birthdayInTodayFilter.value = birthdayInToday.value.filter((user: any) =>
    user.fullName.toLowerCase().includes(searchValue)
  );

  birthdayMonthsFilter.value = birthdayMonths.value.map((month) =>
    month.filter((user: any) =>
      user.fullName.toLowerCase().includes(searchValue)
    )
  );
});

</script>

<style scoped>
.grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}
</style>
