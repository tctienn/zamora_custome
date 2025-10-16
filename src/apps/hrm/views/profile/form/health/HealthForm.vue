<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header=" t(`vehicle.common.${data ? 'update' : 'create'}`) +
      ' ' +
      t('hrm.health.titleForm')"
    style='max-height: 70vh'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='formgrid grid mb-4'>
        <FormInputCalendar
          v-model='health.updateDate'
          class='col-3'
          :label="t('hrm.health.updateDate')"
          name='updateDate'
          required/>
        <FormInputText
          v-model='health.height'
          class='col-3'
          :label="t('hrm.health.height')"
          name='height'/>
        <FormInputText
          v-model='health.weight'
          class='col-3'
          :label="t('hrm.health.weight')"
          name='weight'/>
        <FormInputText
          v-model='health.heartRate'
          class='col-3'
          :label="t('hrm.health.heartRate')"
          name='heartRate'/>

        <FormInputText
          v-model='health.bloodType'
          class='col-3'
          :label="t('hrm.health.bloodType')"
          name='bloodType'/>
        <FormInputText
          v-model='health.bloodPressure'
          class='col-3'
          :label="t('hrm.health.bloodPressure')"
          name='bloodPressure'/>
        <FormInputText
          v-model='health.healthStatus'
          class='col-6'
          :label="t('hrm.health.healthStatus')"
          name='healthStatus'/>

        <FormInputText
          v-model='health.cholesterol'
          class='col-3'
          :label="t('hrm.health.cholesterol')"
          name='cholesterol'/>
        <FormInputText
          v-model='health.triglycerid'
          class='col-3'
          :label="t('hrm.health.triglycerid')"
          name='triglycerid'/>
        <FormInputText
          v-model='health.bloodSugarLevel'
          class='col-3'
          :label="t('hrm.health.bloodSugarLevel')"
          name='bloodSugarLevel'/>
        <FormInputText
          v-model='health.waist'
          class='col-3'
          :label="t('hrm.health.waist')"
          name='waist'/>

        <div class='col-12'>
          <div class='align-items-center flex justify-content-between'>
            <span class='font-bold text-lg'>{{ t('hrm.health.vaccine') }}</span>
            <ButtonIcon
              icon='add_circle'
              icon-size='1.5'
              rounded
              text
              @click='addVaccine'/>
          </div>

          <DataTable
            class='my-3 overflow-auto pb-5'
            data-key='id'
            edit-mode='cell'
            row-hover
            striped-rows
            style='max-height: 40rem'
            :value='listVaccine'>

            <Column
              header='#'
              style='width: 3rem'>
              <template #body='{ index }'>
                {{ index + 1 }}
              </template>
            </Column>

            <Column
              field='doseNumber'
              :header="t('hrm.health.doseNumber')"
              style='min-width: 10vw'>
              <template #body='{ index }'>
                <div class='text-center'>{{ listVaccine[index].doseNumber }}</div>
              </template>
              <template #editor='{ index }'>
                <InputNumber
                  v-model='listVaccine[index].doseNumber'/>
              </template>
            </Column>

            <Column
              field='vaccinationDate'
              :header="t('hrm.health.vaccinationDate')"
              style='min-width: 10vw'>
              <template #body='{ index }'>
                <div class='text-center'>
                  {{
                    listVaccine[index].vaccinationDate ? moment(listVaccine[index].vaccinationDate).format('DD/MM/YYYY') : ''
                  }}
                </div>
              </template>
              <template #editor='{ index }'>
                <Calendar
                  v-model='listVaccine[index].vaccinationDate'
                  date-format='dd/mm/yy'
                  icon-display='input'
                  show-icon/>
              </template>
            </Column>

            <Column
              field='vaccineType'
              :header="t('hrm.health.vaccineType')"
              style='min-width: 10vw'>
              <template #body='{ index }'>
                <div class='text-center'>{{ listVaccine[index].vaccineType }}</div>
              </template>
              <template #editor='{ index }'>
                <InputText v-model='listVaccine[index].vaccineType'/>
              </template>
            </Column>

            <Column
              field='batchNumber'
              :header="t('hrm.health.batchNumber')"
              style='min-width: 10vw'>
              <template #body='{ index }'>
                <div class='text-center'>{{ listVaccine[index].batchNumber }}</div>
              </template>
              <template #editor='{ index }'>
                <InputText v-model='listVaccine[index].batchNumber'/>
              </template>
            </Column>

            <Column
              field='vaccinationFacility'
              :header="t('hrm.health.vaccinationFacility')"
              style='min-width: 10vw'>
              <template #body='{ index }'>
                <div class='text-center'>{{ listVaccine[index].vaccinationFacility }}</div>
              </template>
              <template #editor='{ index }'>
                <InputText v-model='listVaccine[index].vaccinationFacility'/>
              </template>
            </Column>
          </DataTable>

        </div>
      </div>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          :loading='submitForm'
          @click='submit'/>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import Column from 'primevue/column';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getAllEmployeeVaccineInfo,
  saveEmployeeHealth,
  saveEmployeeVaccineInfo
} from '@/apps/hrm/api/graphql/employee-health';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { removeFields } from '@/apps/hrm/helpers/utils';
import type { EmployeeHealth } from '@/apps/hrm/model/employee';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  snapshotId: {
    type: String,
    default: null
  },
  data: {
    type: Object as PropType<EmployeeHealth>,
    default: null
  },
  isCreateDraft: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const submitForm = ref(false);
const { moment } = useMoment();
const health = ref<EmployeeHealth>({} as EmployeeHealth);

if (props.data) {
  health.value = cloneDeep(props.data);
}

const {
  mutate: saveEmployeeHealthMutate,
  onDone: saveEmployeeHealthDone,
  onError: saveEmployeeHealthError
} =
    saveEmployeeHealth();

const {
  mutate: saveEmployeeVaccineInfoMutate,
  onDone: saveEmployeeVaccineInfoDone,
} =
    saveEmployeeVaccineInfo();

const submit = () => {
  const formattedList = listVaccine.value.map(item => ({
    ...item,
    vaccinationDate: item.vaccinationDate
      ? moment(item.vaccinationDate).format(DateTimeFormat.ISO_LOCAL_DATE)
      : null,
  }));
  formattedList.length && saveEmployeeVaccineInfoMutate({ payload: formattedList });
  if (!health.value.updateDate) {
    return;
  }
  submitForm.value = true;
  saveEmployeeHealthMutate({
    payload: removeFields({
      ...health.value,
      id: props.data?.id,
      snapshotId: props.snapshotId || props.data?.snapshotId,
      updateDate: health.value.updateDate
        ? moment(health.value.updateDate).format(DateTimeFormat.ISO_LOCAL_DATE)
        : null,
    } || {}, [
      'createdBy',
      'createdTime',
      'isDeleted',
      'lastModifiedBy',
      'lastModifiedTime',
    ])
  }
  );
};

interface EmployeeVaccineInfo {
  id: string | null;
  snapshotId: string | null;
  doseNumber: any;
  vaccinationDate: any;
  vaccineType: string | null;
  batchNumber: string | null;
  vaccinationFacility: string | null;
  signer: string | null;
  position: string | null;
}

const listVaccine = ref<EmployeeVaccineInfo[]>([]);

const { onResult: getAllEmployeeVaccineInfoResult } = getAllEmployeeVaccineInfo(props.snapshotId);

getAllEmployeeVaccineInfoResult((res) => {
  listVaccine.value = cloneDeep(res.data.getAllEmployeeVaccineInfo);
});

const addVaccine = () => {
  listVaccine.value.push({
    id: null,
    snapshotId: props.snapshotId || props.data?.snapshotId,
    doseNumber: null,
    vaccinationDate: null,
    vaccineType: '',
    batchNumber: null,
    vaccinationFacility: '',
    signer: '',
    position: '',
  });
};

saveEmployeeHealthDone(() => {
  toastSuccess({
    message: t(`common.result.message.${props.data ? 'created' : 'updated'}`, {
      itemType: t('hrm.health.titleForm'),
      itemName: health.value.updateDate,
    }),
  });
  emits('hide-dialog');
  submitForm.value = false;
});

saveEmployeeVaccineInfoDone(() => {
  toastSuccess({
    message: t(`common.result.message.${props.data ? 'created' : 'updated'}`, {
      itemType: t('hrm.health.titleForm'),
      itemName: health.value.updateDate,
    }),
  });
  emits('hide-dialog');
  submitForm.value = false;
});

saveEmployeeHealthError(() => {
  submitForm.value = false;
});
</script>

<style scoped>

</style>