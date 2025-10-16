<template>
  <div class='p-2 text-content'>
    <div>Ảnh Tennant Address</div>
    <div class='border-round border-top-3'></div>
    <h2 class='text-center'>
      {{
        isWeekly
          ? t("meeting.common.weeklySchedule")
          : t("meeting.common.monthlySchedule")
      }}
    </h2>
    <h4 class='text-center'>
      {{
        `Từ ngày ${moment(props.listDateProp[0]).format("DD/MM/YYYY")} đến ngày ${moment(props.listDateProp[props.listDateProp.length - 1]).format("DD/MM/YYYY")}`
      }}
    </h4>
    <DataTable
      group-rows-by='key'
      row-group-mode='rowspan'
      :scrollable='false'
      :show-gridlines='true'
      sort-mode='single'
      :striped-rows='false'
      :value='listMeeting'>
      <Column
        body-class='p-0'
        class='border-1 border-gray-900 text-center'
        field='key'
        :header="t('meeting.calendar.table.date')"
        header-class='border-1 border-gray-900 bg-transparent'>
        <template #body='{ data: { key } }'>
          <div
            class='align-content-center flex flex-column h-full justify-content-center p-2'>
            <div>{{ upperFirst(moment(key).format("dddd")) }}</div>
            {{ upperFirst(moment(key).format("DD/MM/YYYY")) }}
          </div>
        </template>
      </Column>
      <Column
        class='border-1 border-gray-900 text-center'
        field='startTime'
        :header="t('meeting.calendar.table.startTime')"
        header-class='border-1 border-gray-900 bg-transparent'>
        <template #body='{ data: { startTime } }'>
          <div>
            <div v-if='startTime'>
              {{ moment(startTime).format("HH:mm") }}
            </div>
          </div>
        </template>
      </Column>
      <Column
        class='border-1 border-gray-900 text-center'
        field='endTime'
        :header="t('meeting.calendar.table.endTime')"
        header-class='border-1 border-gray-900 bg-transparent'>
        <template #body='{ data: { endTime } }'>
          <div>
            <div v-if='endTime'>
              {{ moment(endTime).format("HH:mm") }}
            </div>
          </div>
        </template>
      </Column>
      <Column
        class='border-1 border-gray-900 text-center'
        field='meetingRoom'
        :header="t('meeting.calendar.table.location')"
        header-class='border-1 border-gray-900 bg-transparent'>
        <template #body='{ data: { meetingRoom } }'>
          <div
            v-if='meetingRoom'
            class='cursor-pointer'>
            {{ meetingRoom?.name }}
          </div>
        </template>
      </Column>
      <Column
        class='border-1 border-gray-900'
        field='content'
        :header="t('meeting.calendar.table.content')"
        header-class='border-1 border-gray-900 bg-transparent'>
        <template #body='{ data: { content } }'>
          <div>
            <div v-if='content'>
              {{ content }}
            </div>
          </div>
        </template>
      </Column>

      <Column
        class='border-1 border-gray-900'
        field='hostId'
        :header="t('meeting.calendar.table.host')"
        header-class='border-1 border-gray-900 bg-transparent'>
        <template #body='{ data: { hostId } }'>
          {{ usersMoreInfo[hostId]?.fullName ?? "" }}
        </template>
      </Column>

      <Column
        class='border-1 border-gray-900 text-center'
        field='attendeeIds'
        :header="t('meeting.calendar.table.attend')"
        header-class='border-1 border-gray-900 bg-transparent'>
        <template #body='{ data: { attendees: attendees } }'>
          {{
            attendees
              ? `(${attendees?.length}) - ${attendees?.map((e: any) => usersMoreInfo[e.userId]?.fullName ?? null).join(", ")}`
              : ""
          }}
        </template>
      </Column>

      <Column
        v-if='isConfig'
        class='border-1 border-gray-900'
        field='creatorId'
        :header="t('meeting.calendar.table.creationUser')"
        header-class='border-1 border-gray-900 bg-transparent'>
        <template #body='{ data: { createdBy } }'>
          {{ usersMoreInfo[createdBy]?.fullName ?? "" }}
        </template>
      </Column>

      <Column
        v-if='!isConfig'
        class='border-1 border-gray-900'
        field='setup'
        :header="t('meeting.meeting.prepare')"
        header-class='border-1 border-gray-900 bg-transparent'
        style='width: 10rem'>
      </Column>

      <Column
        v-if='!isConfig'
        class='border-1 border-gray-900'
        field='note'
        :header="t('meeting.meeting.note')"
        header-class='border-1 border-gray-900 bg-transparent'
        style='width: 10rem'>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { upperFirst } from 'lodash';
import { computed, type PropType, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { type MeetingInterface } from '@/apps/meeting/model/meeting';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  listMeetingProp: {
    type: Array as PropType<MeetingInterface[]>,
    default: () => [],
  },
  listDateProp: {
    type: Array as PropType<Date[]>,
    default: () => [],
  },
});
const emits = defineEmits(['mounted']);
const isWeekly = computed(() => {
  return props.listDateProp.length <= 7;
});
const { usersMoreInfo } = useUserMoreInfoStore();
const { moment } = useMoment();
const isConfig = false;
const { t } = useI18n();

const listMeeting = computed((): MeetingInterface[] => {
  let m1 = props.listMeetingProp
    .filter((m) =>
      props.listDateProp
        .map((d) => moment(d).format(DateTimeFormat.ISO_LOCAL_DATE))
        .includes(moment(m.startTime).format(DateTimeFormat.ISO_LOCAL_DATE)),
    )
    .map((m) => ({
      ...m,
      key: moment(m.startTime).format(DateTimeFormat.ISO_LOCAL_DATE),
    }));
  const m2 = props.listDateProp
    .filter(
      (d) =>
        !m1.find(
          (m) => m.key === moment(d).format(DateTimeFormat.ISO_LOCAL_DATE),
        ),
    )
    .map(
      (d) =>
        ({ key: moment(d).format(DateTimeFormat.ISO_LOCAL_DATE), }) as MeetingInterface,
    );
  let rs = [...m1, ...m2];
  rs.sort(
    (a, b) => new Date(a.key || '').getTime() - new Date(b.key || '').getTime(),
  );
  return rs;
});

const state = reactive({
  isLoading: false,
  text: 'old boring text',
});
</script>

<script lang="ts">
export default { name: 'MeetingScheduled' };
</script>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
}

.text-content {
  font-family: "Times New Roman", sans-serif; /* Đặt font chữ cho tất cả các phần tử con */
  font-size: small;
}

.text-content * {
  font-family: inherit;
  font-size: small; /* Kế thừa font chữ từ .text-content */
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
