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
      frozen
      header='TT'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      field='fromMonth'
      :header='t(`hrm.certificate.fromMonth`)'
      style='min-width: 10vw'>
      <template #body='{ data: { fromMonth } }'>
        {{ fromMonth && moment(fromMonth).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='toMonth'
      :header='t(`hrm.certificate.toMonth`)'
      style='min-width: 10vw'>
      <template #body='{ data: { toMonth } }'>
        {{ toMonth && moment(toMonth).format('MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='name'
      frozen
      :header='t(`hrm.certificate.name`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='fromDate'
      :header='t(`hrm.certificate.fromDate`)'
      style='min-width: 7vw'>
      <template #body='{ data: { fromDate } }'>
        {{ fromDate && moment(fromDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='toDate'
      :header='t(`hrm.certificate.toDate`)'
      style='min-width: 10vw'>
      <template #body='{ data: { toDate } }'>
        {{ toDate && moment(toDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='status'
      header='Trạng thái'
      style='min-width: 8vw'>
      <template #body='{ data: { toDate } }'>
        <span
          :class="{
            'text-red-500': moment(toDate).isBefore(moment(), 'day'),
            'text-orange-500': moment(toDate).isSameOrAfter(moment(), 'day')
          }">
          {{
            moment(toDate).isBefore(moment(), 'day')
              ? 'Hết hạn'
              : 'Sắp hết hạn'
          }}
        </span>
      </template>
    </Column>

    <Column
      class='text-center'
      field='content'
      header='Nội dung'
      style='min-width: 10vw'>
      <template #body='{ data: { toDate } }'>
        <span>
          {{
            moment(toDate).isBefore(moment(), 'day')
              ? `Quá hạn ${moment().diff(moment(toDate), 'days')} ngày`
              : `Còn ${moment(toDate).diff(moment(), 'days')} ngày`
          }}
        </span>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getCertificatesExpiringIn30Days } from '@/apps/hrm/api/graphql/employee-training-process';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
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
  getCertificatesExpiringIn30Days(props.organizationId)
    .onResult((res) => {
      data.value = res.data?.getCertificatesExpiringIn30Days;
      isLoading.value = false;
    });
});
</script>

<style scoped>

</style>