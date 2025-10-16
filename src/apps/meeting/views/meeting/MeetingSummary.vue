<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2 h-3rem'>
        <div class='font-bold'>
          Tổng hợp
        </div>
      </div>
    </template>

  </Toolbar>
  <div class='align-items-center border-1 border-300 border-round-sm flex justify-content-between p-1 surface-0'>
    <SelectButton
      v-model='weekMonth'
      :allow-empty='false'
      :option-label='(data) => t(`common.${data}`)'
      :options="['week', 'month']"/>
    <Calendar
      v-model='year'
      date-format='yy'
      :manual-input='false'
      view='year'>
    </Calendar>
  </div>
  <div
    class='mt-3 surface-0'
    style='height: 100vh'>
    <DataTable
      v-bind='{...DEFAULT_DATATABLE_CONFIG, ref: "tableRef"}'
      responsive-layout='scroll'
      row-hover
      scrollable
      :show-gridlines='true'
      :value='data'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('common.result.header')),
          })
        }}</span>
      </template>
      <Column
        field='hostId'
        frozen
        :header="t('meeting.meeting.host')"
        style='min-width: 200px'>
        <template #body='{ data: { hostId: hostId } }'>
          <AppUser
            avatar-size='2.5'
            info-visible
            :infos="['positionName', 'departments']"
            is-flex
            name-visible
            :user-id='hostId'>
            <template #name='{ user, displayInfos }'>
              <span class='flex font-semibold justify-content-center'>{{
                user?.fullName
              }}</span>
              <small
                class='flex flex-row gap-2 justify-content-center opacity-80'>
                {{ displayInfos }}
              </small>
            </template>
          </AppUser>
        </template>
      </Column>
      <Column
        v-for='idx in counter'
        :key='idx'
        body-class='text-center'
        :field='`${weekMonth}${idx}`'
        :header='`${t(`common.${weekMonth}`)} ${idx}`'
        style='min-width: 100px'>
        <template #body='{ data: tData }'>
          <div
            v-if='tData[`${weekMonth}${idx}`]'
            class='flex justify-content-center'>
            <span class='number-user'>{{ tData[`${weekMonth}${idx}`] }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang='ts'>
import { toLower } from 'lodash';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { summaryMonth, summaryWeek, } from '@/apps/meeting/api/rest/summaryHostApi';
import type { SummaryMonthHostProjection, SummaryWeekHostProjection, } from '@/apps/meeting/model/summary-host';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const { t } = useI18n();
const infoStore = useUserMoreInfoStore();
const { moment } = useMoment();
const year = ref<Date>(new Date());

const data = ref<SummaryWeekHostProjection[] | SummaryMonthHostProjection[]>(
  [],
);
const counter = computed(() => {
  if (weekMonth.value === 'week') {
    return moment(year.value).weeksInYear();
  } else {
    return 12;
  }
});
const weekMonth = ref<'week' | 'month'>('week');
summaryWeek(year.value.getFullYear()).then((response) => {
  data.value = response || [];
});
watch(weekMonth, (value) => {
  if (value == 'week') {
    summaryWeek(year.value.getFullYear()).then((response) => {
      data.value = response || [];
    });
  } else {
    summaryMonth(year.value.getFullYear()).then((response) => {
      data.value = response || [];
    });
  }
});
watch(year, (value) => {
  if (weekMonth.value == 'week') {
    summaryWeek(value.getFullYear()).then((response) => {
      data.value = response || [];
    });
  } else {
    summaryMonth(value.getFullYear()).then((response) => {
      data.value = response || [];
    });
  }
});
const tableRef = ref();
const currentWeek = moment().week();

onMounted(async () => {
  infoStore.fetchAllUsers();
  await nextTick();

  const table = tableRef.value?.$el as HTMLElement;
  if (!table) {
    return;
  }

  const scrollBody = table.querySelector('.p-datatable-wrapper') as HTMLElement;
  if (!scrollBody) {
    return;
  }

  const targetCell = scrollBody.querySelector(
    `td[field="${weekMonth.value}${currentWeek}"]`
  ) as HTMLElement;

  if (targetCell) {
    scrollBody.scrollLeft = targetCell.offsetLeft;
  }
});
</script>

<style scoped></style>
