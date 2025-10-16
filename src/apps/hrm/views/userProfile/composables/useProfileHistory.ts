import { computed, type Ref, ref } from 'vue';

import { findPersonalProfileHistory } from '@/apps/hrm/api/rest/employee';
import type { ProfilesHistory } from '@/apps/hrm/model/employee';
import { PROFILE_STATUS } from '@/common/constants/profile';

import type { ProfileHistoryItem, ProfileStatus } from '../types';

export function useProfileHistory() {
  // Reactive state
  const historyItems: Ref<ProfileHistoryItem[]> = ref([]);
  const currentSnapshotId = ref('');
  const hasPendingChanges = ref(false);
  const hasPending = ref(false);
  const hasDraft = ref(false);

  // Computed properties
  const profileHistoryItems = computed(() => historyItems.value);

  const activeSnapshotId = computed(() => {
    return historyItems.value.find(item => item.status === PROFILE_STATUS.ACTIVE)?.id || '';
  });

  const versionProfile = computed(() => {
    if (!currentSnapshotId.value || historyItems.value.length === 0) {
      return '';
    }

    const currentIndex = historyItems.value.findIndex(item => item.id === currentSnapshotId.value);

    if (currentIndex === -1) {
      return 'Phiên bản hiện tại';
    }

    const currentItem = historyItems.value[currentIndex];
    return getVersionDisplayName(currentItem, currentIndex);
  });

  // Methods
  const fetchProfileHistory = async (employeeId: string, snapshotId = '') => {
    try {
      const records = await findPersonalProfileHistory(employeeId);

      if (!records) {
        historyItems.value = [];
        return;
      }

      // Separately detect PENDING and DRAFT statuses
      hasPending.value = records.some(item => item.status === PROFILE_STATUS.PENDING);
      hasDraft.value = records.some(item => item.status === PROFILE_STATUS.DRAFT);
      // Combined for backward compatibility
      hasPendingChanges.value = hasPending.value || hasDraft.value;

      // Sort by creation time (ascending)
      const sortedRecords = [...records].sort((a, b) => {
        const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
        const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
        return timeA - timeB;
      });

      // Map with version numbers and display names
      historyItems.value = sortedRecords.map((item, index) => ({
        ...item,
        version: index + 1,
        displayName: getVersionDisplayName(item, index)
      }));

      // Set current snapshot ID if provided, or use the active one
      if (snapshotId) {
        currentSnapshotId.value = snapshotId;
      } else {
        // If no snapshotId provided, use the active snapshot as current
        const activeItem = sortedRecords.find(item => item.status === PROFILE_STATUS.ACTIVE);
        if (activeItem) {
          currentSnapshotId.value = activeItem.id;
        }
      }

    } catch (error) {
      // Error handling for profile history fetching
      historyItems.value = [];
    }
  };

  const updateVersionProfile = () => {
    // This will trigger the computed property to update
    // The actual logic is in the versionProfile computed property
  };

  const getVersionDisplayName = (item: ProfilesHistory, index: number): string => {
    const { status, createdTime } = item;

    switch (status as ProfileStatus) {
    case 'ACTIVE':
      return index === 0 && !createdTime ? 'Hồ sơ gốc' : `Lần thay đổi: ${index}`;
    case 'DRAFT':
      return 'Bản nháp';
    case 'PENDING':
      return 'Đang chờ duyệt';
    case 'OLD':
      return index === 0 && !createdTime
        ? 'Hồ sơ gốc (Cũ)'
        : `Lần thay đổi: ${index} (Cũ)`;
    default:
      return `Phiên bản ${index}`;
    }
  };

  const setCurrentSnapshotId = (snapshotId: string) => {
    currentSnapshotId.value = snapshotId;
  };

  const getCurrentVersionInfo = (snapshotId: string) => {
    const item = historyItems.value.find(h => h.id === snapshotId);
    if (!item) {
      return null;
    }

    const index = historyItems.value.indexOf(item);
    return {
      item,
      index,
      displayName: getVersionDisplayName(item, index),
      isOriginal: index === 0 && !item.createdTime,
      isActive: item.status === PROFILE_STATUS.ACTIVE,
      isPending: item.status === PROFILE_STATUS.PENDING,
      isDraft: item.status === PROFILE_STATUS.DRAFT
    };
  };

  return {
    // Reactive state
    profileHistoryItems,
    versionProfile,
    hasPendingChanges,
    hasPending,
    hasDraft,
    activeSnapshotId,

    // Methods
    fetchProfileHistory,
    updateVersionProfile,
    getVersionDisplayName,
    setCurrentSnapshotId,
    getCurrentVersionInfo
  };
}
