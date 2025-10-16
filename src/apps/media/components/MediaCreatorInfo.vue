<template>
  <div class='align-items-center flex gap-2'>
    <!--    <AppUser-->
    <!--      v-if='userId'-->
    <!--      ref='appUserRef'-->
    <!--      avatar-size='3'-->
    <!--      :user-id='userId'/>-->
    <div>
      <div
        v-if='userId'
        class='font-semibold text-gray-600'>{{ appUserRef?.user?.fullName }}
      </div>
      <div>{{ moment(createdTime).format('DD/MM/yyyy HH:mm') }}</div>
    </div>
  </div>
</template>

<script lang='ts' setup>

import moment from 'moment/moment';
import { ref } from 'vue';

defineProps({
  userId: {
    type: String,
    default: ''
  },
  createdTime: {
    type: [String, Date],
    default: ''
  }
});
const appUserRef = ref();
</script>

<style scoped>

</style>