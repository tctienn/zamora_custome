<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header=" t(`vehicle.common.${id ? 'update' : 'create'}`) +
      ' ' +
      t('hrm.relationship.titleForm')"
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='formgrid grid mb-4'>
        <div class='col-6 flex flex-wrap gap-3 mb-4'>
          <div class='align-items-center flex'>
            <RadioButton
              v-model='relationshipType'
              input-id='ingredient1'
              name='relationshipType'
              :value='RELATIONSHIP_TYPE.WITH_YOURSELF'/>
            <label
              class='ml-2'
              for='ingredient1'>{{ t('hrm.relationship.WITH_YOURSELF') }}</label>
          </div>
          <div class='align-items-center flex'>
            <RadioButton
              v-model='relationshipType'
              input-id='ingredient2'
              name='relationshipType'
              :value='RELATIONSHIP_TYPE.WITH_HUSBAND_WIFE'/>
            <label
              class='ml-2'
              for='ingredient2'>{{ t('hrm.relationship.WITH_HUSBAND_WIFE') }}</label>
          </div>
        </div>

        <div class='col-6'></div>

        <FormInputText
          v-model='relationship.name'
          class='col-6'
          :error='v$?.$errors?.find((error) => error.$property === "name")?.$message?.toString()'
          :label="t('hrm.relationship.name')"
          name='name'
          required/>
        <FormAutoComplete
          v-model='relationship.hometown'
          class='col-6'
          :label="t('hrm.relationship.hometown')"
          name='homeTown'
          :suggestions='homeTownSuggestions'
          @complete='getHomeTownSuggestions'/>
        <FormInputDropdown
          v-model='relationship.relationship'
          class='col-3'
          :label="t('hrm.relationship.relationship')"
          name='relationship'
          :options='relationships'/>
        <FormInputNumber
          v-model='relationship.yearBirth'
          class='col-3'
          :label="t('hrm.relationship.yearBirth')"
          :max='9999'
          name='yearBirth'
          :use-grouping='false'/>
        <FormInputText
          v-model='relationship.job'
          class='col-6'
          :label="t('hrm.relationship.job')"
          name='job'/>
        <FormInputText
          v-model='relationship.phone'
          class='col-3'
          :label="t('hrm.relationship.phone')"
          name='phone'/>
        <FormInputText
          v-model='relationship.taxCode'
          class='col-3'
          :label="t('hrm.relationship.taxCode')"
          name='taxCode'/>
        <FormInputText
          v-model='relationship.workUnit'
          class='col-6'
          :label="t('hrm.relationship.workUnit')"
          name='workUnit'/>
        <FormInputText
          v-model='relationship.cccdNumber'
          class='col-3'
          :label="t('hrm.relationship.cccdNumber')"
          name='cccdNumber'/>
        <FormInputCalendar
          v-model='relationship.dateIssueCCCD'
          class='col-3'
          :label="t('hrm.relationship.dateIssueCCCD')"
          name='dateIssueCCCD'/>
        <FormInputDropdown
          v-model='relationship.jobTitle'
          class='col-6'
          :label="t('hrm.relationship.jobTitle')"
          name='jobTitle'
          :options='jobTitles'/>
        <FormInputDropdown
          v-model='relationship.placeIssueCCCD'
          class='col-6'
          :label="t('hrm.relationship.placeIssueCCCD')"
          name='placeIssueCCCD'
          :options='issuingPlaces'/>
        <FormInputText
          v-model='relationship.address'
          class='col-6'
          :label="t('hrm.relationship.address')"
          name='address'/>
        <FormInputCheckbox
          v-model='relationship.isDependent'
          class='col-6'
          :label="t('hrm.relationship.isDependent')"
          name='isDependent'/>
        <FormInputCalendar
          v-model='relationship.fromDate'
          class='col-3'
          :label="t('hrm.relationship.fromDate')"
          name='fromDate'/>
        <FormInputCalendar
          v-model='relationship.toDate'
          class='col-3'
          :label="t('hrm.relationship.toDate')"
          name='toDate'/>
        <FormInputText
          v-model='relationship.memberSocialWorkOrganization'
          class='col-6'
          :label="t('hrm.relationship.isMemberSocialWorkOrganization')"
          name='isMemberSocialWorkOrganization'/>
        <FormInputCheckbox
          v-model='relationship.isWorkSameOffice'
          class='col-3'
          :label="t('hrm.relationship.isWorkSameOffice')"
          name='isWorkSameOffice'/>
        <FormInputCheckbox
          v-model='relationship.isDead'
          class='col-3'
          :label="t('hrm.relationship.isDead')"
          name='isDead'/>
        <FormInputText
          v-model='relationship.note'
          class='col-12'
          :label="t('hrm.relationship.note')"
          name='note'/>
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

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, isNull } from 'lodash';
import { storeToRefs } from 'pinia';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import { onMounted, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import {
  getFamilyRelationshipByIdAndSnapshotId,
  saveFamilyRelationshipInfo
} from '@/apps/hrm/api/graphql/employee-relationship';
import { searchAddress } from '@/apps/hrm/api/graphql/province';
import FormAutoComplete from '@/apps/hrm/components/form/FormAutoComplete.vue';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputCheckbox from '@/apps/hrm/components/form/FormInputCheckbox.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { CATEGORY_TYPE, RELATIONSHIP_TYPE } from '@/apps/hrm/constants/category';
import { removeFields } from '@/apps/hrm/helpers/utils';
import type { FamilyRelationshipInfo } from '@/apps/hrm/model/employee';
import type { Province } from '@/apps/hrm/model/province';
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
  snapshotId: {
    type: String,
    default: null
  },
});

const emits = defineEmits(['hide-dialog']);

const isCreate = isNull(props.id);

const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const homeTownSuggestions = ref<string[]>([]);
const relationship = ref<FamilyRelationshipInfo>({} as FamilyRelationshipInfo);
const submitForm = ref(false);
const relationshipType = ref(props.type);

const validateRules = {
  name: {
    required: helpers.withMessage(t('common.validate.required', { item: t('hrm.profile.general.fullName') }), required),
    $autoDirty: true
  },
};
const v$ = useVuelidate(validateRules, relationship as any);

if (props.id) {
  getFamilyRelationshipByIdAndSnapshotId(props.id, props.snapshotId).onResult((res: any) => {
    relationship.value = cloneDeep(res.data.getFamilyRelationshipByIdAndSnapshotId);
  });
}

const { moment } = useMoment();
const {
  mutate: saveFamilyRelationshipInfoMutate,
  onDone: saveFamilyRelationshipInfoDone,
} =
  saveFamilyRelationshipInfo();

const submit = () => {
  submitForm.value = true;
  v$.value
    .$validate()
    .then((isValid) => {
      if (isValid && props.snapshotId) {
        saveFamilyRelationshipInfoMutate({
          payload: removeFields({
            ...relationship.value,
            snapshotId: props.snapshotId,
            id: props.id || null,
            relationshipType: relationshipType.value,
            dateIssueCCCD: relationship.value.dateIssueCCCD
              ? moment(relationship.value.dateIssueCCCD).format(DateTimeFormat.ISO_LOCAL_DATE)
              : null,
            fromDate: relationship.value.fromDate
              ? moment(relationship.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE)
              : null,
            toDate: relationship.value.toDate
              ? moment(relationship.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE)
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
      }
    }).then(() => submitForm.value = false);
};

const isClose = ref(true);

function submitAndContinue() {
  isClose.value = false;
  submit();
}

function submitAndClose() {
  isClose.value = true;
  submit();
}

saveFamilyRelationshipInfoDone(() => {
  toastSuccess({
    message: t(`common.result.message.${isCreate ? 'created' : 'updated'}`, {
      itemType: t('hrm.relationship.titleForm'),
      itemName: relationship.value.name,
    }),
  });
  !isClose.value
    ? setDefaultForm() : emits('hide-dialog');
  submitForm.value = false;
});

const setDefaultForm = () => {
  v$.value.$reset();
  relationship.value = {};
};

function getHomeTownSuggestions(event: AutoCompleteCompleteEvent) {
  getAddressSuggestions(event, homeTownSuggestions);
}

function getAddressSuggestions(event: AutoCompleteCompleteEvent, suggestions: Ref<string[]>) {
  searchAddress(event.query).onResult((res) => {
    suggestions.value = ((res.data.searchAddress || []) as Province[])
      .map((province) => `${province.wardName} - ${province.cityName}`);
  });
}

const relationships = ref([]);
const jobTitles = ref([]);
const issuingPlaces = ref([]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const fetchCategory = (type: string, targetRef: any) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    const categories = res.data.getAllCategory;
    targetRef.value = Array.isArray(categories) ? categories.map((item) => item.name) : [];
  });
};

onMounted(() => {
  fetchCategory(CATEGORY_TYPE.RELATIONSHIP, relationships);
  fetchCategory(CATEGORY_TYPE.JOB_TITLE, jobTitles);
  fetchCategory(CATEGORY_TYPE.ISSUING_PLACE, issuingPlaces);
});
</script>

<style scoped>

</style>