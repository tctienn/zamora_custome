<template>
  <div class='flex flex-column gap-2'>
    <div class='align-items-center flex justify-content-between'>
      <span class='font-bold text-primary text-xl'>{{
        t("document.dashboard.aggregateByOrg")
      }}</span>
      <div class='flex gap-2'>
        <TreeSelect
          v-model='deptId'
          :empty-message="t('common.selectEmpty')"
          :filter='true'
          input-id='organizationParent'
          :options='organizations'
          style='min-width: 15rem'>
          <template #value='{ value }'>
            <div class='flex justify-content-between'>
              <span>{{
                value.length > 0
                  ? value[0].label
                  : t("admin.user.chooseOrganization")
              }}</span>
            </div>
          </template>
        </TreeSelect>
        <Dropdown
          v-model='selectedYear'
          :options='years' />
      </div>
    </div>

    <div class='card'>
      <ChartCard
        :data='reportLeadersOfChildrenResult?.reportLeadersOfChildren'/>
    </div>

    <TableLeadersOfDeptChildren
      :data='reportLeadersOfChildrenResult?.reportLeadersOfChildren'/>
    <TableDeptChildren :data='reportChildrenResult?.reportChildren' />
  </div>
</template>

<script lang="ts" setup>
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { getLeaderOrgSummaryConfigsByUserId } from '@/apps/document/api/graphql/leader-org-summary-config';
import {
  reportChildren,
  reportLeadersOfChildren,
} from '@/apps/document/api/graphql/statistic';
import {
  getOrgAndOrgChildrenByOrgId,
  getOrgAndOrgChildrenByUserId,
} from '@/apps/document/helpers/composable/utils';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ChartCard from '@/apps/document/views/dashboard/components/dept/ChartCard.vue';
import TableDeptChildren from '@/apps/document/views/dashboard/components/dept/TableDeptChildren.vue';
import TableLeadersOfDeptChildren from '@/apps/document/views/dashboard/components/dept/TableLeadersOfDeptChildren.vue';
import { listToTree } from '@/common/helpers/utils';

const { t } = useI18n();
const deptId = ref<{ [key: string]: boolean }>({});
const organizations = ref([]);
const selectedYear = ref(new Date().getFullYear());
const years = ref<number[]>([]);

for (let i = 4; i >= 0; i--) {
  years.value.push(selectedYear.value - i);
}
years.value.reverse();

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const daysBefore = 3;

const updateVariables = () => {
  const commonVariables = {
    year: selectedYear.value,
    deptId: Object.keys(deptId.value)[0],
    daysBefore: daysBefore,
    userDeptRole: userDeptRole.value,
  };

  reportLeadersOfChildrenVariables.value = { ...commonVariables };
  reportChildrenVariables.value = { ...commonVariables };
};

watch(deptId, () => {
  if (Object.keys(deptId.value).length > 0) {
    updateVariables();
    reportLeadersOfChildrenLoad();
    reportChildrenLoad();
  }
});

watch(userDeptRole, () => {
  updateVariables();
});

watch(selectedYear, () => {
  updateVariables();
});

const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
const { onResult: getLeaderOrgSummaryConfigsByUserIdResult } =
  getLeaderOrgSummaryConfigsByUserId(userDeptRole.value.userId);

getAllOrganizationResult((response) => {
  const data = get(response, 'data.allOrganizationPublic', []);
  getLeaderOrgSummaryConfigsByUserIdResult((res) => {
    let orgSummary = get(res, 'data.getLeaderOrgSummaryConfigsByUserId', []);
    let orgFilter;
    if (orgSummary) {
      orgFilter = getOrgAndOrgChildrenByOrgId(orgSummary.deptId, data);
    } else {
      orgFilter = getOrgAndOrgChildrenByUserId(userDeptRole.value.userId, data);
    }

    organizations.value = listToTree(
      orgFilter?.map((organization: OrganizationInterface) => ({
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

    deptId.value = { [orgFilter[0].id]: true };
  });
});

const {
  result: reportLeadersOfChildrenResult,
  variables: reportLeadersOfChildrenVariables,
  load: reportLeadersOfChildrenLoad,
} = reportLeadersOfChildren(
  selectedYear.value,
  Object.keys(deptId.value)[0],
  daysBefore,
  userDeptRole.value,
);

const {
  result: reportChildrenResult,
  variables: reportChildrenVariables,
  load: reportChildrenLoad,
} = reportChildren(
  selectedYear.value,
  Object.keys(deptId.value)[0],
  daysBefore,
  userDeptRole.value,
);
</script>

<style scoped></style>
