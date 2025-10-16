<template>
  <div class='formgrid grid'>
    <FormInputText
      v-model='model.name'
      class='col-12'
      :error='v$?.$errors?.find((error) => error.$property === "name")?.$message?.toString()'
      :label="t('hrm.recruitment.general.proposalName')"
      name='name'
      required/>
    <FormInputDropdown
      v-model='model.reasonCode'
      class='col-12'
      :error='v$?.$errors?.find((error) => error.$property === "reasonCode")?.$message?.toString()'
      :label="t('hrm.recruitment.general.reason')"
      name='reasonCode'
      option-label='value'
      option-value='id'
      :options='reasons'
      required/>
    <FormInputDropdown
      v-model='model.positionCode'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "positionCode")?.$message?.toString()'
      :label="t('hrm.recruitment.general.position')"
      name='positionCode'
      option-label='value'
      option-value='id'
      :options='jobTitles'
      required/>
    <FormInputDropdown
      v-model='model.titleCode'
      class='col-6'
      :label="t('hrm.recruitment.general.title')"
      name='titleCode'
      option-label='value'
      option-value='id'
      :options='positions'/>
    
    <FormTreeSelect
      v-model='model.departmentId'
      class='col-12'
      :expanded-level='1'
      :label="t('hrm.contract.general.organization')"
      name='departmentId'
      option-value='key'
      :options='organizations'/>
    <FormInputCalendar
      v-model='model.fromTime'
      class='col-6'
      :label="t('hrm.recruitment.general.fromTime')"
      :min-date='new Date().toISOString()'
      name='fromTime'/>
    <FormInputCalendar
      v-model='model.toTime'
      class='col-6'
      :error='v$?.$errors?.find((error) => error.$property === "toTime")?.$message?.toString()'
      :label="t('hrm.recruitment.general.toTime')"
      :min-date='new Date().toISOString()'
      name='toTime'
      required/>
    <FormInputNumber
      v-model='model.currentNumberOfEmployees'
      class='col-3'
      :label="t('hrm.recruitment.general.currentNumberOfEmployees')"
      name='currentNumberOfEmployees'/>
    <FormInputNumber
      v-model='model.boundaryQuantity'
      class='col-3'
      :label="t('hrm.recruitment.general.boundaryQuantity')"
      name='boundaryQuantity'/>
    <FormInputNumber
      v-model='model.numberOfRecruits'
      class='col-3'
      :error='v$?.$errors?.find((error) => error.$property === "numberOfRecruits")?.$message?.toString()'
      :label="t('hrm.recruitment.general.numberOfRecruits')"
      name='numberOfRecruits'
      required/>
    <div class='col-3 field'>
      <label>{{ t(`hrm.recruitment.general.isRecruitUntilIsEnough`) }}</label>
      <div class='align-items-center flex gap-2 mt-2'>
        <InputSwitch v-model='model.isRecruitUntilIsEnough'/>
        <input
          v-model='model.isRecruitUntilIsEnough'
          hidden
          name='isRecruitUntilIsEnough'>
      </div>
    </div>
    <div class='col-12 field'><p class='font-bold'>{{ t('hrm.recruitment.general.candidateRequirements') + ':' }}</p></div>
    <div class='col-6 field'>
      <label>{{
        t(`hrm.recruitment.general.gender`)
      }}</label>
      <div class='flex flex-wrap gap-6 mt-2'>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='model.gender'
            input-id='gender1'
            name='gender'
            :value='GenderType.MALE'/>
          <label
            class='ml-2'
            for='gender1'>{{
              t(`hrm.recruitment.general.MALE`)
            }}</label>
        </div>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='model.gender'
            input-id='gender2'
            name='gender'
            :value='GenderType.FEMALE'/>
          <label
            class='ml-2'
            for='gender2'>{{
              t(`hrm.recruitment.general.FEMALE`)
            }}</label>
        </div>
        <div class='align-items-center flex'>
          <RadioButton
            v-model='model.gender'
            input-id='gender3'
            name='gender'
            :value='GenderType.OTHER'/>
          <label
            class='ml-2'
            for='gender3'>{{
              t(`hrm.recruitment.general.OTHER`)
            }}</label>
        </div>
      </div>
    </div>
    <FormInputDropdown
      v-model='model.majorCode'
      class='col-6'
      is-multi-select
      :label="t('hrm.recruitment.general.major')"
      name='majorCode'
      option-label='value'
      option-value='id'
      :options='specializeds'/>
    <FormInputDropdown
      v-model='model.levelCode'
      class='col-6'
      is-multi-select
      :label="t('hrm.recruitment.general.level')"
      name='levelCode'
      option-label='value'
      option-value='id'
      :options='levels'/>
    <FormInputDropdown
      v-model='model.foreignLanguageCode'
      class='col-6'
      is-multi-select
      :label="t('hrm.recruitment.general.foreignLanguage')"
      name='foreignLanguageCode'
      option-label='value'
      option-value='id'
      :options='languageLevels'/>
    <FormInputDropdown
      v-model='model.experienceCode'
      class='col-6'
      is-multi-select
      :label="t('hrm.recruitment.general.experience')"
      name='experienceCode'
      option-label='value'
      option-value='id'
      :options='experiences'/>
    <FormInputNumber
      v-model='model.ageFrom'
      class='col-3'
      :label="t('hrm.recruitment.general.ageFrom')"
      name='ageFrom'/>
    <FormInputNumber
      v-model='model.ageTo'
      class='col-3'
      :label="t('hrm.recruitment.general.ageTo')"
      name='ageTo'/>
    <FormInputText
      v-model='model.heightFrom'
      class='col-3'
      :label="t('hrm.recruitment.general.heightFrom')"
      name='heightFrom'/>
    <FormInputText
      v-model='model.heightTo'
      class='col-3'
      :label="t('hrm.recruitment.general.heightTo')"
      name='heightTo'/>
    <FormInputText
      v-model='model.weightFrom'
      class='col-3'
      :label="t('hrm.recruitment.general.weightFrom')"
      name='weightFrom'/>
    <FormInputText
      v-model='model.weightTo'
      class='col-3'
      :label="t('hrm.recruitment.general.weightTo')"
      name='weightTo'/>

    <FormInputTextArea
      v-model='model.description'
      class='col-12'
      :label="t('hrm.recruitment.general.jobDescription')"
      name='description'/>

    <div class='align-content-center align-items-center col-12 flex justify-content-between mb-2 vertical-align-middle'>
      <label
        class='font-bold'
        for='attach'>{{ t('hrm.recruitment.general.attachments') }}</label>
      <Button
        class='p-button-plain'
        icon='pi pi-plus'
        severity='secondary'
        size='small'
        @click='showAddFileDialog=true'/>
    </div>
    <AttachmentFileList
      v-model:receiving-docs='model.files'
      class='col-12'
      :on-delete='handleDeleteFileAttachment'/>
    <AddFileModal
      v-if='showAddFileDialog'
      v-model:visible-dialog='showAddFileDialog'
      @submit='handleSubmitFile' />
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { clone } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';
import AddFileModal from '@/apps/book-ticket/views/bookFlight/component/AddFileModal.vue';
import AttachmentFileList from '@/apps/book-ticket/views/bookFlight/component/AttachmentFileList.vue';
import { deleteRecruitmentProposalAttachment } from '@/apps/hrm/api/graphql/recruitment';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import FormInputTextArea from '@/apps/hrm/components/form/FormInputTextArea.vue';
import FormTreeSelect from '@/apps/hrm/components/form/FormTreeSelect.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import {
  convertToOrganizationTreeNodes,
  fetchCategoryMappingNameWithId
} from '@/apps/hrm/helpers/utils';
import { GenderType, type Recruitment } from '@/apps/hrm/model/recruitment';
import useMoment from '@/common/helpers/mixins/use-moment';

const { t } = useI18n();
const { moment } = useMoment();
const modelValue = defineModel({
  type: Object as PropType<Recruitment>,
  default: {} as Recruitment,
});

const model = reactive(correctModel(modelValue.value));
const { mutate: deleteAttachment } = deleteRecruitmentProposalAttachment();

watch(modelValue, (value) => {
  Object.assign(model, correctModel(value));
}, { deep: true });

watch(model, (newVal) => {
  modelValue.value = clone(newVal);
}, { deep: true });

function correctModel(value: Recruitment) {
  const recruitment = clone(value);
  if (!recruitment.files) {
    recruitment.files = [];
  }
  Object.keys(value).forEach((key) => {
    const element = value[key as keyof Recruitment];
    if (['day', 'Day', 'date', 'Date'].some((keyword) => key.includes(keyword)) && element) {
      Object.assign(recruitment, { [key]: moment(element as string).toDate() });
    }
  });
  return recruitment;
}

const toTimeAfterFromTime = helpers.withMessage(
  t('hrm.recruitment.general.validator.mustBeAfter', {
    item: t('hrm.recruitment.general.toTime'),
    after: t('hrm.recruitment.general.fromTime') 
  }),
  (value: Date | null) => {
    if (!value) {
      return true;
    }
    if (!model.fromTime) {
      return true;
    }
    return value >= model.fromTime;
  }
);

const rules = {
  name: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.recruitment.general.proposalName') }), required),
    $autoDirty: true,
  },
  reasonCode: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.recruitment.general.reason') }), required),
    $autoDirty: true
  },
  positionCode: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.recruitment.general.position') }), required),
    $autoDirty: true
  },
  numberOfRecruits: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.recruitment.general.numberOfRecruits') }), required),
    $autoDirty: true
  },
  toTime: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.recruitment.general.toTime') }), required),
    toTimeAfterFromTime, 
    $autoDirty: true
  }
};
const v$: Ref<Validation> = useVuelidate(rules, model);

const levels = ref([]);
const specializeds = ref([]);
const reasons = ref([]);
const languageLevels = ref([]);
const experiences = ref([]);
const jobTitles = ref([]);
const positions = ref([]);
const organizations = ref<TreeNode[]>([]);
const showAddFileDialog = ref<boolean>(false);

onMounted(() => {
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.REASON, reasons, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_POSITION, positions, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_TITLE, jobTitles, {
    labelProp: 'name',
    idProp: 'code'
  });

  fetchCategoryMappingNameWithId(CATEGORY_TYPE.MAJOR, specializeds, {
    labelProp: 'name',
    idProp: 'code'
  });

  fetchCategoryMappingNameWithId(CATEGORY_TYPE.EDUCATION_LEVEL, levels, {
    labelProp: 'name',
    idProp: 'code'
  });

  fetchCategoryMappingNameWithId(CATEGORY_TYPE.FOREIGN_LANGUAGE_LEVEL, languageLevels, {
    labelProp: 'name',
    idProp: 'code'
  });
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.EXPERIENCE, experiences, {
    labelProp: 'name',
    idProp: 'code'
  });
  getAllOrganizationGraphql().onResult((res) => {
    organizations.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  });

});

const handleSubmitFile = (fileData: IAttachmentFile) => {
  if (!model.files) {
    model.files = [];
  }
  model.files.push(fileData);
};

const handleDeleteFileAttachment = async (id: string) => {
  await deleteAttachment({ id });
  ;
};

</script>

<style scoped>

</style>
