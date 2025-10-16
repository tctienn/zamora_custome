import { computed, type ComputedRef } from 'vue';

import { getEmployeeByUserId } from '@/apps/hrm/api/graphql/employee';
import { useUserStore } from '@/common/store/user';

export function useEmployeeByUser() {
  const userStore = useUserStore();
  
  // Get the employee ID for the currently logged in user
  const { result, refetch, loading } = getEmployeeByUserId(userStore.user.id || '');
  
  const employeeId = computed<string | null>(() => {
    const data = result.value?.data;
    if (data?.searchEmployees?.edges?.length > 0) {
      return data.searchEmployees.edges[0].node.id || null;
    }
    return null;
  });
  
  const employeeData = computed(() => {
    const data = result.value?.data;
    if (data?.searchEmployees?.edges?.length > 0) {
      return data.searchEmployees.edges[0].node;
    }
    return null;
  });

  // Function to manually refetch employee data
  function refetchEmployee() {
    if (userStore.user.id) {
      refetch({ userId: userStore.user.id });
    }
  }

  return {
    employeeId,
    employeeData,
    loading: computed(() => loading.value),
    refetchEmployee
  };
}