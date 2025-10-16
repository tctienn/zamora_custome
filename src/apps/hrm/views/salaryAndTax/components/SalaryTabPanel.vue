<template>
  <div class='p-1'>
    <!-- Danh sách bảng lương chia theo năm -->
    <div 
      v-for='yearItem in sortedFilteredGroupedSalaries' 
      :key='yearItem.year'
      class='border-round mb-1'>
      <div 
        class='align-items-center cursor-pointer flex hover:surface-200 p-1'
        @click='toggleYear(yearItem.year)'>
        <div class='align-items-center flex font-bold'>
          {{ yearItem.year }}
          <i 
            :class="['pi ml-2', expandedYears.includes(yearItem.year) ? 'pi-chevron-down' : 'pi-chevron-right']"
            style='font-size: 0.8rem;'></i>
        </div>
      </div>
      <div
        v-show='expandedYears.includes(yearItem.year)'
        class='ml-2'>
        <div 
          v-for='salary in yearItem.salaries' 
          :key='salary.id'
          class='border-round cursor-pointer mb-2 ml-1 p-2 salary-item w-full'
          :class="{ 'salary-selected': selectedSalaryId === salary.id }"
          @click='selectSalary(salary)'>
          <div class='flex gap-2 items-center justify-between mb-1 w-full'>
            <AppAvatar
              :avatar='getCreatorName(salary.createdBy)?.avatar2'
              class='mr-2'
              :label='getCreatorName(salary.createdBy)?.name'
              shape='circle'
              size='2.5'
              @mouseenter='(e: MouseEvent) => {
                const user = getCreatorName(salary.createdBy);
                if (user) showUserOverlay(e, user);
              }' />
            <div class='align-items-center flex justify-content-between w-full'>
              <div>
                <div class='font-bold'>{{ salary.name }}</div>
                <div class='text-500 text-xs'>
                  {{ formatDateTime(salary.createdDate) }}
                </div>
              </div>
              <div
                class='border-1 border-dashed border-round-sm mt-auto px-2 py-1 text-center text-sm w-max'
                :class='getStatusClass(salary.status)'>
                {{ getStatusText(salary.status) }}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    <UserOverlay
      ref='userOverlayRef'
      :user='userOverlay.user'/>
  </div>
</template>

<script lang='ts' setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';

type CreatorInfo = UserMoreInfo & { name: string; avatar2: string };
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import UserOverlay from '@/common/components/custom/UserOverlay.vue';
import EventBus from '@/common/helpers/event-bus';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

interface TreePayslip {
  id: string;
  name: string;
  type: string;
  month: number;
  year: number;
  location: string;
  createdDate: string;
  createdBy: string;
  organizationIds: string[];
  templateIds: string[];
  status: string;
}

// Define the props for the component
interface Props {
  salaryData?: TreePayslip[];
  currentStatus?: string;
  selectedSalaryId?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  salaryData: () => [],
  currentStatus: 'all',
  selectedSalaryId: null,
});

const emit = defineEmits<Emits>();

// Define emits for events
interface Emits {
  (e: 'select-salary', salary: any): void;
}

// Inject selectedSalary from parent component
const selectedSalary = inject<any>('selectedSalary');

// Local state for expanded years in this tab panel
const expandedYears = ref<number[]>([]);

// Function to handle year expansion toggle
const toggleYear = (year: number) => {
  const index = expandedYears.value.indexOf(year);
  if (index > -1) {
    expandedYears.value.splice(index, 1);
  } else {
    expandedYears.value.push(year);
  }
};

// Initialize userMoreInfo store
const userMoreInfoStore = useUserMoreInfoStore();

// UserOverlay state
const userOverlayRef = ref();
const userOverlay = ref<{
  visible: boolean;
  user?: UserMoreInfo;
  event?: Event;
}>({ visible: false });

// Salary data from parent component
const salaries = computed(() => props.salaryData || []);

// Filter salaries by status and sort by year descending
const sortedFilteredGroupedSalaries = computed(() => {
  let filteredGroups: Record<number, any[]> = {};
  
  if (props.currentStatus === 'all' || props.currentStatus === 'DRAFT') {
    filteredGroups = groupedSalaries.value;
  } else {
    Object.keys(groupedSalaries.value).forEach(year => {
      const yearGroup = groupedSalaries.value[parseInt(year)];
      const filteredGroup = yearGroup.filter((salary: any) => {
        // Compare uppercase status values for filtering, with special handling for 'DRAFT'
        if (props.currentStatus === 'DRAFT') {
          return salary.status.toUpperCase() === 'DRAFT';
        } else {
          return salary.status.toUpperCase() === props.currentStatus;
        }
      });
      if (filteredGroup.length > 0) {
        filteredGroups[parseInt(year)] = filteredGroup;
      }
    });
  }
  
  // Convert object to array and sort by year descending
  return Object.keys(filteredGroups)
    .map(key => parseInt(key))
    .sort((a, b) => b - a)
    .map(year => ({
      year: year,
      salaries: filteredGroups[year]
    }));
});

// Group salaries by year
const groupedSalaries = computed(() => {
  const groups: Record<number, any[]> = {};
  salaries.value.forEach(salary => {
    if (!groups[salary.year]) {
      groups[salary.year] = [];
    }
    groups[salary.year].push(salary);
  });
  return groups;
});

// Function to handle year expansion toggle
// Function to handle salary selection
const selectSalary = (salary: any) => {
  emit('select-salary', salary);
};

// Get CSS class for status
function getStatusClass(status: string) {
  switch (status?.toUpperCase()) {
  case 'DRAFT':
    return 'bg-gray-300 text-gray-800 border-gray-300';
  case 'PENDING_REVIEW':
    return 'bg-yellow-300 text-yellow-800 border-yellow-300';
  case 'PENDING_APPROVAL':
    return 'bg-purple-300 text-purple-800 border-purple-300';
  case 'APPROVED':
    return 'bg-green-600 text-white border-green-700';
  case 'REJECTED':
    return 'bg-red-500 text-white border-red-600';
  case 'REVIEWED':
    return 'bg-blue-300 text-blue-800 border-blue-400';
  default:
    return 'bg-gray-300 text-gray-800 border-gray-300';
  }
}

// Get display text for status
function getStatusText(status: string) {
  switch (status?.toUpperCase()) {
  case 'DRAFT':
    return 'Dự thảo';
  case 'PENDING_REVIEW':
    return 'Chờ xem xét';
  case 'PENDING_APPROVAL':
    return 'Chờ phê duyệt';
  case 'APPROVED':
    return 'Đã phê duyệt';
  case 'REJECTED':
    return 'Đã từ chối';
  case 'REVIEWED':
    return 'Đã xem xét';
  default:
    return status;
  }
}

// Get full name of creator
function getCreatorName(userId: string): CreatorInfo | null {
  if (!userId) {
    return null;
  }
  const user = userMoreInfoStore.usersMoreInfo[userId];
  if (!user) {
    return null;
  }
  return {
    ...user,
    name: user.fullName || user.username || '',
    avatar2: generateAvatarUrl(user.avatar as string | '') || '',
  };
}

function showUserOverlay(event: Event, item: UserMoreInfo) {
  EventBus.emit('user-overlay', {
    visible: true,
    user: item,
    event: event
  });
}

function toggleUserOverlay(data: {
  visible: boolean;
  user?: UserMoreInfo;
  event?: Event;
}) {
  nextTick(() => {
    userOverlay.value = data;
  }).then(() => {
    userOverlayRef.value.show(data.event);
  });
}

// Format date time to show only day/month/year
function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

onMounted(() => {
  EventBus.on('user-overlay', toggleUserOverlay);
});

onBeforeUnmount(() => {
  EventBus.off('user-overlay', toggleUserOverlay);
});

// Track if this tab panel has been initialized
const isInitialized = ref(false);

// Watch for changes in sortedFilteredGroupedSalaries to ensure first year is always expanded
watch(() => sortedFilteredGroupedSalaries.value, (newGroupedSalaries) => {
  if (newGroupedSalaries.length > 0) {
    const firstYear = newGroupedSalaries[0].year;
    // Auto expand first year if it's not already expanded
    if (!expandedYears.value.includes(firstYear)) {
      expandedYears.value.push(firstYear);
    }
    
    // Only auto-select on initial mount and if no item is selected
    if (!isInitialized.value && !props.selectedSalaryId) {
      const firstYearSalaries = newGroupedSalaries[0].salaries;
      if (firstYearSalaries && firstYearSalaries.length > 0) {
        if (selectedSalary) {
          selectedSalary.value = firstYearSalaries[0];
        }
        // Emit selectSalary event for auto-selected item
        emit('select-salary', firstYearSalaries[0]);
      }
      isInitialized.value = true;
    }
  } else {
    // Clear expanded years if no data
    expandedYears.value = [];
  }
}, { immediate: true });
</script>

<style scoped>
.salary-item {
  background-color: var(--surface-overlay) ;
}

.salary-item:hover {
  background-color: #EBF3FC;
}

.salary-item.salary-selected {
  background-color: #EBF3FC ;
}

</style>