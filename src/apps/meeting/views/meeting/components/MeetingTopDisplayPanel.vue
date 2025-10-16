<template>
  <div>
    <div class='align-items-center flex justify-content-between'>
      <div class='align-items-center flex gap-2'>
        <SelectButton
          :allow-empty='false'
          :model-value='display'
          :option-label='(data)=>t(`meeting.meeting.${data}`)'
          :options='optionDisplays'
          @update:model-value='changeDisplay'/>
        <MeetingSelect
          v-model:month='month'
          v-model:week='week'
          v-model:year='year'
          :display='display'/>
      </div>

      <div class='flex gap-2'>
        <Dropdown
          v-if='false'
          v-model='filterMeetingStatus'
          checkmark
          class='w-12rem'
          :highlight-on-select='false'
          option-label='label'
          option-value='value'
          :options='meetingStatusOptions'/>
        <MultiSelect
          v-if='false'
          v-model='statuses'
          class='w-15rem'
          display='chip'
          :max-selected-labels='10'
          option-label='label'
          option-value='value'
          :options='statusMeetingEnumOptions'/>
        <NamedMultiSelectUser
          v-if='isLeader'
          v-model:listUser='userIds'
          class='p-component'
          name='userIds'
          :options='leader'
          placeholder='Chọn lãnh đạo'
          :select-max='2'
          :show-button-add='false'
          style='min-width: 35rem'/>
        <NamedMultiSelectUser
          v-if='selectCreatedByIds'
          v-model:listUser='createdByIds'
          class='p-component'
          name='createdByIds'
          placeholder='Chọn người tạo'
          :select-max='2'
          :show-button-add='false'
          style='min-width: 35rem'/>
        <SelectButton
          v-if='!isManager && !isMtRoom'
          v-model='showRow'
          :allow-empty='false'
          class='align-content-center view-button'
          :option-value='(option) => option.value'
          :options='showRowOption'>
          <template #option='slotProps'>
            <i
              :class="{
                'pi pi-bars': slotProps.option.label === 'List',
                'pi pi-th-large': slotProps.option.label === 'Grid',
              }"
              style='font-size: 1.2rem'></i>
          </template>
        </SelectButton>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getUsersByRole } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { MeetingStatus, StatusMeetingEnum } from '@/apps/meeting/model/meeting';
import MeetingSelect from '@/apps/meeting/views/meeting/components/MeetingSelect.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';

defineProps({
  display: {
    type: String as PropType<'week' | 'month'>,
    default: 'week'
  },
});
const emits = defineEmits(['update:display']);

const route = useRoute();

const isLeader = computed(() => route.fullPath.includes('leader'));
const isManager = computed(() => route.fullPath.includes('manager'));
const isMtRoom = computed(() => route.fullPath.includes('room'));
const optionDisplays = ['week', 'month'];

const year = defineModel('year', {
  type: Number,
  default: new Date().getFullYear()
});
const showRow = defineModel('showRow', {
  type: Boolean,
  default: false
});
const selectCreatedByIds = defineModel('selectCreatedByIds', {
  type: Boolean,
  default: false
});
const month = defineModel('month', {
  type: Number,
  default: new Date().getMonth()
});
const week = defineModel('week', {
  type: Number,
  default: 0
});
const filterMeetingStatus = defineModel('filterMeetingStatus', {
  type: String as PropType<MeetingStatus>,
  default: MeetingStatus.ALL
});
const userIds = defineModel('userIds', {
  type: Array as PropType<string[]>,
  default: () => []
});
const createdByIds = defineModel('createdByIds', {
  type: Array as PropType<string[]>,
  default: () => []
});
const statuses = defineModel('statuses', {
  type: Array as PropType<StatusMeetingEnum[]>,
  default: () => []
});

const { t } = useI18n();

function changeDisplay(value: string) {
  emits('update:display', value);
}

const meetingStatusOptions = [
  {
    label: t(`meeting.meeting.status.${MeetingStatus.ALL.toLowerCase()}`),
    value: MeetingStatus.ALL
  },
  {
    label: t(`meeting.meeting.status.${MeetingStatus.UPCOMING.toLowerCase()}`),
    value: MeetingStatus.UPCOMING
  },
  {
    label: t(`meeting.meeting.status.${MeetingStatus.ONGOING.toLowerCase()}`),
    value: MeetingStatus.ONGOING
  },
  {
    label: t(`meeting.meeting.status.${MeetingStatus.FINISHED.toLowerCase()}`),
    value: MeetingStatus.FINISHED
  }
];

const statusMeetingEnumOptions = Object.values(StatusMeetingEnum).map(status => ({
  label: t(`media.common.table.statuses.${status.toLowerCase()}`),
  value: status
}));

const leader = ref();
const { onResult: getUsersByRoleResult } =
  getUsersByRole('LANH_DAO_LICH_HOP');
getUsersByRoleResult((res) => {
  leader.value = res.data.findByRole;
  userIds.value = isLeader.value ? leader.value?.map((item: { id: string }) => item.id) : [];
});

const showRowOption = ref([
  {
    label: 'Grid',
    value: false
  }, {
    label: 'List',
    value: true
  }
]);

</script>

<script lang='ts'>
export default { name: 'MeetingTopDisplayPanel' };
</script>

<style scoped>
:deep(.p-button-group .p-button:first-of-type:not(:only-of-type)) {
  border-radius: 4px 0 0 4px;
}

:deep(.p-button-group .p-button:last-of-type:not(:only-of-type)) {
  border-radius: 0 4px 4px 0;
}
</style>