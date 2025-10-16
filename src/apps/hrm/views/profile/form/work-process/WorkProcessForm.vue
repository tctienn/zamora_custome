<template>
  <Dialog
    v-model:visible='visibleForm'
    :header=" t(`vehicle.common.${id ? 'update' : 'create'}`) +
      ' ' +
      t('hrm.workProcess.titleForm')"
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='formgrid grid mb-4'>
        <FormInputCalendar
          v-model='workProcess.fromMonth'
          class='col-6'
          date-format='mm/yy'
          :label="t('hrm.workProcess.fromMonth')"
          name='fromMonth'
          view='month'/>
        <FormInputCalendar
          v-model='workProcess.toMonth'
          class='col-6'
          date-format='mm/yy'
          :label="t('hrm.workProcess.toMonth')"
          name='toMonth'
          view='month'/>
        <FormInputText
          v-model='workProcess.companyUnit'
          class='col-12'
          :label="t('hrm.workProcess.companyUnit')"
          name='companyUnit'/>
        <FormInputText
          v-model='workProcess.address'
          class='col-12'
          :label="t('hrm.workProcess.address')"
          name='address'/>
        <!--        <FormInputDropdown-->
        <!--          v-model='workProcess.jobPosition'-->
        <!--          class='col-12'-->
        <!--          :label="t('hrm.workProcess.jobPosition')"-->
        <!--          name='jobTitle'-->
        <!--          :options='jobPositions'/>-->

        <FormInputTextArea
          v-model='workProcess.jobPosition'
          class='col-12'
          :label="t('hrm.workProcess.jobPosition')"
          name='jobTitle'
          rows='3'/>

        <FormInputTextArea
          v-model='workProcess.description'
          class='col-12'
          :label="t('hrm.workProcess.description')"
          name='description'
          rows='3'/>
        <FormInputText
          v-model='workProcess.salary'
          class='col-6'
          :label="t('hrm.workProcess.salary')"
          name='salary'/>
        <FormInputDropdown
          v-model='workProcess.reasonForLeaving'
          class='col-6'
          :label="t('hrm.workProcess.reasonForLeaving')"
          name='jobTitle'
          :options='reasons'/>
        <FormInputText
          v-model='workProcess.referencesPerson'
          class='col-6'
          :label="t('hrm.workProcess.references')"
          name='referencesPerson'
          :tabindex='10'/>
        <FormInputText
          v-model='workProcess.phone'
          class='col-6'
          :label="t('hrm.workProcess.phone')"
          name='phone'/>
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
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { getWorkProcessByIdAndEmployeeId, saveWorkProcess } from '@/apps/hrm/api/graphql/employee-work-process';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import { CATEGORY_TYPE, REASON_TYPE, RELATIONSHIP_TYPE } from '@/apps/hrm/constants/category';
import { removeFields } from '@/apps/hrm/helpers/utils';
import type { WorkProcess } from '@/apps/hrm/model/employee';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
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
  employeeId: {
    type: String,
    default: null
  },
  snapshotId: {
    type: String,
    default: null
  }
});

const emits = defineEmits(['hide-dialog']);

const isCreate = isNull(props.id);

const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const submitForm = ref(false);
const { moment } = useMoment();
const isClose = ref(true);
const workProcess = ref<WorkProcess>({} as WorkProcess);

if (props.id) {
  getWorkProcessByIdAndEmployeeId(props.id, props.employeeId).onResult((res: any) => {
    workProcess.value = cloneDeep(res.data.getWorkProcessByIdAndEmployeeId);
    workProcess.value.fromMonth = new Date(res.data.getWorkProcessByIdAndEmployeeId.fromMonth);
    workProcess.value.toMonth = new Date(res.data.getWorkProcessByIdAndEmployeeId.toMonth);
  });
}

const {
  mutate: saveWorkProcessMutate,
  onDone: saveWorkProcessDone,
  onError: saveWorkProcessError
} =
  saveWorkProcess();

const submit = () => {
  submitForm.value = true;
  saveWorkProcessMutate({
    payload: removeFields({
      ...workProcess.value,
      snapshotId: props.snapshotId,
      employeeId: props.employeeId,
      id: props.id || null,
      fromMonth: workProcess.value.fromMonth
        ? moment(workProcess.value.fromMonth).format(DateTimeFormat.ISO_LOCAL_DATE)
        : null,
      toMonth: workProcess.value.toMonth
        ? moment(workProcess.value.toMonth).format(DateTimeFormat.ISO_LOCAL_DATE)
        : null,
    } || {}, [
      'createdBy',
      'createdTime',
      'orderNumber',
      'isDeleted',
      'lastModifiedBy',
      'lastModifiedTime',
    ])
  }
  );
};

const setDefaultForm = () => {
  workProcess.value = {};
};

saveWorkProcessDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('hrm.workProcess.titleForm'),
      itemName: workProcess.value.jobPosition,
    }),
  });
  !isClose.value
    ? setDefaultForm() : emits('hide-dialog');
  submitForm.value = false;
});

saveWorkProcessError(() => {
  submitForm.value = false;
});

function submitAndContinue() {
  isClose.value = false;
  submit();
}

function submitAndClose() {
  isClose.value = true;
  submit();
}

const jobPositions = ref([]);
const reasons = ref([]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const fetchCategory = (type: string, targetRef: any) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    let categories = res.data.getAllCategory;

    if (type === CATEGORY_TYPE.REASON) {
      categories = categories.filter((item: any) => item.reasonType === REASON_TYPE.REASON_LEAVE);
    }

    targetRef.value = Array.isArray(categories) ? categories.map((item) => item.name) : [];
  });
};

onMounted(() => {
  fetchCategory(CATEGORY_TYPE.JOB_POSITION, jobPositions);
  fetchCategory(CATEGORY_TYPE.REASON, reasons);
});
</script>

<style scoped>

</style>