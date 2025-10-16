<template>
  <Menu
    ref='menuRef'
    class='profile-history-menu'
    :model='menuItems'
    popup>

    <template #item='{ item }'>
      <div
        class='history-item'
        :class='getItemClasses(getHistoryItem(item))'
        @click='handleItemClick(getHistoryItem(item))'>

        <!-- Version Header -->
        <div class='version-header'>
          <p class='version-name'>{{ getHistoryItem(item).displayName }}</p>
          <p
            v-if='getHistoryItem(item).createdTime'
            class='version-date'>
            {{ formatDate(getHistoryItem(item).createdTime!) }}
          </p>
        </div>

        <!-- Status Info -->
        <div
          v-if="getHistoryItem(item).status !== 'OLD'"
          class='status-info'>
          <span class='status-label'>Trạng thái:</span>
          <span
            class='status-value'
            :class='getStatusClasses(getHistoryItem(item).status)'>
            {{ getStatusDisplayName(getHistoryItem(item).status) }}
          </span>
        </div>

        <!-- Approval Info -->
        <div
          v-if='getHistoryItem(item).approveTime'
          class='approval-time'>
          <span>Thời gian:</span>
          <i>{{ formatDate(getHistoryItem(item).approveTime!) }}</i>
        </div>

        <!-- Approver Info -->
        <div
          v-if='getHistoryItem(item).approveBy'
          class='approver-info'>
          <span>Người duyệt:</span>
          <b>{{ getUserDisplayName(getHistoryItem(item).approveBy!) }}</b>
        </div>
      </div>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import Menu from 'primevue/menu';
import { computed, inject, ref } from 'vue';

import { PROFILE_STATUS } from '@/common/constants/profile';

import type { ProfileHistoryItem } from '../types';

interface Props {
  historyItems: ProfileHistoryItem[]
}

const props = withDefaults(defineProps<Props>(), { historyItems: () => [] });

const emit = defineEmits<{
  'select-version': [item: ProfileHistoryItem]
}>();

// Injected functions from parent
const formatDate = inject('formatDate', (date: string) => date);
const getUserDisplayName = inject('getUserDisplayName', (userId: string) => userId);
const getStatusDisplayName = inject('getStatusDisplayName', (status: string) => status);

const menuRef = ref<InstanceType<typeof Menu> | null>(null);

// Computed menu items for PrimeVue Menu
const menuItems = computed(() => {
  return props.historyItems.map(item => ({
    ...item,
    command: () => handleItemClick(item)
  }));
});

// Methods
const handleItemClick = (item: ProfileHistoryItem) => {
  emit('select-version', item);
};

const getItemClasses = (item: ProfileHistoryItem) => {
  return {
    'status-active': item.status === 'ACTIVE',
    'status-old-with-time': item.status === 'OLD' && item.createdTime,
    'status-old-original': item.status === 'OLD' && !item.createdTime,
    'status-pending': item.status === 'PENDING',
    'status-draft': item.status === 'DRAFT'
  };
};

// Helper function to get ProfileHistoryItem from MenuItem
const getHistoryItem = (item: any): ProfileHistoryItem => {
  // Since we spread the ProfileHistoryItem into MenuItem, we can safely cast back
  return item as ProfileHistoryItem;
};

const getStatusClasses = (status: string) => {
  return {
    'text-yellow-600': status === PROFILE_STATUS.DRAFT,
    'text-teal-500': status === PROFILE_STATUS.ACTIVE,
    'text-red-500': status === PROFILE_STATUS.REJECTED,
    'text-orange-500': status === PROFILE_STATUS.PENDING
  };
};

// Expose toggle method for parent component
const toggle = (event?: Event) => {
  if (event) {
    menuRef.value?.toggle(event);
  } else {
    // Create a synthetic event for cases where no event is provided
    const syntheticEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    menuRef.value?.toggle(syntheticEvent);
  }
};

defineExpose({ toggle });
</script>

<style scoped>
.profile-history-menu {
  border: 0;
  padding: 0;
}

.history-item {
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  color: rgba(0, 0, 0, 0.9);
  transition: background-color 0.2s ease;
}

.history-item:hover {
  background-color: #f9fafb;
}

.history-item.status-active {
  background-color: #ccfdf7;
}

.history-item.status-old-with-time {
  background-color: #fef3c7;
}

.history-item.status-old-original {
  background-color: #dbeafe;
}

.history-item.status-pending {
  background-color: #fed7aa;
}

.history-item.status-draft {
  background-color: #f3f4f6;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.version-name {
  font-weight: 600;
  margin-bottom: 0;
}

.version-date {
  margin-bottom: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.status-info {
  font-size: 0.875rem;
}

.status-label {
  margin-right: 0.25rem;
}

.status-value {
  font-weight: bold;
}

.text-yellow-600 {
  color: #d97706;
}

.text-teal-500 {
  color: #14b8a6;
}

.text-red-500 {
  color: #ef4444;
}

.text-orange-500 {
  color: #f97316;
}

.approval-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.approver-info {
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .version-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .history-item {
    padding: 0.75rem 0.5rem;
  }
}
</style>
