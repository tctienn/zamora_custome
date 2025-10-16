<template>
  <div
    v-if='isLoading'
    class='align-content-center flex justify-content-center'>
    <ProgressSpinner style='height: calc(100vh - 20rem)'/>
  </div>
  <div
    v-if='!isLoading'
    class='grid-avatar overflow-auto'
    style='height: calc(100vh - 16rem)'>
    <div
      v-for='g in guest'
      :key='g'>
      <HrmAvatar
        :avatar='g?.detectedImageUrl'
        width='10rem'/>
      <div class='text-center'>
        {{ moment(g.timeStamp).format('HH:mm') }}
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, watch } from 'vue';

import { getGuestByDate } from '@/apps/hrm/api/graphql/checkin';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  selectedDate: {
    type: Date,
    default: () => new Date()
  }
});
const { moment } = useMoment();
const guest = ref();
const isLoading = ref(true);
const {
  load,
  onResult
} = getGuestByDate();
onResult((res) => {
  guest.value = res.data.getGuestByDate;
  isLoading.value = false;
});
load(undefined, { date: moment(props.selectedDate).format('yyyy-MM-DD') });
watch(() => props.selectedDate, (value) => {
  if (value) {
    isLoading.value = true;
    load(undefined, { date: moment(value).format('yyyy-MM-DD') });
  }
});

</script>

<style scoped>
.grid-avatar {
  display: grid;
  gap: 0.5rem;
}

@media (min-width: 32rem) {
  .grid-avatar {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 43rem) {
  .grid-avatar {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 65rem) {
  .grid-avatar {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 98rem) {
  .grid-avatar {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (min-width: 109rem) {
  .grid-avatar {
    grid-template-columns: repeat(10, 1fr);
  }
}
</style>