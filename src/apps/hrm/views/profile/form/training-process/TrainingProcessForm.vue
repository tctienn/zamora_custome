<template>
  <Dialog
    v-model:visible='visibleForm'
    :header=" t(`vehicle.common.${id ? 'update' : 'create'}`) +
      ' ' +
      t('hrm.trainingProcess.titleForm')"
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='formgrid grid mb-4'>
        <FormInputCalendar
          v-model='trainingProcess.fromMonth'
          class='col-3'
          date-format='mm/yy'
          :label="t('hrm.trainingProcess.fromMonth')"
          name='fromMonth'
          required
          view='month'/>
        <FormInputCalendar
          v-model='trainingProcess.toMonth'
          class='col-3'
          date-format='mm/yy'
          :label="t('hrm.trainingProcess.toMonth')"
          name='toMonth'
          required
          view='month'/>
        <FormInputDropdown
          v-model='trainingProcess.professionalLevel'
          class='col-6'
          :label="t('hrm.trainingProcess.professionalLevel')"
          name='professionalLevel'
          :options='specializedJobs'/>

        <FormInputDropdown
          v-model='trainingProcess.major'
          class='col-6'
          :label="t('hrm.trainingProcess.major')"
          name='major'
          :options='majors'/>
        <FormInputDropdown
          v-model='trainingProcess.issuingPlace'
          class='col-6'
          :label="t('hrm.certificate.issuingPlace')"
          name='issuingPlace'
          :options='issuingPlaces'
          required/>

        <FormInputDropdown
          v-model='trainingProcess.trainingSystem'
          class='col-6'
          :label="t('hrm.trainingProcess.trainingSystem')"
          name='trainingSystem'
          :options='trainingForms'/>
        <FormInputNumber
          v-model='trainingProcess.yearGraduation'
          class='col-3'
          :label="t('hrm.trainingProcess.yearGraduation')"
          :max='9999'
          name='yearGraduation'
          :use-grouping='false'/>

        <FormInputDropdown
          v-model='trainingProcess.classification'
          class='col-6'
          :filter='false'
          :label="t('hrm.trainingProcess.classification')"
          name='classification'
          :options="['Xuất sắc', 'Giỏi','Khá', 'Trung bình khá', 'Trung bình', 'Không xác định', 'Khác']"/>
        <FormInputCalendar
          v-model='trainingProcess.issueDate'
          class='col-3'
          :label="t('hrm.trainingProcess.issueDate')"
          name='issueDate'/>
        <FormInputCheckbox
          v-model='trainingProcess.mainDegree'
          class='col-3'
          :label='t("hrm.trainingProcess.mainDegree")'
          name='mainDegree'/>
        <div class='col-12 pb-4'>
          <AppUpload
            v-model:old-files='trainingProcess.files'
            multiple
            name='files'/>
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
          @click='submitAndClose'/>
        <Button
          v-if='isCreate'
          icon='pi pi-save'
          :label="t('common.saveAndContinue')"
          :loading='submitForm'
          @click='submitAndContinue'/>
      </div>
    </form>
  </Dialog>
</template>

<script lang='ts' setup>

import { cloneDeep, isNull } from 'lodash';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTrainingProcessByIdAndSnapshotId } from '@/apps/hrm/api/graphql/employee-training-process';
import { saveEmployeeTrainingProcess } from '@/apps/hrm/api/rest/employee';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputCheckbox from '@/apps/hrm/components/form/FormInputCheckbox.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import { CATEGORY_TYPE, RELATIONSHIP_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import type { TrainingProcess } from '@/apps/hrm/model/employee';
import AppUpload from '@/common/components/app/upload/AppUpload.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: RELATIONSHIP_TYPE.WITH_YOURSELF
  },
  snapshotId: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    default: null
  },
});

const emits = defineEmits(['hide-dialog']);

const isCreate = isNull(props.id);

const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const submitForm = ref(false);
const { moment } = useMoment();
const isClose = ref(true);
const trainingProcess = ref<TrainingProcess>({} as TrainingProcess);

if (props.id) {
  getTrainingProcessByIdAndSnapshotId(props.id, props.snapshotId).onResult((res: any) => {
    trainingProcess.value = cloneDeep(res.data.getTrainingProcessByIdAndSnapshotId);
  });
}

const submit = async () => {
  try {
    submitForm.value = true;

    if (!form.value) {
      return Promise.reject();
    }

    const data = new FormData(form.value);
    data.append('id', props.id ?? '');
    data.append('snapshotId', props.snapshotId ?? '');
    data.append('employeeId', props.employeeId ?? '');
    await saveEmployeeTrainingProcess(data);

    toastSuccess({
      message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
        itemType: t('hrm.certificate.titleForm'),
        itemName: '',
      }),
    });

    if (!isClose.value) {
      setDefaultForm();
    } else {
      emits('hide-dialog');
    }
  } catch (error) {
    console.error('Error saving certificate:', error);
  } finally {
    submitForm.value = false;
  }
};

const setDefaultForm = () => {
  trainingProcess.value = {};
};

function submitAndContinue() {
  isClose.value = false;
  submit();
}

function submitAndClose() {
  isClose.value = true;
  submit();
}

const majors = ref([]);
const issuingPlaces = ref([]);
const specializedJobs = ref([]);
const trainingForms = ref([]);

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.MAJOR, majors);
  fetchCategoryMappingName(CATEGORY_TYPE.TRAINING_INSTITUTION, issuingPlaces);
  fetchCategoryMappingName(CATEGORY_TYPE.EDUCATION_LEVEL, specializedJobs);
  fetchCategoryMappingName(CATEGORY_TYPE.TRAINING_FORM, trainingForms);
});
</script>

<style scoped>

</style>