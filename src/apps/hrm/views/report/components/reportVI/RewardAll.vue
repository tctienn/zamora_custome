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
          {{ t('hrm.report.rewardAll') }}
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
        class='white-space-nowrap'
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
          field='noDecision'
          header='Số quyết định'
          header-class='w-10rem'/>

        <Column
          header='Ngày quyết định'
          header-class='w-15rem'>
          <template #body='{data: {decisionDate}}'>
            <div class='flex justify-content-center'>
              {{ decisionDate ? moment(decisionDate).format('DD/MM/YYYY') : '' }}
            </div>
          </template>
        </Column>

        <Column
          header='Cấp khen thưởng'
          header-class='w-20rem'>
          <template #body='{data: {decisionMakingLevelName}}'>
            <div class='flex justify-content-center'>
              {{ decisionMakingLevelName }}
            </div>
          </template>
        </Column>

        <Column
          header='Hình thức khen thưởng'
          header-class='w-10rem'>
          <template #body='{data}'>
            <div class='flex justify-content-center'>
              {{ findForm(data?.employeeCommendations?.[0]?.form) }}
            </div>
          </template>
        </Column>

        <Column
          field='description'
          header='Nội dung'
          header-class='w-20rem'/>
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
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { getAllEmployeeInfo } from '@/apps/hrm/api/graphql/employee';
import { reportAdvanceReward } from '@/apps/hrm/api/graphql/report';
import SearchDropDown from '@/common/components/app/search/SearchDropDown.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useGlobalSearchStore } from '@/common/store/search';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const { moment } = useMoment();
const visible = defineModel('visible', { type: Boolean });
const hideForm = () => {
  emits('hide-dialog');
};
const op = ref<InstanceType<typeof SearchDropDown>>();

function toggleOverlay(event: MouseEvent) {
  op.value?.toggle(event);
}

const data = ref<any>([]);
const users = ref([]);
const {
  onResult,
  refetch
} = reportAdvanceReward();

onResult(res => {
  data.value = res.data.reportAdvanceReward;
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { onResult: formRewardResult } = getAllCategory(userDeptRole.value, 'FORM_REWARD');
const formRewards = ref<{ code: string, name: string }[]>([]);
formRewardResult((res) => {
  formRewards.value = res.data.getAllCategory;
});

function findForm(formCode: string) {
  if (!formCode) {
    return;
  }
  return formRewards.value.find((f: any) => f.code == formCode)?.name;
}

getAllEmployeeInfo().onResult((res) => {
  users.value = res.data.getAllEmployeeInfo;
});

const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());

watch(submit, () => {
  refetch({ year: new Date(model.value.year).getFullYear() });
});

setFields({
  year: {
    label: 'Chọn năm',
    col: 6,
    selectedYear: true
  },
});
</script>

<style scoped>
.white-space-nowrap {
  white-space: nowrap;
}
</style>