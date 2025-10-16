<template>
  <div class='flex flex-column gap-2'>
    <div class='align-items-center flex justify-content-between'>
      <span class='font-bold text-primary text-xl'>{{
        t("document.dashboard.aggregateByOrg")
      }}</span>
      <div class='flex gap-2'>
        <Dropdown
          v-model='selectedYear'
          :options='years' />
      </div>
    </div>

    <div class='card flex justify-content-center'>
      <DocDoughnutChart
        :doc-in-total='docInTotal'
        :doc-out-total='docOutTotal'/>
    </div>

    <div class='grid'>
      <div class='col-6'>
        <div class='font-bold'>Tổng hợp Văn bản đến theo loại</div>
        <TableDocByType
          class='mt-2'
          :data='docInCountByTypeInDeptResult?.docInCountByTypeInDept'/>
      </div>
      <div class='col-6'>
        <div class='font-bold'>Tổng hợp Văn bản đi theo loại</div>
        <TableDocByType
          class='mt-2'
          :data='docOutCountByTypeInDeptResult?.docOutCountByTypeInDept'/>
      </div>
      <div class='col-6'>
        <div class='font-bold'>Tổng hợp Văn bản đến theo lĩnh vực</div>
        <TableDocByArea
          class='mt-2'
          :data='docInCountByAreaInDeptResult?.docInCountByAreaInDept'/>
      </div>
      <div class='col-6'>
        <div class='font-bold'>Tổng hợp Văn bản đi theo lĩnh vực</div>
        <TableDocByArea
          class='mt-2'
          :data='docOutCountByAreaInDeptResult?.docOutCountByAreaInDept'/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  docInCountByAreaInDept,
  docInCountByTypeInDept,
  docOutCountByAreaInDept,
  docOutCountByTypeInDept,
} from '@/apps/document/api/graphql/statistic';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocDoughnutChart from '@/apps/document/views/dashboard/components/dept/DocDoughnutChart.vue';
import TableDocByArea from '@/apps/document/views/dashboard/components/dept/TableDocByArea.vue';
import TableDocByType from '@/apps/document/views/dashboard/components/dept/TableDocByType.vue';

const { t } = useI18n();
const selectedYear = ref(new Date().getFullYear());
const years = ref<number[]>([]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
for (let i = 4; i >= 0; i--) {
  years.value.push(selectedYear.value - i);
}
years.value.reverse();

watch(selectedYear, () => {
  updateVariables();
});

const updateVariables = () => {
  const commonVariables = {
    year: selectedYear.value,
    deptId: userDeptRole.value.deptId,
  };
  docInCountByTypeInDeptVariables.value = { ...commonVariables };
  docInCountByAreaInDeptVariables.value = { ...commonVariables };
  docOutCountByTypeInDeptVariables.value = { ...commonVariables };
  docOutCountByAreaInDeptVariables.value = { ...commonVariables };
};

const {
  result: docInCountByTypeInDeptResult,
  variables: docInCountByTypeInDeptVariables,
} = docInCountByTypeInDept(selectedYear.value, userDeptRole.value.deptId);

const docInTotal = computed(() =>
  docInCountByTypeInDeptResult.value?.docInCountByTypeInDept.reduce(
    (acc: number, item: any) => acc + (item.count | 0),
    0,
  ),
);

const {
  result: docInCountByAreaInDeptResult,
  variables: docInCountByAreaInDeptVariables,
} = docInCountByAreaInDept(selectedYear.value, userDeptRole.value.deptId);

const {
  result: docOutCountByTypeInDeptResult,
  variables: docOutCountByTypeInDeptVariables,
} = docOutCountByTypeInDept(selectedYear.value, userDeptRole.value.deptId);

const docOutTotal = computed(() =>
  docOutCountByTypeInDeptResult.value?.docOutCountByTypeInDept.reduce(
    (acc: number, item: any) => acc + (item.count | 0),
    0,
  ),
);

const {
  result: docOutCountByAreaInDeptResult,
  variables: docOutCountByAreaInDeptVariables,
} = docOutCountByAreaInDept(selectedYear.value, userDeptRole.value.deptId);
</script>

<style scoped></style>
