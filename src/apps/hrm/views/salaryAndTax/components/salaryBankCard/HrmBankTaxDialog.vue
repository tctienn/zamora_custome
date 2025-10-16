<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :header="t('hrm.employee.bankTaxDialogTitle')"
    :show-close-icon='false'
    style='width: 70vw'
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
              {{ t('hrm.employee.bankTaxDialogTitle') }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <div>
      <div class='align-items-center flex justify-content-between mb-2 w-full'>
        <TreeSelect
          v-model='deptId'
          class='w-30rem'
          display='chip'
          v-bind='$attrs'
          :options='organizations'
          selection-mode='single'
          @node-select='changeDept'>
        </TreeSelect>

        <MultiSelect
          v-model='workingStatues'
          class='w-30rem'
          :max-selected-labels='10'
          option-label='label'
          option-value='value'
          :options='employeeWorkingStatusOptions'/>
      </div>

      <DataTable
        v-bind='DEFAULT_DATATABLE_CONFIG'
        row-hover
        selection-mode='single'
        show-gridlines
        :value='data'>
        <Column
          class='text-center'
          header='TT'
          style='width: 4rem'>
          <template #body='slotProps'>
            <div
              class='align-items-center flex items-center justify-content-center'>
              {{ slotProps.index + 1 }}
            </div>
          </template>
        </Column>
        <Column
          field='fullName'
          header='Họ và Tên'>
        </Column>
        <Column
          field='jobTitleName'
          header='Chức vụ'>
        </Column>
        <Column
          class='text-center'
          field='accountNumber'
          header='Số tài khoản'>
        </Column>
        <Column
          field='bank'
          header='Tên ngân hàng'></Column>
        <Column
          field='bankBranch'
          header='Tên chi nhánh'></Column>
      </DataTable>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>

import camelcase from 'camelcase';
import { get } from 'lodash';
import Column from 'primevue/column';
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { findEmployeeBankTaxByOrganization } from '@/apps/hrm/api/graphql/employee-bank-tax';
import { EmployeeWorkingStatus } from '@/apps/hrm/model/employee';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog']);
const visibleForm = ref(props.visibleDialog);
const { t } = useI18n();
const organizations = ref([]);
const listOrganizations = ref([]);
const deptId = ref<Record<string, boolean>>({});

const pageable = reactive({
  page: 0,
  size: 25000,
  sort: [],
});

const employeeWorkingStatusOptions = Object.values(EmployeeWorkingStatus).map(status => ({
  label: t(`hrm.profile.employeeStatusOptions.${camelcase(status)}`),
  value: status
}));

const data = ref([]);
const workingStatues = ref<string[]>(Object.values(EmployeeWorkingStatus).map(status => status));

const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  listOrganizations.value = get(response, 'data.allOrganizationPublic', []);
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

  deptId.value = { [tree[0].key]: true };
  changeDept(tree[0]);
  organizations.value = tree;
});

const changeDept = (node: any) => {
  const key = node.key;
  findEmployeeBankTaxByOrganizationRefetch({
    workingStatues: workingStatues.value,
    organization: key,
    pageable
  });
};

const {
  onResult: findEmployeeBankTaxByOrganizationResult,
  refetch: findEmployeeBankTaxByOrganizationRefetch
} = findEmployeeBankTaxByOrganization(workingStatues.value, Object.keys(deptId.value)[0], pageable);

findEmployeeBankTaxByOrganizationResult((result) => {
  data.value = result.data.findEmployeeBankTaxByOrganization.edges.map((edge: any) => ({ ...edge.node }));
});

watch(workingStatues, () => {
  findEmployeeBankTaxByOrganizationRefetch({
    workingStatues: workingStatues.value,
    organization: Object.keys(deptId.value)[0],
    pageable
  });
}, { deep: true });
</script>

<style scoped>

</style>