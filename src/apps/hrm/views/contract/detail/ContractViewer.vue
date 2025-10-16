<template>
  <div class='grid'>
    <Card class='col-12 pl-0'>
      <template #title>{{ t('hrm.contract.general.title') }}</template>
      <template #content>
        <div class='grid'>
          <InfoRow
            :label="t('hrm.contract.general.employee')"
            :value="getLabel(employees, model.employeeId, 'fullName')"/>
          <InfoRow
            :label="t('hrm.contract.general.workType')"
            :value='model.workType || ""'/>
          <InfoRow
            :label="t('hrm.contract.general.code')"
            :value='model.code'/>
          <InfoRow
            :label="t('hrm.contract.general.workLocation')"
            :value='model.workLocation || ""'/>
          <InfoRow
            :label="t('hrm.contract.general.type')"
            :value='model.type'/>
          <div class='col-6 flex p-0'>
            <InfoRow
              :label="t('hrm.contract.general.effectiveDate')"
              :value='formatDate(model.effectiveDate ?? null)'/>
            <InfoRow
              :label="t('hrm.contract.general.expiryDate')"
              :value='formatDate(model.expiryDate ?? null)'/>
          </div>
          <InfoRow
            :label="t('hrm.contract.general.organization')"
            :value='model.organizationName'/>
          <div class='col-6 flex p-0'>
            <InfoRow
              :label="t('hrm.contract.general.workingHoursPerWeek')"
              :value='(model.workingHoursPerWeek)?.toString() || ""'/>
            <InfoRow
              :label="t('hrm.contract.general.employeeType')"
              :value='model.employeeType || ""'/>
          </div>
          <InfoRow
            :label="t('hrm.contract.general.jobTitle')"
            :value='model.jobTitleName'/>
          <div class='col-6 flex p-0'>
            <InfoRow
              :label="t('hrm.contract.general.employeeRank')"
              :value='model.employeeRank || ""'/>
            <InfoRow
              :label="t('hrm.contract.general.signedDate')"
              :value='formatDate(model.signedDate ?? null)'/>
          </div>
          <InfoRow
            :label="t('hrm.contract.general.position')"
            :value='model.positionName'/>
          <InfoRow
            :label="t('hrm.contract.general.manager')"
            :value="findManager(model.managerId || '') || ''"/>
          <InfoRow
            :label="t('hrm.contract.general.rank')"
            :value='model.rank || ""'/>
          <InfoRow
            :label="t('hrm.contract.general.signatory')"
            :value='model.signatory || ""'/>
          <InfoRow
            :label="t('hrm.contract.general.haveInsurance')"
            :value="model.haveInsurance ? t('common.yes') : t('common.no')"/>
          <InfoRow
            class='col-12'
            :label="t('hrm.contract.general.workDescription')"
            :value='model.workDescription || ""'/>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang='ts' setup>

import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { Contract } from '@/apps/hrm/model/contract';
import InfoRow from '@/apps/hrm/views/contract/detail/InfoRow.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps<{
  model: Contract
  employees: any[]
  types: any[]
  organizations: any[]
  jobTitles: any[]
}>();
const { t } = useI18n();
const { moment } = useMoment();
const store = useUserMoreInfoStore();

function getLabel(options: any[], value: any, labelField = 'name') {
  return options?.find((o) => o?.id === value || o?.key === value)?.[labelField] || '';
}

function formatDate(date: Date | string | null | undefined): string {
  return date ? moment(date).format('DD/MM/YYYY') : '';
}

const findManager = (id: string) => {
  return store.allUsers.find((user) => user.id === id)?.username;
};
</script>

<style scoped>
:deep(.p-card-content) {
  padding-bottom: 0;
}
</style>
