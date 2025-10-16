<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    :dismissable='false'
    position='right'
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {width: "80vw"}}'
    :pt="{
      header: {
        class: 'p-2 border-bottom-1 border-gray-500'
      },
      content: {
        class: 'pt-1 pb-0'
      }
    }"
    :show-close-icon='false'
    @hide="emits('hide-dialog')">
    <template #header>
      <div
        class='left-0 surface-0 w-full'
        style='z-index: 1000'>
        <div class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              class='border-round-sm'
              icon='arrow_back'
              severity='danger'
              size='small'
              @click="emits('hide-dialog')"/>
            <div class='align-content-center font-semibold text-2xl'>
              {{ t('hrm.salary.salaryProcessTitle') }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <div>
      <div class='grid grid-nogutter h-full mt-1 w-full'>
        <TreeSelect
          v-model='deptId'
          class='col-5'
          display='chip'
          v-bind='$attrs'
          :options='organizations'
          :pt="{
            labelContainer: {
              style: 'width: 0vw',
            },
          }"
          selection-mode='single'
          @node-select='changeDept'>
        </TreeSelect>
      </div>
      <div class='grid grid-nogutter h-full mt-2 w-full'>
        <div class='branch col-4'>
          <InputText
            v-model='searchText'
            class='mb-2 w-full'
            placeholder='Nhập tên'/>
          <div
            class='border-1 surface-border'
            style='height: 83vh; overflow: auto;'>
            <ProgressBar
              v-if='isLoading'
              class='border-noround'
              mode='indeterminate'
              style='height: .25rem'></ProgressBar>
            <div
              v-for='(data, index) in searchEmployees'
              :key='index'
              class='align-items-center border-top-1 cursor-pointer employee flex hover:surface-hover justify-content-between p-3 surface-border w-full'
              :class='employeeId === data.id ? "surface-hover" : ""'
              @click='employeeId = data.id'>
              <div class='flex flex-column gap-1'>
                <div class='font-bold'>
                  {{ index + 1 }}. {{ data.fullName }}
                </div>
                <div>{{ data.code }}</div>
                <div>{{ data.jobTitleName }} | {{ data.organizationName }}</div>
              </div>
              <AppIcon
                v-tooltip='t("common.create")'
                class='border-circle hover:bg-blue-50 icon-add'
                name='add'
                size='1.7'
                @click='showSalaryProcessFormFunc(data.employeeId)'/>
            </div>
          </div>
        </div>
        <div class='col-8 pl-2'>
          <DataTable
            v-model:selection='selectedRow'
            class='border-1 surface-border'
            v-bind='DEFAULT_DATATABLE_CONFIG'
            :pt="{
              wrapper: {
                class: 'h-full surface-overlay',
              },
            }"
            row-hover
            :value='data'>
            <Column
              class='text-center'
              header='TT'
              style='width: 3rem'>
              <template #body='slotProps'>
                <div
                  class='align-items-center flex items-center justify-content-center'>
                  {{ slotProps.index + 1 }}
                </div>
              </template>
            </Column>

            <Column
              class='text-center'
              header='Tháng/năm'>
              <template #body='{data}'>
                {{ data.createdMonth }}/{{ data.createdYear }}
              </template>
            </Column>

            <Column
              class='text-center'
              header='Hình thức'
              style='width: 15rem'>
              <template #body='{data}'>
                {{ t(`hrm.salary.${data.salaryProcessForm.toLowerCase()}`) }}
              </template>
            </Column>
            <Column
              class='text-center'
              field='salaryScale'
              header='Ngạch'>
            </Column>
            <Column
              class='text-center'
              field='salaryLevel'
              header='Bậc'>
            </Column>
            <Column
              class='text-center'
              field='salaryCoefficient'
              header='Hệ số'>
            </Column>
            <Column
              class='text-center'
              header='Trạng thái'>
              <template #body='{data}'>
                <i
                  v-if='data.status'
                  class='pi pi-check'></i>
              </template>
            </Column>
            <Column
              align-frozen='right'
              body-class='surface-card p-2'
              frozen
              style='max-width: 3rem'>
              <template #body='{data}'>
                <Button
                  icon='pi pi-ellipsis-v'
                  rounded
                  text
                  @click='showActionMenus($event, data)'></Button>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </Sidebar>

  <SalaryProcessForm
    v-if='showSalaryProcessForm'
    :id='selectedRow?.id'
    :employee-id='employeeId'
    :visible-dialog='showSalaryProcessForm'
    @hide-dialog='hideDialogFn'/>

  <Menu
    ref='actionMenusRef'
    :model='actionMenus'
    popup></Menu>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import Column from 'primevue/column';
import type Menu from 'primevue/menu';
import { useConfirm } from 'primevue/useconfirm';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { searchEmployeesMinimal } from '@/apps/hrm/api/graphql/employee';
import { deleteSalaryProcess, getAllSalaryProcessByEmployeeId } from '@/apps/hrm/api/graphql/salary';
import { type EmployeeFilter, EmployeeSnapshotStatus } from '@/apps/hrm/model/employee';
import SalaryProcessForm from '@/apps/hrm/views/salaryAndTax/components/salaryProcess/SalaryProcessForm.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';
import type { Pageable } from '@/common/model/query';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visibleSidebar = ref(props.visible);
const deptId = ref<Record<string, boolean>>({});
const organizations = ref([]);
const listOrganizations = ref([]);
const searchText = ref();
const employees = ref();
const employeeId = ref('');
const data = ref([]);
const showSalaryProcessForm = ref(false);
const selectedRow = ref();
const actionMenusRef = ref();
const isLoading = ref(false);

const {
  onResult: getAllSalaryProcessByEmployeeIdResult,
  refetch: getAllSalaryProcessByEmployeeIdRefetch
} = getAllSalaryProcessByEmployeeId(employeeId.value);

getAllSalaryProcessByEmployeeIdResult((res) => {
  data.value = res.data.getAllSalaryProcessByEmployeeId || [];
});

watch(employeeId, (newVal) => {
  getAllSalaryProcessByEmployeeIdRefetch({ employeeId: newVal });
});

const showActionMenus = (e: Event, data: any) => {
  actionMenusRef.value?.toggle(e);
  selectedRow.value = data;
  employeeId.value = data.employeeId;
};

const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  listOrganizations.value = get(response, 'data.allOrganizationPublic', []);
  listOrganizations.value = listOrganizations.value.filter((item: any) => item.parentCode !== null);
  const tree = listToTree(
    listOrganizations.value.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'data',
      parentId: 'parentId',
      children: 'children',
    },
  );

  tree.forEach((node: any) => {
    if (node.children) {
      node.children = [];
    }
  });
  deptId.value = { [tree[0].key]: true };
  changeDept(tree[0]);
  organizations.value = tree;
});

const changeDept = (node: any) => {
  const key = node.key;
  findEmployeesInOrganization(key);
};

function findEmployeesInOrganization(organizationId: string) {
  isLoading.value = true;
  const pageable: Pageable = {
    page: 0,
    size: 1000,
  };
  const filter: EmployeeFilter = {
    organization: organizationId,
    snapshotStatus: EmployeeSnapshotStatus.ACTIVE,
  };
  searchEmployeesMinimal(filter, pageable).onResult((res) => {
    employees.value = res.data?.searchEmployees?.edges.map((edge: any) => ({ ...edge.node }));
    isLoading.value = false;
  });
}

const searchEmployees = computed(() => {
  if (!searchText.value) {
    return employees.value;
  }
  return employees.value.filter((emp: any) =>
    emp.fullName?.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const showSalaryProcessFormFunc = (id: string) => {
  selectedRow.value = undefined;
  employeeId.value = id;
  showSalaryProcessForm.value = true;
};

const hideDialogFn = () => {
  showSalaryProcessForm.value = false;
  getAllSalaryProcessByEmployeeIdRefetch();
};

const actionMenus = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      showSalaryProcessForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    class: 'delete-action',
    command: () => {
      confirmDelete();
    },
  },
];

const confirm = useConfirm();

const {
  mutate: deleteSalaryProcessMutate,
  onDone: deleteSalaryProcessOnDone
} =
  deleteSalaryProcess();

const confirmDelete = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: t('hrm.salary.salaryProcess') + ' ' + selectedRow.value.createdMonth + '/' + selectedRow.value.createdYear }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteSalaryProcess(selectedRow.value.id);
    },
  });
};

const handleDeleteSalaryProcess = (id: string) => {
  deleteSalaryProcessMutate({ id: id });
};

deleteSalaryProcessOnDone(() => {
  toastSuccess({ message: t('common.deleteSuccess') });
  getAllSalaryProcessByEmployeeIdRefetch();
});
</script>

<style scoped>
.icon-add {
  visibility: hidden;
}

.employee:hover {
  .icon-add {
    visibility: visible;
  }
}
</style>