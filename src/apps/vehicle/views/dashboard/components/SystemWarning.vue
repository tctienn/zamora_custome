<template>
  <div class='border-round card p-2'>
    <div class='font-bold text-primary text-xl'>
      {{ t('vehicle.dashboard.systemWarning') }}
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <div class='p-2'>
      <div class='font-bold'>
        1. Lịch bảo dưỡng xe sắp tới

      </div>
    </div>
    <div class='p-2'>
      <div class='font-bold'>
        2. Hết hạn bảo hiểm

      </div>
    </div>
    <div class='p-2'>
      <div class='font-bold'>
        3. Lịch đăng kiểm xe
        <div class='grid grid-nogutter pt-2'>
          <div
            v-for='(data, index) in expiringOrExpiredVehicles'
            :key='index'
            class='align-items-center col-4 flex flex-column gap-1 justify-content-center mb-2'>
            <div>{{ data.licensePlate }}</div>
            <div class='font-medium'> {{ moment(data.registrationPeriod).format('DD/MM/YYYY') }}</div>
            <div
              class='font-normal text-sm'
              :class='getRegistrationStatus(data.registrationPeriod).color'>
              {{ getRegistrationStatus(data.registrationPeriod).text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getExpiredLicenseDriver } from '@/apps/vehicle/api/graphql/driver';
import { getExpiringOrExpiredVehicles } from '@/apps/vehicle/api/graphql/vehicle';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  orgId: {
    type: String,
    default: ''
  },
});
const { t } = useI18n();
const { moment } = useMoment();
const expiringOrExpiredVehicles = ref<any[]>([]);
const expiringOrExpiredDrivers = ref<any[]>([]);

const {
  onResult: getExpiringOrExpiredVehiclesResult,
  refetch: getExpiringOrExpiredVehiclesRefetch
} = getExpiringOrExpiredVehicles(props.orgId);

getExpiringOrExpiredVehiclesResult((response) => {
  expiringOrExpiredVehicles.value = response.data.getExpiringOrExpiredVehicles || [];
});

const {
  onResult: getExpiredLicenseDriverResult,
  refetch: getExpiredLicenseDriverRefetch
} = getExpiredLicenseDriver(props.orgId);

getExpiredLicenseDriverResult((response) => {
  expiringOrExpiredDrivers.value = response.data.getExpiredLicenseDriver || [];
});

watch(
  () => props.orgId,
  (newOrgId) => {
    if (newOrgId) {
      getExpiringOrExpiredVehiclesRefetch({ organizationId: newOrgId });
      getExpiredLicenseDriverRefetch({ organizationId: newOrgId });
    }
  },
  { immediate: true }
);

const getRegistrationStatus = (date: string) => {
  const today = moment();
  const target = moment(date);

  if (target.isAfter(today)) {
    const daysLeft = target.diff(today, 'days');
    return {
      text: `Còn ${daysLeft} ngày`,
      color: 'text-blue-500'
    };
  } else {
    const daysOver = today.diff(target, 'days');
    return {
      text: `Quá ${daysOver} ngày`,
      color: 'text-red-500'
    };
  }
};
</script>

<style scoped>

</style>