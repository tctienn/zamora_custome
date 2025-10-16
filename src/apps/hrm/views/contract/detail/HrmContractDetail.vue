<template>
  <div>
    <ContractView
      :employees='employees'
      :job-titles='jobTitles'
      :model='model'
      :organizations='organizations'
      :types='types'/>
    <HrmContractSalaryView
      v-if='model?.salary'
      :model='model.salary'/>
    <OldFileViewer
      v-if='model.attachments'
      id='app-upload'
      :old-files='model.attachments'/>
  </div>
</template>

<script lang='ts' setup>

import type { TreeNode } from 'primevue/treenode';
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findAllEmployees } from '@/apps/hrm/api/graphql/employee';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { convertToOrganizationTreeNodes, fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import type { Contract } from '@/apps/hrm/model/contract';
import ContractView from '@/apps/hrm/views/contract/detail/ContractViewer.vue';
import HrmContractSalaryView from '@/apps/hrm/views/contract/detail/HrmContractSalaryView.vue';
import OldFileViewer from '@/apps/hrm/views/contract/detail/OldFileViewer.vue';

const model = defineModel({
  type: Object as PropType<Contract>,
  default: {} as Contract
});

const store = useUserMoreInfoStore();
const { t } = useI18n();
const employees = ref([]);
const workTypes = ref([]);
const workLocations = ref([]);
const types = ref([]);
const employeeTypes = ref([]);
const jobTitles = ref([]);
const employeeRanks = ref([]);
const positions = ref([]);
const organizations = ref<TreeNode[]>([]);
const ranks = ref([]);

onMounted(() => {
  findAllEmployees('').onResult((result) => {
    employees.value = result.data?.findAllEmployees || [];
  });
  fetchCategoryMappingName(CATEGORY_TYPE.WORK_TYPE, workTypes);
  fetchCategoryMappingName(CATEGORY_TYPE.WORK_LOCATION, workLocations);
  fetchCategoryMappingName(CATEGORY_TYPE.CONTRACT_TYPE, types);
  fetchCategoryMappingName(CATEGORY_TYPE.EMPLOYEE_TYPE, employeeTypes);
  fetchCategoryMappingName(CATEGORY_TYPE.JOB_TITLE, jobTitles);
  fetchCategoryMappingName(CATEGORY_TYPE.PERSONNEL_LEVEL, employeeRanks);
  fetchCategoryMappingName(CATEGORY_TYPE.JOB_POSITION, positions);
  fetchCategoryMappingName(CATEGORY_TYPE.LEVEL, ranks);

  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  });
  store.fetchAllUsers();
});

</script>

<style scoped>

</style>
