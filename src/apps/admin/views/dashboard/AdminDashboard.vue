<template>
  <div class='dashboard-grid h-full'>
    <!-- Dashboard Header -->
    <div class='dashboard-header'>
      <div class='border-round-sm card h-full p-2 shadow-none'>
        <div class='align-items-center flex justify-content-between p-1'>
          <div class='mb-2'>
            <h1 class='font-bold my-2 text-2xl text-primary'>{{ t('admin.dashboard.dashboard.titlePage') }}</h1>
            <h2 class='font-medium my-1 text-500 text-lg'>{{ t('admin.dashboard.dashboard.subtitle') }}</h2>
          </div>
          <div class='flex gap-2'>
            <Dropdown
              v-model='selectedOrganization'
              class='w-30rem'
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
            <Dropdown
              v-model='selectedYear'
              class='w-10rem'
              :options='years'>
              <template #option='{ option }'>
                <div
                  class='flex gap-2 items-center relative'
                  :class="{ 'text-blue font-semibold': option === selectedYear }">
                  <AppIcon
                    v-if='option === selectedYear'
                    class='absolute'
                    name='check'
                    size='1.3'/>
                  <span class='ml-4'>{{ option }}</span>
                </div>
              </template>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- First Row - Normal Order -->
    <div class='dashboard-row'>
      <template
        v-for='com in firstRowComponents'
        :key='com'>
        <component
          :is='com'
          :selected-organization='selectedOrganization'
          :selected-year='selectedYear'/>
      </template>
    </div>

    <!-- Second Row - Reverse Order -->
    <div class='dashboard-row reverse'>
      <!-- First block: Top Users Chart only -->
      <div class='border-round-sm card h-full shadow-none'>
        <div class='border-bottom-1 font-bold p-3 surface-border'>
          {{ t('admin.dashboard.dashboard.topUsersAccess') }}
        </div>
        <div class='h-full p-3'>
          <TopUsersChartOnly/>
        </div>
      </div>

      <!-- Second block: Today Login Users List -->
      <TodayLoginUsers :selected-organization='selectedOrganization'/>

      <!-- Third block: IP Access List Table -->
      <IPAccessList/>

    </div>
  </div>
</template>

<script setup lang='ts'>
import Dropdown from 'primevue/dropdown';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { filterOrganizations } from '@/apps/admin/api/graphql/organization-graphql-api';
import AppIcon from '@/common/components/app/AppIcon.vue';

import IPAccessList from './components/IPAccessList.vue'; // Component for IP access list
// Import các component dashboard cho admin
import Overview from './components/Overview.vue';
import RoleSummary from './components/RoleSummary.vue';
import TodayLoginUsers from './components/TodayLoginUsers.vue'; // Component for today's login users
import TopUsersChartOnly from './components/TopUsersChartOnly.vue'; // Component with chart only
import UserSummary from './components/UserSummary.vue';

// Import store nếu cần
// import { useAdminStore } from '@/apps/admin/store/admin';

// const { userRole } = storeToRefs(useAdminStore());

const { t } = useI18n();

// First row components (normal order)
const firstRowComponents = computed(() => {
  // Tùy theo vai trò người dùng, hiển thị các component tương ứng
  // Ví dụ:
  // switch (userRole.value) {
  // case 'ADMIN':
  //   return [Overview, UserSummary, RoleSummary, SystemStatus];
  // case 'MANAGER':
  //   return [Overview, UserSummary, RoleSummary];
  // default:
  //   return [Overview, UserSummary];
  // }

  return [Overview, UserSummary, RoleSummary];
});
const selectedOrganization = ref<any>(null);

const {
  result,
  loading
} = filterOrganizations({
  code: null,
  type: 'DV',
  parentCode: null
});
const organizations = ref<{ id: string; name: string; code: string }[]>([]);
const selectedOrganizationCode = ref<string | null>(null);
const selectedOrganizationId = ref<string | null>(null);

// Year selection
const now = new Date();
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
const selectedYear = ref(now.getFullYear());

// Function to handle organization change
const onOrganizationChange = (event: { value: string }) => {
  const selectedOrg = organizations.value.find(org => org.id === event.value);
  if (selectedOrg) {
    selectedOrganizationCode.value = selectedOrg.code;
    selectedOrganizationId.value = selectedOrg.id;
  }
  // You can add additional logic here when organization is selected
};

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
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.dashboard-header {
  flex: 0 0 auto;
}

.dashboard-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: 4.5fr 3fr 4.5fr;
  align-items: stretch;
  height: 100%;
}

.dashboard-row.reverse {
  display: grid;
  gap: 1rem;
  grid-template-columns: 4.5fr 3fr 4.5fr;
  align-items: stretch;
  height: 100%;
}

/* Ensure direct children (components) stretch to fill height */
.dashboard-row > *,
.dashboard-row.reverse > * {
  height: 100%;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .dashboard-row,
  .dashboard-row.reverse {
    grid-template-columns: 1fr;
    height: auto;
  }

  .dashboard-row > *,
  .dashboard-row.reverse > * {
    height: auto;
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .dashboard-row,
  .dashboard-row.reverse {
    grid-template-columns: 1fr;
    height: auto;
  }

  .dashboard-row > *,
  .dashboard-row.reverse > * {
    height: auto;
  }
}

@media screen and (min-width: 1025px) {
  .dashboard-row,
  .dashboard-row.reverse {
    grid-template-columns: 4.5fr 3fr 4.5fr;
    height: 100%;
  }

  .dashboard-row > *,
  .dashboard-row.reverse > * {
    height: 100%;
  }
}

.text-blue {
  color: #0d99ff;
}
</style>