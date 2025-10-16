<template>
  <div>
    <div>
      <div class='border-round-sm p-3 surface-0'>
        <div class='flex flex-column gap-3 md:align-items-center md:flex-row md:justify-content-between'>
          <div>
            <div class='font-bold mb-1 text-primary text-xl'>{{ t('hrm.organization.dashboard.title') }}</div>
            <div class='text-black-alpha-60'>{{ t('hrm.organization.dashboard.subtitle') }}</div>
          </div>
          <div class='md:ml-auto md:w-30rem w-full'>
            <Dropdown
              v-model='selectedOrganization'
              class='w-full'
              :loading='loading'
              option-label='name'
              option-value='id'
              :options='organizations'
              :placeholder="t('hrm.organization.dashboard.selectOrganization')"
              @change='onOrganizationChange'>
              <template #option='{ option }'>
                <div
                  class='flex gap-2 items-center relative'
                  :class="{ 'text-blue font-semibold': option.id === selectedOrganization }">
                  <AppIcon
                    v-if='option.id === selectedOrganization'
                    class='absolute'
                    name='check'
                    size='1.3'/>
                  <span class='ml-4'>{{ option.name }}</span>
                </div>
              </template>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
    <DashboardOrganization :organization-id='selectedOrganizationId'/>
    <DashboardContractStatus :organization-id='selectedOrganizationId'/>
    <div class='grid-layout-chart py-2'>
      <div
        class='p-4 surface-50'>
        <DashboardChartEducationLevel :organization-id='selectedOrganizationId'/>
      </div>
      <div
        class='p-4 surface-50'>
        <DashboardChartAgeStaff :organization-id='selectedOrganizationId'/>
      </div>
      <div
        class='p-4 surface-50'>
        <DashboardChartGenderStatistics :organization-id='selectedOrganizationId'/>
      </div>
    </div>

    <div class='grid-layout-chart pt-2'>
      <div
        class='p-4 surface-50'>
        <DashboardChartPositionStatistics :organization-id='selectedOrganizationId'/>
      </div>
      <div
        class='p-4 surface-50'>
        <DashboardChartContractType :organization-id='selectedOrganizationId'/>
      </div>
      <div
        class='p-4 surface-50'>
        <DashboardWarningSystem :organization-id='selectedOrganizationId'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

import Dropdown from 'primevue/dropdown';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { filterOrganizations } from '@/apps/admin/api/graphql/organization-graphql-api';
import DashboardChartAgeStaff from '@/apps/hrm/views/dashboard/DashboardChartAgeStaff.vue';
import DashboardChartContractType from '@/apps/hrm/views/dashboard/DashboardChartContractType.vue';
import DashboardChartEducationLevel from '@/apps/hrm/views/dashboard/DashboardChartEducationLevel.vue';
import DashboardChartGenderStatistics from '@/apps/hrm/views/dashboard/DashboardChartGenderStatistics.vue';
import DashboardChartPositionStatistics from '@/apps/hrm/views/dashboard/DashboardChartPositionStatistics.vue';
import DashboardContractStatus from '@/apps/hrm/views/dashboard/DashboardContractStatus.vue';
import DashboardOrganization from '@/apps/hrm/views/dashboard/DashboardOrganization.vue';
import DashboardWarningSystem from '@/apps/hrm/views/dashboard/DashboardWarningSystem.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const { t } = useI18n();

// State for the dropdown
const selectedOrganization = ref<string | null>(null);
const selectedOrganizationCode = ref<string | null>(null);
const selectedOrganizationId = ref<string | null>(null);
const organizations = ref<{ id: string; name: string; code: string }[]>([]);

// Get the organizations using the filterOrganizations API
const {
  result,
  loading
} = filterOrganizations({
  code: null,
  type: 'DV',
  parentCode: null
});

// Function to handle organization change
const onOrganizationChange = (event: { value: string }) => {
  const selectedOrg = organizations.value.find(org => org.id === event.value);
  if (selectedOrg) {
    selectedOrganizationCode.value = selectedOrg.code;
    selectedOrganizationId.value = selectedOrg.id;
  }
  // You can add additional logic here when organization is selected
};

// Watch for changes in result and update the dropdown options
watch(() => result.value?.filterOrganizations, (newOrganizations) => {
  if (newOrganizations) {
    organizations.value = newOrganizations.map((org: { id: string; name: string; code: string }) => ({
      id: org.id,
      name: org.name,
      code: org.code
    }));
  }
}, { immediate: true });

// Handle default selection separately to avoid PrimeVue auto-selecting first item
watch(organizations, (newOrgs) => {
  // Only set default selection if we want it (currently commented out to prevent auto-selection)
  // Uncomment below lines if you want to auto-select the first organization after load
  if (newOrgs && newOrgs.length > 0 && selectedOrganization.value === null) {
    const defaultOrg = newOrgs[1]; // Use index 1 as the default
    selectedOrganization.value = defaultOrg.id;
    selectedOrganizationCode.value = defaultOrg.code;
    selectedOrganizationId.value = defaultOrg.id;
  }
}, { immediate: true });
</script>

<style scoped>
.grid-layout-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.text-blue {
  color: #0d99ff;
}
</style>
