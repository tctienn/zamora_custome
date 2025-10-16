<template>
  <div class='profile-container'>
    <!-- Loading State -->
    <LoadingState v-if='isLoading'/>

    <!-- Main Content -->
    <div
      v-else
      class='profile-content'>
      <!-- Profile Toolbar -->
      <ProfileToolbar
        :has-changed='profileHistoryItems.length > 1'
        :has-draft='hasDraft'
        :has-pending='hasPending'
        :profile-status='profileStatus'
        :version-profile='versionProfile'
        @edit-profile='showEditForm'
        @send-to-approve='handleSendToApprove'
        @send-to-delete='handleDeletePersonalDraft'
        @toggle-history='toggleProfileHistory'
        @toggle-print='togglePrintMenu'/>

      <!-- Profile Data -->
      <div class='profile-data'>
        <GeneralPersonalData
          class='mb-2'
          :contract='firstContract'
          :has-changed='profileHistoryItems.length > 1'
          :user-data='profileData || undefined'/>
        <PersonalData
          v-model:model='profileData'
          :old-snapshot-id='activeSnapshotId'/>
      </div>
    </div>

    <!-- Sidebars and Dialogs -->
    <HrmPersonalProfileFormSidebar
      v-if='profileData'
      ref='personalFormRef'
      v-model='profileData'
      v-model:visible='isFormVisible'
      :old-snapshot-id='activeSnapshotId'
      :snapshot-status='profileStatus'
      @refetch:snapshot='handleSnapshotRefetch'
      @update:status='handleStatusUpdate'/>

    <!-- Profile History Menu -->
    <ProfileHistoryMenu
      ref='profileHistoryMenuRef'
      :history-items='profileHistoryItems'
      @select-version='handleVersionSelect'/>

    <!-- Print Menu -->
    <Menu
      ref='printMenuRef'
      :model='printMenuItems'
      popup
      :pt='{
        root: {
          style: {
            "max-width": "unset"
          }
        }
      }'/>

    <!-- File Viewer Dialog -->
    <DialogViewFile
      v-if='fileViewerState.isVisible'
      v-model='fileViewerState.isVisible'
      :employee-id="profileData?.employeeId ?? ''"
      :file-blob='fileViewerState.fileBlob'
      :type='fileViewerState.viewType'
      :visible='fileViewerState.isVisible'
      @hide-dialog='closeFileViewer'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, provide, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findContractByEmployeeId } from '@/apps/hrm/api/graphql/contract';
import { employeeSummaryById } from '@/apps/hrm/api/graphql/employee';
import { getAllWorkProcessInternalByEmployeeId } from '@/apps/hrm/api/graphql/insurance';
import {
  deletePersonalDraft,
  findEmployeeByIdAndSnapshot,
  findPersonal,
  viewPdfExportFileEmployee
} from '@/apps/hrm/api/rest/employee';
import type { Employee } from '@/apps/hrm/model/employee';
import DialogViewFile from '@/apps/hrm/views/profile/detail/DialogViewFileProfile.vue';
import HrmPersonalProfileFormSidebar from '@/apps/hrm/views/profile/HrmPersonalProfileFormSidebar.vue';
import GeneralPersonalData from '@/apps/hrm/views/userProfile/personal/GeneralPersonalData.vue';
import PersonalData from '@/apps/hrm/views/userProfile/personal/PersonalData.vue';
import { PROFILE_STATUS } from '@/common/constants/profile';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

import LoadingState from './components/LoadingState.vue';
import ProfileHistoryMenu from './components/ProfileHistoryMenu.vue';
import ProfileToolbar from './components/ProfileToolbar.vue';
import { useFileViewer } from './composables/useFileViewer';
import { useProfileHistory } from './composables/useProfileHistory';
import type { ProfileHistoryItem } from './types';

// Composables
const { moment } = useMoment();
const { t } = useI18n();
const userStore = useUserStore();
const userMoreInfoStore = useUserMoreInfoStore();
const { allUsers } = storeToRefs(userMoreInfoStore);
const confirm = useConfirm();

// Profile History Composable
const {
  profileHistoryItems,
  versionProfile,
  hasPendingChanges,
  hasPending,
  hasDraft,
  activeSnapshotId,
  fetchProfileHistory,
  updateVersionProfile,
  setCurrentSnapshotId
} = useProfileHistory();

// File Viewer Composable
const {
  fileViewerState,
  openPdfFile,
  closeFileViewer
} = useFileViewer();

// Reactive State
const isLoading = ref(true);
const isFormVisible = ref(false);
const profileData: Ref<Employee | null> = ref(null);
const profileStatus = ref<string>('');
const isEditBySelf = ref<boolean>(true);
const profileSnapshotId = ref<string>('');
const contractData = ref<any[]>([]);
const workProcessData = ref<any[]>([]);

// Template Refs
const personalFormRef = ref<InstanceType<typeof HrmPersonalProfileFormSidebar> | null>(null);
const profileHistoryMenuRef = ref<InstanceType<typeof ProfileHistoryMenu> | null>(null);
const printMenuRef = ref<InstanceType<typeof Menu> | null>(null);
// Computed Properties
const currentUserId = computed(() => userStore.user.id as string);
const firstContract = computed(() => contractData.value?.[0] || null);

// Print Menu Configuration
const printMenuItems: MenuItem[] = [
  {
    label: 'Sơ yếu lý lịch (Mẫu 2C-BNV/2008)',
    icon: 'pi pi-file',
    command: () => handlePrintDocument('MINISTRY_OF_INTERIOR')
  },
  {
    label: 'Sơ yếu lý lịch (Mẫu 2C/TCTW-98)',
    icon: 'pi pi-file',
    command: () => handlePrintDocument('CENTRAL_ORGANIZATION')
  }
];

// Utility Functions
const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    [PROFILE_STATUS.ACTIVE]: 'Đã duyệt',
    [PROFILE_STATUS.DRAFT]: 'Bản nháp',
    [PROFILE_STATUS.PENDING]: 'Chờ duyệt',
    [PROFILE_STATUS.REJECTED]: 'Từ chối'
  };
  return statusMap[status] || 'Bản gốc';
};

const getUserDisplayName = (userId: string): string => {
  const user = allUsers.value.find((u: UserMoreInfo) => u.id === userId);
  return user?.fullName || '';
};

const formatDate = (date: string): string => {
  return moment(date).format('DD/MM/YYYY');
};

// API Functions
const loadPersonalData = async (): Promise<void> => {
  try {
    isLoading.value = true;
    const personalData = await findPersonal();

    if (personalData) {
      profileData.value = personalData;
      profileStatus.value = 'ACTIVE';
      profileSnapshotId.value = personalData.snapshotId || '';

      // Load additional data if employee ID is available
      if (personalData.employeeId) {
        await Promise.all([
          loadProfileHistory(personalData.employeeId),
          loadWorkProcessData(personalData.employeeId),
          loadContractData(personalData.employeeId),
          updateEmployeeSummary(personalData.employeeId)
        ]);
      }
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

const loadProfileHistory = async (employeeId: string): Promise<void> => {
  try {
    await fetchProfileHistory(employeeId, profileSnapshotId.value);
  } catch (error) {
  }
};

const loadWorkProcessData = async (employeeId: string): Promise<void> => {
  try {
    const { onResult } = getAllWorkProcessInternalByEmployeeId(employeeId);
    onResult((result) => {
      workProcessData.value = result.data?.getAllWorkProcessInternalByEmployeeId || [];
    });
  } catch (error) {
  }
};

const loadContractData = async (employeeId: string): Promise<void> => {
  try {
    const { onResult } = findContractByEmployeeId(employeeId);
    onResult((result) => {
      contractData.value = result.data?.findContractByEmployeeId || [];
    });
  } catch (error) {
  }
};

const updateEmployeeSummary = async (employeeId: string): Promise<void> => {
  try {
    employeeSummaryById(employeeId).onResult((result) => {
      const employee = result.data?.employeeSummaryById;
      if (currentUserId.value === employee?.userId && profileData.value?.contact) {
        profileData.value.contact.zamoraId = employee.userId;
      }
    });
  } catch (error) {
  }
};

// Event Handlers
const handlePrintDocument = async (type: string): Promise<void> => {
  try {
    if (!profileData.value?.employeeId) {
      return;
    }

    const file = await viewPdfExportFileEmployee(profileData.value.employeeId, type);
    if (file) {
      openPdfFile(file, type);
    }
  } catch (error) {
  }
};

const handleVersionSelect = async (historyItem: ProfileHistoryItem): Promise<void> => {
  try {
    if (!historyItem.employeeId) {
      return;
    }

    isLoading.value = true;
    const versionData = await findEmployeeByIdAndSnapshot(historyItem.employeeId, historyItem.id);

    if (versionData) {
      profileData.value = versionData;
      profileStatus.value = historyItem.status;
      profileSnapshotId.value = historyItem.id;

      // Update the composable's current snapshot ID to trigger version profile update
      setCurrentSnapshotId(historyItem.id);
    }
  } catch (error) {
    // Error handling for version loading
  } finally {
    isLoading.value = false;
  }
};
const handleSendToApprove = async (): Promise<void> => {
  try {
    await personalFormRef.value?.sendToApprove();
  } catch (error) {
  }
};

const handleDeletePersonalDraft = (): void => {
  if (!profileData.value?.snapshotId) {
    return;
  }

  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('hrm.profile.personalDraft'),
      itemName: profileData.value?.general?.fullName || ''
    }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: async () => {
      if (!profileData.value?.snapshotId) {
        return;
      }
      try {
        await deletePersonalDraft(profileData.value.snapshotId);
        // After successful deletion, reload the active profile data
        await loadPersonalData();
      } catch (error) {
        // Error handling for draft deletion
      }
    }
  });
};

const handleSnapshotRefetch = async (employeeId: string): Promise<void> => {
  // Reload profile history first to get updated data
  await loadProfileHistory(employeeId);

  // If we're currently viewing a specific version (not the active one), reload that version
  if (profileStatus.value === 'DRAFT' && profileSnapshotId.value) {
    // We're viewing a draft - reload the current draft version to see updates
    try {
      const versionData = await findEmployeeByIdAndSnapshot(employeeId, profileSnapshotId.value);
      if (versionData) {
        profileData.value = versionData;
        // Keep the current status and snapshot ID
      }
    } catch (error) {
      // Error handling for draft version reload
    }
  } else {
    // We're viewing the active version - reload the active profile data
    await loadPersonalData();
  }
};

const handleStatusUpdate = (status: string): void => {
  profileStatus.value = status;
};

// UI Action Handlers
const toggleProfileHistory = (event?: Event): void => {
  if (event) {
    profileHistoryMenuRef.value?.toggle(event);
  } else {
    // Create a synthetic event for cases where no event is provided
    const syntheticEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    profileHistoryMenuRef.value?.toggle(syntheticEvent);
  }
};

const togglePrintMenu = (event?: Event): void => {
  if (event) {
    printMenuRef.value?.toggle(event);
  } else {
    // Create a synthetic event for cases where no event is provided
    const syntheticEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    printMenuRef.value?.toggle(syntheticEvent);
  }
};

const showEditForm = (): void => {
  isFormVisible.value = true;
};

// Watchers
watch(profileSnapshotId, () => {
  updateVersionProfile();
});

// Provide for child components
provide('workProcessData', workProcessData);
provide('profileStatus', profileStatus);
provide('isEditBySelf', isEditBySelf);
provide('formatDate', formatDate);
provide('getUserDisplayName', getUserDisplayName);
provide('getStatusDisplayName', getStatusDisplayName);

// Lifecycle
onMounted(async () => {
  await loadPersonalData();
});
</script>

<style lang='scss' scoped>
.profile-container {
  width: 100%;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-data {
  display: flex;
  flex-direction: column;
}

/* Button styling */
:deep(.p-button.p-button-icon-only) {
  width: 30px;
  padding: 5px 0;
}

:deep(.p-button) {
  border-radius: 4px;
}

/* Menu styling */
:deep(.profile-history-menu) {
  border: none;
  padding: 0;
}

/* Animation for loading states */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
