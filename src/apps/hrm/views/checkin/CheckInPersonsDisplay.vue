<template>
  <div class='grid-avatar'>
    <a
      v-for='e in employees'
      :key='e.id'
      class='align-items-center cursor-pointer flex flex-column gap-2 item-grid'
      :class='selected === e.id && "surface-ground"'
      @click='onSelected(e)'>
      <HrmAvatar
        :avatar='generateAvatarUrl(e.avatar)'
        width='6rem'/>
      <div class='font-medium'>{{ e.fullName }}</div>
      <div
        v-if='e.checkins?.[moment(selectedDate).format(DateTimeFormat.ISO_LOCAL_DATE)]'
        class='flex font-medium justify-content-around w-full'>
        <span>{{
          moment(e.checkins?.[moment(selectedDate).format(DateTimeFormat.ISO_LOCAL_DATE)]?.firstCheckin).format('HH:mm')
        }}
        </span>
        <span v-if='!isToday'>
          {{
            moment(e.checkins?.[moment(selectedDate).format(DateTimeFormat.ISO_LOCAL_DATE)]?.lastCheckout).format('HH:mm')
          }}
        </span>
      </div>
    </a>
  </div>
</template>

<script lang='ts' setup>

import { computed, type PropType, ref } from 'vue';

import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { EmployeeSummaryWithCheckin } from '@/apps/hrm/model/employee';
import { DateTimeFormat } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  employees: {
    type: Array as PropType<EmployeeSummaryWithCheckin[]>,
    default: () => []
  },
  selectedDate: {
    type: Date,
    default: () => new Date()
  }
});

const emits = defineEmits(['viewDetail']);
const selected = ref();

const onSelected = (data: any) => {
  selected.value = data.id;
  emits('viewDetail', data);
};

const { moment } = useMoment();
const isToday = computed(() => moment(props.selectedDate).isSame(new Date(), 'day'));
</script>

<style scoped>
.grid-avatar {
  display: grid;
  gap: 1rem;
}

.item-grid {
  display: flex;
  justify-content: flex-start;
  padding: 7px;
  border-radius: 4px;

  &:hover {
    background-color: var(--surface-hover);
  }
}

@media (min-width: 26rem) {
  .grid-avatar {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 35rem) {
  .grid-avatar {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 53rem) {
  .grid-avatar {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 71rem) {
  .grid-avatar {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (min-width: 89rem) {
  .grid-avatar {
    grid-template-columns: repeat(10, 1fr);
  }
}

@media (min-width: 107rem) {
  .grid-avatar {
    grid-template-columns: repeat(12, 1fr);
  }
}

@media (min-width: 143rem) {
  .grid-avatar {
    grid-template-columns: repeat(15, 1fr);
  }
}
</style>