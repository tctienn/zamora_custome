<template>

  <form
    ref='eFormRef'>
    <Card class='e-form'>
      <template #header>
        <div
          class='border-bottom-1 border-gray-500 left-0 py-1 surface-0 top-0 w-full'
          style='z-index: 1000'>
          <div

            class='flex justify-content-between'>
            <div class='flex gap-1'>
              <ButtonIcon
                icon='arrow_back'
                size='small'
                @click='router.back()'/>
              <div class='align-content-center font-semibold text-2xl'>Chi tiết
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div class='formgrid grid'>
          <div class='col-12 flex gap-2'>
            <div class='font-semibold'>{{ t('common.title') }}:</div>
            <div>{{ request.title }}</div>
          </div>

          <div class='col-6 flex gap-2'>
            <div class='font-semibold'>{{ t('hrm.request.leaveType') }}:</div>
            <div>{{ getLeaveType(request.leaveType) }}</div>
          </div>

          <div class='col-6 flex gap-2'>
            <div class='font-semibold'>EFORM:</div>
            <div>{{ eFormName }}</div>
          </div>

          <DataTable
            class='col-12'
            edit-mode='cell'
            :value='expireDates'>
            <template #empty>
              <span class='block font-bold text-600 text-center'>{{
                t('common.emptyRecords', { itemType: 'Danh sách ngày hiệu lực' })
              }}</span>
            </template>
            <Column
              class='text-center w-3rem'
              header='STT'>
              <template #body='{index}'>
                {{ index + 1 }}
              </template>
            </Column>

            <Column
              class='w-30rem'
              field='trainingContent'
              header='Ngày bắt đầu'>
              <template #body='{index}'>
                <div class='flex justify-content-center'>
                  {{
                    expireDates[index].startTime ? moment(expireDates[index].startTime).format('DD/MM/YYYY HH:mm') : ''
                  }}
                </div>
              </template>
            </Column>

            <Column
              class='w-30rem'
              field='scope'
              header='Ngày kết thúc'>
              <template #body='{index}'>
                <div class='flex justify-content-center'>
                  {{
                    expireDates[index].endTime ? moment(expireDates[index].endTime).format('DD/MM/YYYY HH:mm') : ''
                  }}
                </div>
              </template>
            </Column>
          </DataTable>

          <template
            v-for='(expireDate, index) in expireDates'
            :key='index'>
            <input
              hidden
              :name='`expireDate[${ index }].startDate`'
              :value='expireDate.startTime'/>

            <input
              hidden
              :name='`expireDate[${ index }].endDate`'
              :value='expireDate.endTime'/>
          </template>
        </div>

        <EFormFormDisplay
          v-if='eFormConfig'
          class='pt-3'
          :data='request?.data?.data || {}'
          :edit-mode='false'
          :model-value='eFormConfig'/>

      </template>
    </Card>

  </form>
</template>

<script lang='ts' setup>
import camelcase from 'camelcase';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { eForm, eFormFullTree, getEFormConfig } from '@/apps/e-form/api/graphql/e-form';
import EFormFormDisplay from '@/apps/e-form/components/form/EFormFormDisplay.vue';
import { type EFormTree, type ExpireDate } from '@/apps/e-form/model/e-form';
import type { EFormConfigModel } from '@/apps/e-form/model/form-config';
import { getLeaveApplication, updateLeaveApplication } from '@/apps/hrm/api/rest/leave';
import { LeaveType } from '@/apps/hrm/model/leave';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const router = useRouter();
const { t } = useI18n();
const route = useRoute();
const { moment } = useMoment();
const { id } = route.params;
const { result } = eFormFullTree();
const eFormName = ref();

const {
  load,
  refetch,
  result: configResult
} = getEFormConfig();

const eFormConfig = computed(() => configResult.value?.getEFormConfig as EFormConfigModel || {});
const selectedEFormCode = ref<string>();
const expireDates = ref<ExpireDate[]>([] as ExpireDate[]);
const request = ref<any>({});
const eFormTree = computed(() => result.value?.eFormFullTree as EFormTree[] || []);
if (id) {
  getLeaveApplication(id as string).then((res: any) => {
    request.value = { ...res, };
    selectedEFormCode.value = res.eformCode;
    expireDates.value = res.expireDates;
    for (const [key, value] of Object.entries(request.value.data.data)) {
      if (['day', 'Day', 'date', 'Date', 'time', 'Time'].some(item => key.includes(item))) {
        res.data.data[key] = value ? moment(value as string).toDate() : null;
      }
    }

    const { onResult: getEFormResult } = eForm(selectedEFormCode.value);
    getEFormResult((res) => {
      eFormName.value = res.data.eForm.name;
    });
  });
}

watch(selectedEFormCode, (newValue) => {
  if (newValue) {
    load(null, { code: newValue }) || refetch({ code: newValue });
  }
});
const leaveTypes = Object.keys(LeaveType).map(leaveType => {
  return {
    label: t(`hrm.request.leaveTypes.${camelcase(leaveType)}`),
    value: leaveType
  };
});
const eFormRef = ref<HTMLFormElement>();

function submit() {
  if (eFormRef.value) {
    const data = new FormData(eFormRef.value);
    data.forEach((value, key) => {
      console.log(`${key} - ${value}`);
      if (['day', 'Day', 'date', 'Date'].some(item => key.includes(item))) {
        data.set(key, moment(value as string).format(DateTimeFormat.ISO_LOCAL_DATE));
      }
      if (['time', 'Time'].some(item => key.includes(item))) {
        data.set(key, moment(value as string).format(DateTimeFormat.ISO_LOCAL_DATE_TIME));
      }
    });

    updateLeaveApplication(id as string, data)
      .then(() => {
        toastSuccess();
      })
      .catch(() => {
        toastError();
      });
  }
}

function getLeaveType(code: string) {
  return leaveTypes.find((lt) => lt.value == code)?.label ?? '';
}

</script>

<style scoped>
.e-form {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 1024px) {
  .e-form {
    width: 800px;
  }
}

@media (min-width: 1440px) {
  .e-form {
    width: 1200px;
  }
}
</style>