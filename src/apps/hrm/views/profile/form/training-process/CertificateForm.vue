<template>
  <Dialog
    v-model:visible='visibleForm'
    :header=" t(`vehicle.common.${id ? 'update' : 'create'}`) +
      ' ' +
      t('hrm.certificate.titleForm')"
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='formgrid grid mb-4'>
        <FormInputDropdown
          v-model='certificate.name'
          class='col-6'
          :label="t('hrm.certificate.name')"
          name='name'
          :options='certificates'/>
        <FormInputCalendar
          v-model='certificate.fromMonth'
          class='col-3'
          date-format='mm/yy'
          :label="t('hrm.certificate.fromMonth')"
          name='fromMonth'
          view='month'/>
        <FormInputCalendar
          v-model='certificate.toMonth'
          class='col-3'
          date-format='mm/yy'
          :label="t('hrm.certificate.toMonth')"
          name='toMonth'
          view='month'/>

        <FormInputText
          v-model='certificate.trainingField'
          class='col-6'
          :label="t('hrm.certificate.trainingField')"
          name='trainingField'/>
        <FormInputDropdown
          v-model='certificate.trainingForm'
          class='col-6'
          :label="t('hrm.certificate.trainingForm')"
          name='trainingForm'
          :options='trainingForms'/>

        <FormInputDropdown
          v-model='certificate.issuingPlace'
          class='col-6'
          :label="t('hrm.certificate.issuingPlace')"
          name='issuingPlace'
          :options='issuingPlaces'/>
        <FormInputDropdown
          v-model='certificate.result'
          class='col-6'
          :filter='false'
          :label="t('hrm.certificate.result')"
          name='result'
          :options="['Xuất sắc', 'Giỏi','Khá', 'Trung bình khá', 'Trung bình', 'Không xác định', 'Khác']"/>

        <FormInputText
          v-model='certificate.certificateType'
          class='col-6'
          :label="t('hrm.certificate.certificateType')"
          name='certificateType'/>
        <FormInputCalendar
          v-model='certificate.fromDate'
          class='col-3'
          :label="t('hrm.certificate.fromDate')"
          name='fromDate'/>
        <FormInputCalendar
          v-model='certificate.toDate'
          class='col-3'
          :label="t('hrm.certificate.toDate')"
          name='toDate'/>

        <FormInputText
          v-model='certificate.version'
          class='col-6'
          :label="t('hrm.certificate.version')"
          name='version'/>
        <FormInputText
          v-model='certificate.releaseDate'
          class='col-6'
          :label="t('hrm.certificate.releaseDate')"
          name='releaseDate'/>

        <div class='col-12 pb-4'>
          <AppUpload
            v-model:old-files='certificate.files'
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

import { getEmployeeCertificateByIdAndSnapshotId } from '@/apps/hrm/api/graphql/employee-training-process';
import { saveEmployeeCertificate } from '@/apps/hrm/api/rest/employee';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { CATEGORY_TYPE, RELATIONSHIP_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import type { EmployeeCertificate } from '@/apps/hrm/model/employee';
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
const certificate = ref<EmployeeCertificate>({} as EmployeeCertificate);

if (props.id) {
  getEmployeeCertificateByIdAndSnapshotId(props.id, props.snapshotId).onResult((res: any) => {
    certificate.value = cloneDeep(res.data.getEmployeeCertificateByIdAndSnapshotId);
  });
}

const setDefaultForm = () => {
  certificate.value = {};
};

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
    await saveEmployeeCertificate(data);

    toastSuccess({
      message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
        itemType: t('hrm.certificate.titleForm'),
        itemName: certificate.value.name,
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

function submitAndContinue() {
  isClose.value = false;
  submit();
}

function submitAndClose() {
  isClose.value = true;
  submit();
}

const trainingForms = ref([]);
const certificates = ref([]);
const issuingPlaces = ref([]);

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.TRAINING_FORM, trainingForms);
  fetchCategoryMappingName(CATEGORY_TYPE.CERTIFICATE, certificates);
  fetchCategoryMappingName(CATEGORY_TYPE.TRAINING_INSTITUTION, issuingPlaces);
});
</script>

<style scoped>

</style>