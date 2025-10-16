<template>
  <ProgressBar
    v-if='isLoading'
    class='border-noround'
    mode='indeterminate'
    style='height: .25rem'></ProgressBar>
  <DataTable
    v-else
    v-bind='DEFAULT_DATATABLE_CONFIG'
    class='w-full'
    row-hover
    scroll-direction='both'
    scroll-height='86vh'
    scrollable
    :value='data'>
    <Column
      class='text-center'
      header='TT'
      style='max-width: 3rem'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      body-class='p-0'
      style='max-width: 6rem'>
      <template #body='{ data }'>
        <div class='align-items-center flex gap-2'>
          <HrmAvatar
            :avatar='generateAvatarUrl(data?.employee?.avatar)'
            class='border-round-sm cursor-pointer'
            width='2.5rem'/>
        </div>
      </template>
    </Column>
    <Column
      field='code'
      :header='t("hrm.contract.general.code")'
      style='min-width: 9rem'>
    </Column>
    <Column
      field='type'
      :header='t("hrm.contract.general.type")'
      style='min-width: 12rem'/>
    <Column
      field='organizationName'
      :header='t("hrm.contract.general.organization")'
      style='min-width: 15rem'/>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.effectiveDate")'
      style='min-width: 11rem'>
      <template #body='{data}'>
        {{ data['effectiveDate'] ? moment(data['effectiveDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.expiryDate")'
      style='min-width: 11rem'>
      <template #body='{data}'>
        {{ data['expiryDate'] ? moment(data['expiryDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.signedDate")'
      style='min-width: 10rem'>
      <template #body='{data}'>
        {{ data['signedDate'] ? moment(data['signedDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.createdDate")'
      style='min-width: 10rem'>
      <template #body='{data}'>
        {{ data['createdTime'] ? moment(data['createdTime']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.status")'
      style='min-width: 12rem'>
      <template #body='{data}'>
        <Badge
          class='py-0 status-badge'
          :severity='data["status"] === "VALID" ? "success" : "danger"'
          :value="t(`hrm.contract.statusOptions.${camelcase(data['status'])}`)"></Badge>
      </template>
    </Column>
    <Column
      body-class='text-center'
      style='width: 1rem'>
      <template #body='{data}'>
        <AppIcon
          v-if='data.attachments?.length'
          name='attach_file'
          size='1.3'></AppIcon>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang='ts'>
import camelcase from 'camelcase';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getContractExpire } from '@/apps/hrm/api/graphql/contract';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps<{
  organizationId?: string | null;
}>();
const isLoading = ref(false);
const { moment } = useMoment();
const { t } = useI18n();

const data = ref();
isLoading.value = true;
onMounted(() => {
  getContractExpire(props.organizationId)
    .onResult((res) => {
      data.value = res.data?.getContractExpire;
      isLoading.value = false;
    });
});
</script>

<style scoped>

</style>