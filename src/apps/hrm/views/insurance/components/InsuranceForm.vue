<template>
  <Dialog
    v-model:visible='visibleForm'
    :header=" t(`vehicle.common.${id ? 'update' : 'create'}`) +
      ' ' +
      t('hrm.insurance.titleForm')"
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='formgrid grid mb-4'>
        <FormInputDropdown
          v-model='insurance.employeeId'
          class='col-6'
          label='Nhân sự'
          name='employeeId'
          option-label='label'
          option-value='id'
          :options='users'
          required/>
        <FormInputText
          v-model='insurance.codeBHXH'
          class='col-3'
          :label="t('hrm.insurance.codeBHXH')"
          name='codeBHXH'/>
        <FormInputText
          v-model='insurance.cardNumBHYT'
          class='col-3'
          :label="t('hrm.insurance.cardNumBHYT')"
          name='cardNumBHYT'/>

        <FormTreeSelect
          v-model='insurance.organizationId'
          class='col-6'
          :expanded-level='1'
          :label="t('hrm.insurance.organizationId')"
          name='organizationId'
          option-value='key'
          :options='organizations'
          required/>
        <FormInputDropdown
          v-model='insurance.socialInsuranceProvinceCode'
          class='col-6'
          :label="t('hrm.insurance.socialInsuranceProvinceCode')"
          name='socialInsuranceProvinceCode'
          :options='provinceCodes'/>

        <FormInputCalendar
          v-model='insurance.socialInsuranceParticipation'
          class='col-3'
          date-format='mm/yy'
          :label="t('hrm.insurance.socialInsuranceParticipation')"
          name='socialInsuranceParticipation'
          view='month'/>
        <FormInputText
          v-model='insurance.medicalExaminationCode'
          class='col-3'
          :label="t('hrm.insurance.medicalExaminationCode')"
          name='medicalExaminationCode'/>
        <FormInputDropdown
          v-model='insurance.hospitalCode'
          class='col-6'
          :label="t('hrm.insurance.hospitalCode')"
          name='hospitalCode'
          :options='hospitals'/>
        <div class='col-12 pb-4'>
          <AppUpload
            v-model:old-files='insurance.files'
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
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { getAllEmployeeHaveInsurance } from '@/apps/hrm/api/graphql/employee';
import { getInsuranceById } from '@/apps/hrm/api/graphql/insurance';
import { saveInsurance } from '@/apps/hrm/api/rest/insurance';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormTreeSelect from '@/apps/hrm/components/form/FormTreeSelect.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import type { Insurance } from '@/apps/hrm/model/insurance';
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
});

const emits = defineEmits(['hide-dialog']);

const isCreate = isNull(props.id);

const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const submitForm = ref(false);
const { moment } = useMoment();
const isClose = ref(true);
const insurance = ref<Insurance>({} as Insurance);
const users = ref([]);
const organizations = ref<TreeNode[]>([]);

if (props.id) {
  getInsuranceById(props.id).onResult((res: any) => {
    insurance.value = cloneDeep(res.data.getInsuranceById);
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
    await saveInsurance(data);

    toastSuccess({
      message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
        itemType: t('hrm.insurance.titleForm'),
        itemName: insurance.value.codeBHXH,
      }),
    });

    if (!isClose.value) {
      setDefaultForm();
    } else {
      emits('hide-dialog');
    }
  } catch (error) {
    console.error('Error saving insurance:', error);
  } finally {
    submitForm.value = false;
  }
};

const setDefaultForm = () => {
  insurance.value = {};
};

function submitAndContinue() {
  isClose.value = false;
  submit();
}

function submitAndClose() {
  isClose.value = true;
  submit();
}

const hospitals = ref([]);
const provinceCodes = ref([]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const fetchCategory = (type: string, targetRef: any) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    let categories = res.data.getAllCategory;

    targetRef.value = Array.isArray(categories) ? categories.map((item) => item.name) : [];
  });
};

onMounted(() => {
  fetchCategory(CATEGORY_TYPE.HOSPITAL, hospitals);
  fetchCategory(CATEGORY_TYPE.SOCIAL_INSURANCE_PROVINCE_CODE, provinceCodes);
  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  });
  getAllEmployeeHaveInsurance().onResult((res) => {
    users.value = res.data.getAllEmployeeHaveInsurance?.map((u: any) => ({
      id: u.id,
      label: `${u.code} - ${u.fullName}`
    }));
  });
});
</script>

<style scoped>

</style>