<template>
  <div class='h-6rem my-2'>
    <div
      v-if='!loading'
      class='flex gap-2'>
      <div class='flex gap-2 p-2 surface-0 w-8'>
        <div
          class='align-content-center bg-working h-5rem text-white w-3'>
          <div class='flex gap-3 justify-content-center'>
            <AppIcon
              class='cursor-pointer'
              name='person'
              size='3'/>

            <div>
              <div class='font-semibold text-lg'>{{ t('hrm.profile.employeeStatusOptions.working') }}</div>
              <div
                class='font-bold text-center text-lg'>{{ totalWorking }}
              </div>
            </div>
          </div>
        </div>

        <div
          class='align-content-center bg-leave h-5rem text-white w-3'>
          <div class='flex gap-3 justify-content-center'>
            <AppIcon
              class='cursor-pointer'
              name='person'
              size='3'/>

            <div>
              <div class='font-semibold  text-lg'>{{ t('hrm.profile.employeeStatusOptions.leave') }}</div>
              <div
                class='font-bold text-center text-lg'>{{ totalExpired }}
              </div>
            </div>
          </div>
        </div>

        <div
          class='align-content-center bg-maternity-leave h-5rem text-white w-3'>
          <div class='flex gap-3 justify-content-center'>
            <AppIcon
              class='cursor-pointer'
              name='pregnant_woman'
              size='3'/>

            <div>
              <div class='font-semibold text-lg'>{{ t('hrm.profile.employeeStatusOptions.maternityLeave') }}</div>
              <div
                class='font-bold text-center text-lg'>{{ totalMaternityLeave }}
              </div>
            </div>
          </div>
        </div>

        <div
          class='align-content-center bg-party h-5rem w-3'>
          <div class='flex gap-3 justify-content-center text-white'>
            <AppIcon
              class='cursor-pointer'
              name='stars'
              size='3'/>

            <div>
              <div class='font-semibold text-lg'>{{ t('hrm.profile.filterOption.byDangvien') }}</div>
              <div
                class='font-bold text-center text-lg'>{{ dashboardContract?.partyCount }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class='flex gap-2 p-2 surface-0 w-4'>
        <div
          class='align-content-center bg-active-contract h-5rem w-6'>
          <div class='flex gap-3 justify-content-center text-white'>
            <AppIcon
              class='cursor-pointer'
              name='receipt_long'
              size='3'/>

            <div>
              <div class='font-semibold text-lg'>Tất cả hợp đồng</div>
              <div
                class='font-bold text-center text-lg'>{{ dashboardContract?.totalContractDashboard?.totalAll }}
              </div>
            </div>
          </div>
        </div>

        <div
          class='align-content-center bg-working h-5rem w-6'>
          <div class='flex gap-3 justify-content-center text-white'>
            <AppIcon
              class='cursor-pointer'
              name='receipt_long'
              size='3'/>

            <div>
              <div class='font-semibold  text-lg'>Đang hiệu lực</div>
              <div
                class='font-bold text-center text-lg'>{{ dashboardContract?.totalContractDashboard?.totalValid }}
              </div>
            </div>
          </div>
        </div>

        <!--        <div-->
        <!--          class='align-content-center h-5rem w-4'-->
        <!--          style='background: #FFF5F5'>-->
        <!--          <div class='flex gap-3 justify-content-center'>-->
        <!--            <AppIcon-->
        <!--              class='cursor-pointer text-black-alpha-60'-->
        <!--              name='contract_delete'-->
        <!--              size='3'/>-->

        <!--            <div>-->
        <!--              <div class='font-semibold text-black-alpha-60 text-lg'>Hết hiệu lực</div>-->
        <!--              <div-->
        <!--                class='font-bold text-center text-lg'-->
        <!--                style='color: #F36F24'>{{ dashboardContract?.totalContractDashboard?.totalExpired }}-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
    </div>

    <!-- Skeleton loader when data is loading -->
    <div
      v-else
      class='flex gap-2'>
      <div class='flex gap-2 p-2 surface-0 w-8'>
        <div class='align-content-center h-5rem m-0 p-2 w-3'>
          <Skeleton
            class='border-round h-full w-full'
            style='background-color: #e9ecef;'/>
        </div>

        <div class='align-content-center h-5rem m-0 p-2 w-3'>
          <Skeleton
            class='border-round h-full w-full'
            style='background-color: #e9ecef;'/>
        </div>

        <div class='align-content-center h-5rem m-0 p-2 w-3'>
          <Skeleton
            class='border-round h-full w-full'
            style='background-color: #e9ecef;'/>
        </div>

        <div class='align-content-center h-5rem m-0 p-2 w-3'>
          <Skeleton
            class='border-round h-full w-full'
            style='background-color: #e9ecef;'/>
        </div>
      </div>

      <div class='flex gap-2 p-2 surface-0 w-4'>
        <div class='align-content-center h-5rem m-0 p-2 w-6'>
          <Skeleton
            class='border-round h-full w-full'
            style='background-color: #e9ecef;'/>
        </div>

        <div class='align-content-center h-5rem m-0 p-2 w-6'>
          <Skeleton
            class='border-round h-full w-full'
            style='background-color: #e9ecef;'/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import Skeleton from 'primevue/skeleton';
import { onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { dashboardWorkStatus } from '@/apps/hrm/api/graphql/contract';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps<{
  organizationId?: string | null;
}>();

const { t } = useI18n();
const dashboardContract = ref();
const totalWorking = ref(0);
const totalExpired = ref(0);
const totalMaternityLeave = ref(0);
const loading = ref(true);

// Function to make API call
const fetchDashboardData = (orgId: string | null) => {
  const apiCall = dashboardWorkStatus(orgId);

  apiCall.onResult((res) => {
    dashboardContract.value = res.data.dashboardWorkStatus;
    dashboardContract.value.employeeWorkingStatusCount.forEach((s: any) => {
      if (s.status == 'WORKING') {
        totalWorking.value = s.count;
      }
      if (s.status == 'LEAVE') {
        totalExpired.value = s.count;
      }
      if (s.status == 'MATERNITY_LEAVE') {
        totalMaternityLeave.value = s.count;
      }
    });
    loading.value = false; // Set loading to false after data is processed
  });

  return apiCall;
};

// Khai báo kiểu chính xác cho currentApiCall
let currentApiCall: ReturnType<typeof dashboardWorkStatus> | null = null;

// Function to handle API call based on organization id availability
const handleApiCall = (orgId: string | null) => {
  if (orgId) {
    loading.value = true; // Set loading to true when fetching new data
    // Cancel the previous subscription if exists
    if (currentApiCall) {
      currentApiCall.stop();
    }
    currentApiCall = fetchDashboardData(orgId);
  } else {
    // If no organization id, clear the data
    dashboardContract.value = null;
    totalWorking.value = 0;
    totalExpired.value = 0;
    totalMaternityLeave.value = 0;
    loading.value = false;
  }
};

// Initialize API call only if organization id is available
if (props.organizationId) {
  currentApiCall = fetchDashboardData(props.organizationId);
} else {
  loading.value = false;
}

// Watch for changes in organization id and refetch data
watch(() => props.organizationId, (newOrgId: string | null | undefined) => {
  handleApiCall(newOrgId ?? null);
}, { immediate: true });

// Clean up the subscription when component is unmounted
onUnmounted(() => {
  if (currentApiCall) {
    currentApiCall.stop();
  }
});
</script>

<style lang='scss' scoped>
.bg-working {
  background: var(--bg-green-custom2);
}

.bg-leave {
  background: var(--bg-orange-custom2);
}

.bg-maternity-leave {
  background: var(--bg-purple-custom2);
}

.bg-party {
  background: var(--bg-orange-custom3);
}

.bg-active-contract {
  background: var(--bg-primary-custom);
}
</style>