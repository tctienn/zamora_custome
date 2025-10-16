<template>
  <div
    class='flex h-full justify-content-center'>
    <div style=' width: 70%'>
      <div class='border-round-sm card'>
        <div class='align-items-center flex flex-wrap justify-content-between'>
          <span class='p-input-icon-right'><h4>{{ t('Ngày nghỉ lễ cố định hằng năm') }}</h4></span>
          <span class='p-input-icon-left'>
            <ButtonIcon
              v-tooltip='t("work.configHoliday.addFixedHolidays")'
              class='p-1'
              icon='add_circle'
              rounded
              text
              @click='addHolidayConfigIsFixed()'/>
          </span>
        </div>
        <div
          v-for='(config, index) in holidaysFixed'
          :key='index'
          class='flex'>
          <div class='col-3 field'>
            <InputText
              v-model='config.id'
              hidden
              placeholder='id'/>
            <InputText
              v-model='config.type'
              hidden
              placeholder='type'/>
            <Calendar
              v-model='config.calendar'
              class='w-full'
              date-format='dd-mm'
              :manual-input='true'
              select-other-months
              :show-button-bar='true'
              @update:model-value='saveHolidayConfigFixed(config)'/>
          </div>

          <div class='col-1 field'>
            <ButtonIcon
              v-tooltip='t("work.configHoliday.deleteFixedHolidays")'
              class='pt-2'
              icon='delete'
              rounded
              text
              @click='deleteConfig(config.id)'/>
          </div>
        </div>
      </div>

      <div class='border-round-sm card'>
        <div class='align-items-center flex flex-wrap justify-content-between'>
          <span class='block p-input-icon-right'><h4>{{ t("work.configHoliday.HolidaysDuringTheYear") }}</h4></span>
          <span class='block p-input-icon-left'>
            <ButtonIcon
              v-tooltip='t("work.configHoliday.addHolidaysDuringTheYear")'
              class='p-1'
              icon='add_circle'
              rounded
              text
              @click='addHolidayConfigIsNotFixed()'/>
          </span>
        </div>

        <div
          v-for='(config, index) in holidaysNotFixed'
          :key='index'
          class='flex'>
          <div class='col-3 field'>
            <InputText
              v-model='config.id'
              hidden
              placeholder='id'/>
            <InputText
              v-model='config.type'
              hidden
              placeholder='type'/>
            <Calendar
              v-model='config.calendar'
              class='w-full'
              date-format='dd-mm-yy'
              placeholder='dd-mm-yyyy'
              select-other-months
              :show-button-bar='true'
              @update:model-value='saveHolidayConfigNotFixed(config)'/>
          </div>

          <div class='col-5 field'>
            <InputText
              v-model='config.description'
              class='w-full'
              :placeholder='t("work.configHoliday.description")'
              @blur='saveHolidayConfigNotFixed(config)'/>
          </div>

          <div class='col-1 field'>
            <ButtonIcon
              v-tooltip='t("work.configHoliday.deleteHolidaysDuringYear")'
              class='pt-2'
              icon='delete'
              rounded
              text
              @click='deleteConfig(config.id)'/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

import { cloneDeep, isEmpty, isNull } from 'lodash';
import moment from 'moment';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteHolidayConfig,
  findHolidayConfigByType,
  saveHolidayConfig
} from '@/apps/work/api/graphql/holiday-config-api';
import type { Holiday } from '@/apps/work/model/holiday';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const date = ref();
const { t } = useI18n();
const {
  onResult: findHolidayConfigFixedOnResult,
  load: findHolidayConfigFixedLoad,
  refetch: fidHolidayConfigFixedRefetch
} = findHolidayConfigByType();
const {
  onResult: findHolidayConfigNotFixedOnResult,
  load: findHolidayConfigNotFixedLoad,
  refetch: fidHolidayConfigNotFixedRefetch
} = findHolidayConfigByType();
const { mutate: saveHolidayMutate, onDone: saveHolidayOnDone } = saveHolidayConfig();
const { mutate: deleteHolidayMutate, onDone: deleteHolidayOnDone } = deleteHolidayConfig();

const holidaysFixed = ref([] as Holiday[]);
const holidaysNotFixed = ref([] as Holiday[]);

onMounted(() => {
  findHolidayConfigFixedLoad(undefined, { type: 'FIXED' });
  findHolidayConfigNotFixedLoad(undefined, { type: 'NOT_FIXED' });
});

findHolidayConfigFixedOnResult((res) => {
  holidaysFixed.value = res.data.findHolidayConfigByType.map((config: Holiday) => ({
    ...config,
    calendar: moment(config.calendar).format('DD-MM')
  }));
});

findHolidayConfigNotFixedOnResult((res) => {
  holidaysNotFixed.value = res.data.findHolidayConfigByType.map((config: Holiday) => ({
    ...config,
    calendar: moment(config.calendar).format('DD-MM-YYYY')
  }));
});

function addHolidayConfigIsFixed() {
  const listConfig = cloneDeep(holidaysFixed.value);
  listConfig.push({
    id: '',
    calendar: null,
    type: 'FIXED',
    description: ''
  });
  holidaysFixed.value = listConfig;
}

function addHolidayConfigIsNotFixed() {
  const listConfig = cloneDeep(holidaysNotFixed.value);
  listConfig.push({
    id: '',
    calendar: null,
    type: 'NOT_FIXED',
    description: ''
  });
  holidaysNotFixed.value = listConfig;
}

function saveHolidayConfigFixed(config: Holiday) {
  saveHolidayMutate({
    holidayConfigInput: {
      ...config,
      calendar: moment(config.calendar).format('YYYY-MM-DD')
    }
  });
}

function saveHolidayConfigNotFixed(config: Holiday) {
  if (!isEmpty(config.description) && !isNull(config.calendar)) {
    saveHolidayMutate({
      holidayConfigInput: {
        ...config,
        calendar: moment(config.calendar).format('YYYY-MM-DD')
      }
    });
  }
}

function deleteConfig(id: string) {
  deleteHolidayMutate({ id: id });
}

deleteHolidayOnDone((res) => {
  refetch();
  toastSuccess({ message: t('work.configHoliday.configurationDeletedSuccessfully') });
});

saveHolidayOnDone(() => {
  refetch();
  toastSuccess({ message: t('work.configHoliday.addedNewConfigurationSuccessfully') });
});

function refetch() {
  fidHolidayConfigFixedRefetch();
  fidHolidayConfigNotFixedRefetch();
}
</script>

<script lang='ts'>
export default { name: 'ConfigHolidayManage' };
</script>