<template>
  <ProgressBar
    v-if='isLoading'
    class='border-noround'
    mode='indeterminate'
    style='height: .25rem'></ProgressBar>
  <DataTable
    v-else
    v-bind='DEFAULT_DATATABLE_CONFIG'
    class='w-full'
    row-hover
    scroll-direction='both'
    scroll-height='86vh'
    scrollable
    :value='data'>
    <Column
      class='text-center'
      header='TT'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      field='fullName'
      :header='t("hrm.profile.general.fullName")'></Column>
    <Column
      field='code'
      :header='t("hrm.profile.general.code")'></Column>
    <Column :header='t("hrm.profile.general.gender")'>
      <template #body='{data}'>
        {{ data['gender'] ? t('common.gender.' + lowerCase(data['gender'])) : '' }}
      </template>
    </Column>
    <Column :header='t("hrm.profile.general.birthDay")'>
      <template #body='{data}'>
        {{ data['birthDay'] ? moment(data['birthDay']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      :header='t("hrm.dashboard.contentMiss")'
      style='width: 45rem'>
      <template #body='{data}'>
        <span> {{ checkMissingFields(data) }}</span>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang='ts'>

import { lowerCase } from 'lodash';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getProfileNotComplete } from '@/apps/hrm/api/graphql/employee';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps<{
  organizationId?: string | null;
}>();
const isLoading = ref(false);
const { moment } = useMoment();
const { t } = useI18n();

const data = ref();
onMounted(() => {
  isLoading.value = true;
  getProfileNotComplete(props.organizationId).onResult((res) => {
    data.value = res.data?.getProfileNotComplete;
    isLoading.value = false;
  });
});

function checkMissingFields(obj: Record<string, any>): string {
  const fieldNames: Record<string, string> = {
    cccdNumber: t('hrm.dashboard.cccdNumber'),
    phoneNumber: t('hrm.dashboard.phoneNumber'),
    birthPlace: t('hrm.dashboard.birthPlace'),
    homeTown: t('hrm.dashboard.homeTown'),
    maritalStatus: t('hrm.dashboard.maritalStatus'),
    currentAddress: t('hrm.dashboard.currentAddress'),
    currentResidence: t('hrm.dashboard.currentResidence')
  };

  const missing = Object.entries(fieldNames)
    .filter(([key]) => obj[key] == null || obj[key] === '')
    .map(([_, name]) => name);
  const missingStr = `${missing.join(', ')}.`;
  return missingStr.charAt(0).toUpperCase() + missingStr.slice(1);
}
</script>

<style scoped>

</style>