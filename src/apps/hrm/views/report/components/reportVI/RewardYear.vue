<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width:95vw'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          {{ t('hrm.report.rewardYear') }}
        </div>
        <div class='flex gap-2'>
          <Button
            icon='pi pi-filter'
            label='Điều kiện lập'
            @click='toggleOverlay'/>
          <Button
            icon='pi pi-file-export'
            label='Kết xuất'/>
          <Button
            icon='pi pi-print'
            label='In'/>
          <Button
            icon='pi pi-refresh'/>
        </div>
      </div>
    </template>

    <div class='pt-4'>
      <DataTable
        v-bind='DEFAULT_DATATABLE_CONFIG'
        group-rows-by='employeeId'
        row-group-mode='rowspan'
        row-hover
        scroll-direction='both'
        scroll-height='89vh'
        scrollable
        :show-gridlines='true'
        :value='data'>
        <Column
          class='text-center'
          header='TT'
          style='width: 2vw'>
          <template #body='slotProps'>
            <div
              class='align-items-center flex items-center justify-content-center'>
              {{ slotProps.index + 1 }}
            </div>
          </template>
        </Column>
        <Column
          field='employeeId'
          :header='t("hrm.profile.general.fullName")'
          style='min-width: 200px'>
          <template #body='slotProps'>
            <div class='align-items-center flex gap-2'>
              <span>{{ slotProps.data.fullName }}</span>
            </div>
          </template>
        </Column>

        <Column
          field='position'
          :header='t("hrm.report.position")'
          style='min-width: 200px'>
          <template #body='slotProps'>
            <div class='align-items-center flex gap-2'>
              <span>{{ slotProps.data.position }}</span>
            </div>
          </template>
        </Column>

        <Column
          v-for='(year, index) in yearSet'
          :key='index'
          field='employeeId'
          :header="t('hrm.report.emulationTitles') + ` ${year}`">
          <template #body='slotProps'>
            <div class='align-items-center flex gap-2'>
              <span>
                {{
                  findTitles(
                    slotProps.data.years
                      .filter((y: any) => y.year === year)
                      .flatMap((y: any) => y.titles)
                  )
                }}
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <SearchDropDown
      ref='op'
      :is-right='true'/>
  </Sidebar>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { findAllEmployees } from '@/apps/hrm/api/graphql/employee';
import { reportEmployeeDecisionTitleByYear } from '@/apps/hrm/api/graphql/report';
import SearchDropDown from '@/common/components/app/search/SearchDropDown.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const hideForm = () => {
  emits('hide-dialog');
};
const { moment } = useMoment();
const data = ref<any>([]);
const yearSet = ref<Set<number>>(new Set());

const {
  onResult,
  refetch
} = reportEmployeeDecisionTitleByYear();

const employees = ref([]);
findAllEmployees('').onResult((result) => {
  employees.value = result.data?.findAllEmployees || [];
});

const op = ref<InstanceType<typeof SearchDropDown>>();

function toggleOverlay(event: MouseEvent) {
  op.value?.toggle(event);
}

onResult(res => {
  data.value = res.data.reportEmployeeDecisionTitleByYear;
  getAllYears(data.value);
});

function getAllYears(data: any) {
  data.forEach((emp: any) => {
    emp.years.forEach((y: any) => yearSet.value.add(y.year));
  });

  return Array.from(yearSet.value).sort((a, b) => a - b);
}

const findTitles = (codes: string[]): string => {
  return titles.value
    .filter(t => codes.includes(t.code))
    .map(t => t.name).join(', ');
};

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { onResult: hornorTitleResult } = getAllCategory(userDeptRole.value, 'HONOR_TITLE');
const titles = ref<{ code: string, name: string }[]>([]);
hornorTitleResult((res) => {
  titles.value = res.data.getAllCategory;
});

const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());

watch(submit, () => {
  refetch({ employeeOrganization: model.value.employeeOrganization });
});

setFields({
  employeeOrganization: {
    label: 'Chọn nhân sự',
    col: 6,
    selectedEmployees: true,
    optionsDropdown: employees
  },
});

</script>

<style scoped>

</style>