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
              <div class='align-content-center font-semibold text-2xl'>Chỉnh sửa
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div class='formgrid grid'>
          <DynamicEFormElement
            v-model='request.title'
            class='col-12'
            :label='t("common.title")'
            :mode='ElementMode.EDIT'
            name='title'
            :type='ElementType.TEXT'/>
          <DynamicEFormElement
            v-model='request.leaveType'
            class='col-6'
            :label='t("hrm.request.leaveType")'
            :mode='ElementMode.EDIT'
            name='leaveType'
            option-label='label'
            option-value='value'
            :options='leaveTypes'
            :type='ElementType.SELECT'/>
          <FormInputWrapper
            v-model='request.eFormCode'
            class='col-6'
            label='EFORM'
            :mode='ElementMode.EDIT'
            name='eFormCode'>
            <CascadeSelect
              v-model='selectedEFormCode'
              class='w-full'
              input-id='eFormCode'
              :option-disabled='(data)=>data["type"] === EFormTreeType.GROUP && (!data["children"] || data["children"]?.length === 0)'
              option-group-children='children'
              option-group-label='name'
              option-label='name'
              option-value='id'
              :options='eFormTree'/>
            <input
              name='eFormCode'
              type='hidden'
              :value='selectedEFormCode'/>
          </FormInputWrapper>

          <div class='col-12 flex justify-content-between'>
            <div class='font-semibold text-lg'>Ngày hiệu lực</div>
            <ButtonIcon
              icon='add_circle'
              icon-size='1.5'
              rounded
              text
              @click='addExpireDate'/>
          </div>
          <DataTable
            class='col-12'
            edit-mode='cell'
            :pt='{
              column: {
                bodyCell: bodyCellFunc
              }
            }'
            :value='expireDates'
            @cell-edit-complete='onCellEditComplete'>
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
              <template #editor='{index}'>
                <NamedInputCalendar
                  v-model='expireDates[index].startTime'
                  hour-format='24'
                  :name='`expireDates[${index}].startTime`'
                  :select-other-months='true'
                  show-icon
                  show-time/>
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
              <template #editor='{index}'>
                <NamedInputCalendar
                  v-model='expireDates[index].endTime'
                  hour-format='24'
                  :name='`expireDates[${index}].endTime`'
                  :select-other-months='true'
                  show-icon
                  show-time/>
              </template>
            </Column>

            <Column class='w-2rem'>
              <template #body='{index}'>
                <ButtonIcon
                  icon='delete'
                  icon-size='1.5'
                  rounded
                  text
                  @click='deleteExpireDate(index)'/>
              </template>
            </Column>
          </DataTable>

          <template
            v-for='(expireDate, index) in expireDates'
            :key='index'>
            <input
              hidden
              :name='`expireDate[${ index }].startTime`'
              :value='expireDate.startTime'/>

            <input
              hidden
              :name='`expireDate[${ index }].endTime`'
              :value='expireDate.endTime'/>
          </template>
        </div>

        <EFormFormDisplay
          v-if='eFormConfig'
          class='pt-3'
          :data='request?.data?.data || {}'
          edit-mode
          :model-value='eFormConfig'/>

      </template>
      <template #footer>
        <Button
          label='Save'
          @click='submit'/>
      </template>
    </Card>

  </form>
</template>

<script lang='ts' setup>
import camelcase from 'camelcase';
import { clone } from 'lodash';
import Column, { type ColumnState } from 'primevue/column';
import DataTable, { type DataTableCellEditCompleteEvent } from 'primevue/datatable';
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { eFormFullTree, getEFormConfig } from '@/apps/e-form/api/graphql/e-form';
import DynamicEFormElement from '@/apps/e-form/components/DynamicEFormElement.vue';
import { ElementMode, ElementType } from '@/apps/e-form/components/element';
import EFormFormDisplay from '@/apps/e-form/components/form/EFormFormDisplay.vue';
import FormInputWrapper from '@/apps/e-form/components/FormInputWrapper.vue';
import { type EFormTree, EFormTreeType, type ExpireDate } from '@/apps/e-form/model/e-form';
import type { EFormConfigModel } from '@/apps/e-form/model/form-config';
import { getLeaveApplication, updateLeaveApplication } from '@/apps/hrm/api/rest/leave';
import { LeaveType } from '@/apps/hrm/model/leave';
import { DateTimeFormat } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const { t } = useI18n();
const route = useRoute();
const { moment } = useMoment();
const { id } = route.params;
const { result } = eFormFullTree();
const router = useRouter();
const bodyCellFunc = (e: { state: ColumnState }) => ({ class: { 'pt-0 pb-0': e.state['d_editing'] } });

const {
  load,
  refetch,
  result: configResult
} = getEFormConfig();

const eFormConfig = computed(() => configResult.value?.getEFormConfig as EFormConfigModel || {});
const eFormTree = computed(() => result.value?.eFormFullTree as EFormTree[] || []);
const selectedEFormCode = ref<string>();
const expireDates = ref<ExpireDate[]>([] as ExpireDate[]);
const modelReactive = reactive<ExpireDate[]>(clone(expireDates.value) || [] as ExpireDate[]);
const request = ref<any>({});

if (id) {
  getLeaveApplication(id as string).then((res: any) => {
    request.value = { ...res, };
    for (const [key, value] of Object.entries(request.value.data.data)) {
      if (['day', 'Day', 'date', 'Date', 'time', 'Time'].some(item => key.includes(item))) {
        res.data.data[key] = value ? moment(value as string).toDate() : null;
      }
    }
    selectedEFormCode.value = res.eformCode;
    expireDates.value = (clone(res.expireDates) || []).map((expireDate: ExpireDate) => {
      return {
        startTime: expireDate.startTime ? moment(expireDate.startTime).toDate() : null,
        endTime: expireDate.endTime ? moment(expireDate.endTime).toDate() : null
      } as ExpireDate;
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

function deleteExpireDate(index: number) {
  expireDates.value = expireDates.value.filter((_, i) => i !== index);
}

function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  modelReactive[event.index] = event.newData as ExpireDate;
}

function addExpireDate() {
  expireDates.value.push({
    startTime: new Date(),
    endTime: new Date()
  } as ExpireDate);
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