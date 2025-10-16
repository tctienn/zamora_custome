<template>
  <div
    class='border-round h-full overflow-x-auto w-full'
    style='background-color: var(--surface-e)'>
    <TabMenu
      v-model:activeIndex='activeTab'
      class='tab-menu-pagination'
      :model='menus'
      style='margin-bottom: 1px'>
      <template #item='{item}'>
        <div
          v-ripple
          class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
          <a style='height: 1.5rem'>{{ item.label }}</a>
          <Badge
            v-if='item["count"]'
            :class="{
              'text-white': item['severity'] === 'secondary'
            }"
            :severity="item['severity']"
            :value='item["count"]'></Badge>
        </div>
      </template>
    </TabMenu>
    <div class='full-height-table-wrapper'>
      <HrmProfileListTable
        v-if="viewType === 'all'"
        :active-tab='activeTab'
        :employee-selected='employeeSelected'
        :employees='employees'
        :loading='loading'
        :pageable='pageable'
        :size='size'
        @data:detail-visible='(val: boolean) => detailVisible = val'
        @data:employee-selected='(val: string) => employeeSelected = val'
        @data:profile-edit='(val: Employee) => profileEdit = val'
        @menu:show-action='showActionMenus'/>
      <HrmProfileListTableFilter
        v-else
        :active-tab='activeTab'
        :employee-selected='employeeSelected'
        :group-field='viewType'
        :loading='loading'
        :pageable='pageable'
        :profile-data='employees'
        :size='size'
        @data:detail-visible='(val: boolean) => detailVisible = val'
        @data:employee-selected='(val: string) => employeeSelected = val'
        @data:profile-edit='(val: Employee) => profileEdit = val'
        @menu:show-action='showActionMenus'/>
    </div>
    <Menu
      ref='actionMenusRef'
      :model='actionMenus'
      popup></Menu>
    <HrmGrantUserToProfile
      v-model:visible='grantToUserVisible'
      :employee-id='selectedEmployee.id'
      :user-id='selectedEmployee.userId'/>
    <HrmChangeProfileStatus
      v-model:visible='setProfileStatusVisible'
      :employee-id='selectedEmployee.id'
      :status='selectedEmployee.status'/>
    <!-- Advanced Search Dialog -->
    <HrmAdvanceSearch
      v-model:visible='showAdvanceSearch'
      :pageable='pageable'
      @submit-advanced-search='handleAdvancedSearchSubmit'/>
  </div>

</template>

<script lang='ts' setup>

import camelcase from 'camelcase';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { inject, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import {
  countEmployeeWorkingStatus,
  lockEmployee,
  searchEmployees,
  unlockEmployee
} from '@/apps/hrm/api/graphql/employee';
import {
  ApproveEmployeeProfile, deletePersonalDraft,
  findEmployeeByIdAndSnapshot,
  RejectEmployeeProfile
} from '@/apps/hrm/api/rest/employee';
import type { StatusCount } from '@/apps/hrm/model/count';
import {
  type Employee,
  type EmployeeFilter,
  EmployeeSnapshotStatus,
  type EmployeeSummary,
  EmployeeWorkingStatus
} from '@/apps/hrm/model/employee';
import HrmAdvanceSearch from '@/apps/hrm/views/profile/dialog/HrmAdvanceSearch.vue';
import HrmChangeProfileStatus from '@/apps/hrm/views/profile/dialog/HrmChangeProfileStatus.vue';
import HrmGrantUserToProfile from '@/apps/hrm/views/profile/dialog/HrmGrantUserToProfile.vue';
import HrmProfileListTable from '@/apps/hrm/views/profile/list/HrmProfileListTable.vue';
import HrmProfileListTableFilter from '@/apps/hrm/views/profile/list/HrmProfileListTableFilter.vue';
import { confirmDanger } from '@/common/helpers/custom-confirmation-service';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { assignIfExists } from '@/common/helpers/utils';
import type { Connection } from '@/common/model/page';
import type { Pageable } from '@/common/model/query';
import { useHrmProfileStore } from '@/common/store/hrm-profile';
import { useGlobalSearchStore } from '@/common/store/search';

const { moment } = useMoment();
const { t } = useI18n();
const size = 50;
const activeTab = ref(1);
const showAdvanceSearch = ref<boolean>(false);
const pageable = reactive<Pageable>({
  page: 0,
  size
});
const filter = reactive<EmployeeFilter>({ workingStatus: EmployeeWorkingStatus.WORKING });
const {
  setEmployeeData,
  callRefetchCountTree,
  setRefetchCountTable
} = useHrmProfileStore();
const {
  submit,
  model,
  showAdvancedSearch
} = storeToRefs(useGlobalSearchStore());
const { setAdvancedSearch } = useGlobalSearchStore();
const paginator = inject('pageable') as any;
let total = inject('total') as any;

const {
  result,
  loading,
  load: loadSearch,
  refetch
} = searchEmployees(filter, pageable);
const employees = ref<EmployeeSummary[]>([]);

watch(result, () => {
  if (!isUsingAdvancedSearch.value) {
    total.value = (result.value?.searchEmployees as Connection<EmployeeSummary>)?.totalCount || 0;
    employeeSelected.value = '';
  }
});

watchEffect(() => {
  pageable.page = paginator.page;
  showAdvanceSearch.value = showAdvancedSearch.value;
});

const actionMenus = ref<MenuItem[]>();
const hasPermission = usePermissionStore().hasPermission;
const actionMenusRef = ref<InstanceType<typeof Menu>>();
const organizationId = inject('organizationId', ref<string>());
const initialOrganizationId = inject('initialOrganizationId', ref<string>());
const snapshotStatus = inject('snapshotStatus', ref<EmployeeSnapshotStatus>());
const employeeSelected = ref<string>('');
const menus = reactive<MenuItem[]>(createMenus());
const selectedEmployee = reactive<EmployeeSummary>({});
const grantToUserVisible = ref(false);
const setProfileStatusVisible = ref(false);
const {
  $reset,
  setIsUsingAdvancedSearch
} = useGlobalSearchStore();
const { isUsingAdvancedSearch } = storeToRefs(useGlobalSearchStore());
const isUsingAdvancedSearchRef = ref(false);
const {
  onResult: onCountWorkingStatusResult,
  refetch: countWorkingStatusRefetch
} = countEmployeeWorkingStatus(snapshotStatus.value, organizationId.value);

watchEffect(() => {
  isUsingAdvancedSearchRef.value = isUsingAdvancedSearch.value;
  if (isUsingAdvancedSearch.value) {
    $reset();
  } else {
  }
});

watch(organizationId, (value) => {

  filter.organization = value;
  pageable.page = 0;

  if (value && !isUsingAdvancedSearchRef.value) {
    loadSearch();
  }

  countWorkingStatusRefetch({
    snapshotStatus: snapshotStatus.value,
    organization: value
  });
});

watch(snapshotStatus, (value) => {
  filter.snapshotStatus = value;
  if (value && !isUsingAdvancedSearchRef.value) {
    loadSearch();
  }
  countWorkingStatusRefetch({
    snapshotStatus: value,
    organization: organizationId.value
  });
});

watch(submit, () => {
  setIsUsingAdvancedSearch(false);
  if (model.value.organization) {
    const orgKey = Object.keys(model.value.organization)[0];
    assignIfExists(filter, 'organization', orgKey);
    organizationId.value = orgKey;
  } else {
    organizationId.value = initialOrganizationId.value;
    filter.organization = initialOrganizationId.value;
  }
  assignIfExists(filter, 'jobPositions', model.value.jobPositions);
  assignIfExists(filter, 'gender', model.value.gender);
  assignIfExists(filter, 'homeTown', model.value.homeTown);
  assignIfExists(filter, 'highestLevel', model.value.highestLevel);
  assignIfExists(filter, 'permanentResident', model.value.permanentResident);
  assignIfExists(filter, 'trainingType', model.value.trainingType);
  assignIfExists(filter, 'nation', model.value.nation);
  assignIfExists(filter, 'joinDateFrom', model.value.joinDateFrom ? moment(model.value.joinDateFrom).format('YYYY-MM-DD') : null);
  assignIfExists(filter, 'joinDateTo', model.value.joinDateTo ? moment(model.value.joinDateTo).format('YYYY-MM-DD') : null);
  assignIfExists(filter, 'birthDayFrom', model.value.birthDayFrom ? moment(model.value.birthDayFrom).format('YYYY-MM-DD') : null);
  assignIfExists(filter, 'birthDayTo', model.value.birthDayTo ? moment(model.value.birthDayTo).format('YYYY-MM-DD') : null);
  assignIfExists(filter, 'specialized', model.value.specialized);
  assignIfExists(filter, 'maritalStatus', model.value.maritalStatus);
  assignIfExists(filter, 'professionalLevel', model.value.professionalLevel);
  assignIfExists(filter, 'isParty', model.value.isParty);
  assignIfExists(filter, 'isMember', model.value.isMember);
  assignIfExists(filter, 'militaryService', model.value.militaryService);

  pageable.page = 0;

  loadSearch();
  countWorkingStatusRefetch({
    snapshotStatus: snapshotStatus.value,
    organization: filter.organization
  });
});

onCountWorkingStatusResult((res) => {
  if (res.loading) {
    return;
  }
  const counts = res.data.countEmployeeWorkingStatus as StatusCount[] || [];

  menus.forEach(m => {
    const c = counts.find(c => c.status === m['code']);
    m['count'] = c?.count || 0;
  });

  const allMenuItem = menus.find(m => m['code'] === 'all');
  if (allMenuItem) {
    allMenuItem['count'] = counts.reduce((acc, c) => acc + c.count, 0);
  }
});

function createMenus(): MenuItem[] {
  const severities = ['success', 'danger', 'warning', 'secondary', 'secondary', 'secondary', 'contrast'];
  const map = Object.keys(EmployeeWorkingStatus).map((s, index) => ({
    label: t(`hrm.profile.employeeStatusOptions.${camelcase(s)}`),
    code: s,
    command: () => {
      filter.workingStatus = EmployeeWorkingStatus[s as keyof typeof EmployeeWorkingStatus];
    },
    severity: severities[index % severities.length],
  }));
  return [
    {
      label: t('hrm.profile.employeeStatusOptions.all'),
      code: 'all',
      command: () => {
        filter.workingStatus = undefined;
      }
    },
    ...map];
}

function showActionMenus(event: Event, data: EmployeeSummary) {
  actionMenus.value = [
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      visible: hasPermission('/HRM/HRM_PROFILE/HRM_PROFILE_CURRENT/UPDATE'),
      command: () => {
        if (data.id && data.snapshotId) {
          employeeSelected.value = data.id;
          edit(data.id, data.snapshotId);
        }
      }
    },
    {
      label: t('common.approve'),
      visible: snapshotStatus.value === 'PENDING',
      icon: 'pi pi-check',
      command: () => {
        if (data.id && data.snapshotId) {
          ApproveProfile(data.id, data.snapshotId);
        }
      }
    },
    {
      label: t('common.reject'),
      visible: snapshotStatus.value === 'PENDING',
      icon: 'pi pi-ban',
      command: () => {
        if (data.id && data.snapshotId) {
          RejectProfile(data.id, data.snapshotId);
        }
      }
    },
    {
      label: t('hrm.profile.employeeActionOptions.grantToUser'),
      icon: 'pi pi-user',
      visible: snapshotStatus.value !== 'PENDING',
      command: () => openGrantToUserDialog(data)
    },
    // {
    //   label: t('hrm.profile.employeeActionOptions.lockUser'),
    //   icon: 'pi pi-lock',
    //   visible: snapshotStatus.value !== 'PENDING',
    //   command: () => {
    //   }
    // },
    // {
    //   label: data.locked ? t('hrm.profile.employeeActionOptions.unlockProfile') : t('hrm.profile.employeeActionOptions.lockProfile'),
    //   visible: snapshotStatus.value !== 'PENDING',
    //   icon: data.locked ? 'pi pi-unlock' : 'pi pi-lock',
    //   command: () => lockOrUnlock(data)
    // },
    // {
    //   label: t('hrm.profile.employeeActionOptions.setStatus'),
    //   visible: snapshotStatus.value !== 'PENDING',
    //   icon: 'pi pi-tag',
    //   command: () => openSetProfileStatusDialog(data)
    // },
    {
      label: t('common.delete'),
      visible: snapshotStatus.value !== 'PENDING' && hasPermission('/HRM/HRM_PROFILE/HRM_PROFILE_CURRENT/DELETE'),
      icon: 'pi pi-trash',
      command: () => {
        deletePersonalDraft(data.snapshotId ?? '').then(() => {
          toastSuccess({ message: `Xóa hồ sơ của ${data.fullName} thành công.` });
        });
        callRefetchCountTree();
      }
    }
  ];
  actionMenusRef.value?.toggle(event);
}

const profileEdit = inject('profileEdit', ref<Employee>());
const formVisible = inject('formVisible', ref(false));
const detailVisible = inject('detailVisible', ref(false));
const needRefresh = inject('needRefresh', ref(false));
const searchTerm = inject('searchTerm', ref(''));
const viewType = inject('viewType', ref(''));

watch(
  [() => loading.value, () => result.value, () => viewType.value],
  ([loadingVal, resultVal, viewType]) => {
    if (isUsingAdvancedSearchRef.value) {
      return;
    }
    if (loadingVal) {
      employees.value = [];
      return;
    }

    const items = (resultVal?.searchEmployees as Connection<EmployeeSummary>)?.edges?.map(e => {
      // Deep clone để tránh shared reference
      const node = JSON.parse(JSON.stringify(e.node));
      const city = node.homeTown;
      const cityFilter = city?.split(/[,.-]/).pop()?.trim() ?? '';
      return {
        ...node,
        cityFilter
      };
    }) || [];

    if (viewType) {
      employees.value = [...items].sort((a: EmployeeSummary, b: EmployeeSummary) => {
        const valA = a[viewType as keyof EmployeeSummary];
        const valB = b[viewType as keyof EmployeeSummary];

        if (valA == null && valB == null) {
          return 0;
        }
        if (valA == null) {
          return 1;
        }
        if (valB == null) {
          return -1;
        }

        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          return valA === valB ? 0 : valA ? -1 : 1;
        }

        return (valA?.toString() ?? '').localeCompare(valB?.toString() ?? '');
      });
    } else {
      employees.value = items;
    }
    setEmployeeData(employees.value);

  },
  { immediate: true }
);

watch(() => searchTerm.value, (value) => {
  filter.keyword = value.trim().toLowerCase();
  pageable.page = 0;
  if (value && !isUsingAdvancedSearchRef.value) {
    loadSearch();
  }
});

watch(needRefresh, () => {
  if (needRefresh.value) {
    refetch();
    needRefresh.value = false;
  }
});

// watch(() => employees.value,
//   (val) => {
//     setEmployeeData(val);
//   }
// );

const ApproveProfile = (employeeId: string, snapshotId: string) => {
  ApproveEmployeeProfile(employeeId, snapshotId).then(e => {
    if (e) {
      toastSuccess({ message: t('admin.userGroup.addUser') });
      needRefresh.value = true;
    }
  });
};

const RejectProfile = (employeeId: string, snapshotId: string) => {
  RejectEmployeeProfile(employeeId, snapshotId).then(e => {
    if (e) {
      toastSuccess();
      needRefresh.value = true;
    }
  });
};

function edit(id: string, snapshotId: string) {
  findEmployeeByIdAndSnapshot(id, snapshotId).then(e => {
    if (e) {
      profileEdit.value = e;
      formVisible.value = true;
    }
  });
}

function openGrantToUserDialog(data: EmployeeSummary) {
  Object.assign(selectedEmployee, data);
  grantToUserVisible.value = true;
}

function openSetProfileStatusDialog(data: EmployeeSummary) {
  Object.assign(selectedEmployee, data);
  setProfileStatusVisible.value = true;
}

function lockOrUnlock(data: EmployeeSummary) {
  confirmDanger({
    message: data.locked ? t('hrm.profile.employeeActionOptions.unlockProfileConfirm')
      : t('hrm.profile.employeeActionOptions.lockProfileConfirm'),
    header: t('common.confirm'),
    accept: () => {
      const promise = data.locked ? unlockEmployee().mutate({ id: data.id })
        : lockEmployee().mutate({ id: data.id });
      promise.then(() => {
        toastSuccess();
        refetch();
      }).catch(() => toastError());
    }

  });
}

function handleAdvancedSearchSubmit(searchResult: Connection<EmployeeSummary>, loadingAdvanced: boolean, count: number) {
  if (loadingAdvanced) {
    employees.value = [];
    return;
  }
  const items = searchResult?.edges?.map(e => {
    // Deep clone để tránh shared reference
    const node = JSON.parse(JSON.stringify(e.node));
    const city = node.homeTown;
    const cityFilter = city?.split(/[,.-]/).pop()?.trim() ?? '';
    return {
      ...node,
      cityFilter
    };
  }) || [];
  if (viewType.value) {
    employees.value = [...items].sort((a: EmployeeSummary, b: EmployeeSummary) => {
      const valA = a[viewType.value as keyof EmployeeSummary];
      const valB = b[viewType.value as keyof EmployeeSummary];

      if (valA == null && valB == null) {
        return 0;
      }
      if (valA == null) {
        return 1;
      }
      if (valB == null) {
        return -1;
      }

      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return valA === valB ? 0 : valA ? -1 : 1;
      }

      return (valA?.toString() ?? '').localeCompare(valB?.toString() ?? '');
    });
  } else {
    employees.value = items;
  }

  total.value = count;
  setAdvancedSearch(false);

  countWorkingStatusRefetch({
    snapshotStatus: snapshotStatus.value,
    organization: '' // Empty organization to count across all organizations
  });
}

onUnmounted(() => {
  employeeSelected.value = '';
});

onMounted(() => {

  setRefetchCountTable(() => {
    countWorkingStatusRefetch({
      snapshotStatus: snapshotStatus.value,
      organization: filter.organization
    });
  });
});
</script>

<style scoped>

.text-red {
  color: var(--red-300);
}

:deep(.p-paginator .p-paginator-first) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-prev) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-next) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-last) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-dropdown) {
  height: 2rem;

}

:deep(.p-dropdown-trigger) {
  width: 2rem;
}

:deep(.p-inputtext) {
  padding: .35rem .75rem
}

:deep(.p-badge.p-badge-danger) {
  background-color: var(--text-red) !important;
}
</style>
