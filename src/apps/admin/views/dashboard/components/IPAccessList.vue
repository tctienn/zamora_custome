<template>
  <div class='border-round-sm card h-full shadow-none'>
    <div class='border-bottom-1 font-bold p-3 surface-border'>
      {{ t('admin.dashboard.dashboard.ipAccessList') }}
    </div>
    <div class='p-3'>
      <DataTable 
        class='p-datatable-sm'
        responsive-layout='scroll'
        :value='ipAccessData'>
        <Column 
          field='ip'
          :header="t('admin.dashboard.dashboard.ipAddress')"
          sortable></Column>
        <Column 
          field='time'
          :header="t('admin.dashboard.dashboard.accessTime')"
          sortable></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Mock data for IP access list
const ipAccessData = ref([
  {
    ip: '192.168.1.100',
    time: '08:30:15'
  },
  {
    ip: '10.0.0.50',
    time: '08:32:45'
  },
  {
    ip: '172.16.0.25',
    time: '08:35:20'
  },
  {
    ip: '192.168.1.105',
    time: '08:40:10'
  },
  {
    ip: '10.0.0.75',
    time: '08:45:30'
  },
  {
    ip: '172.16.0.30',
    time: '08:50:05'
  },
  {
    ip: '192.168.1.110',
    time: '08:55:40'
  },
  {
    ip: '10.0.0.100',
    time: '09:00:25'
  },
  {
    ip: '172.16.0.35',
    time: '09:05:10'
  },
  {
    ip: '192.168.1.115',
    time: '09:10:55'
  }
]);

onMounted(() => {
  try {
    // In a real implementation, you would fetch data from an API here
    console.log('IPAccessList mounted');
  } catch (error) {
    console.error('Error initializing IPAccessList:', error);
  }
});
</script>

<style scoped>
.card {
  background-color: var(--surface-card);
  height: 100%;
}

/* Ensure DataTable takes full height */
:deep(.p-datatable) {
  height: 100%;
}
</style>