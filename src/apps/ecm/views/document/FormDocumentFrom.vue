<template>
  <form
    ref='form'
    @submit.prevent='submit'>
    <div class='card'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <label v-required>{{ t('ecm.document.excerptFromTheText') }}</label>
            <InputText
              v-model='document.excerptFromTheText'
              name='excerptFromTheText'/>
            <InputText
              v-model='document.id'
              hidden
              name='id'/>
            <ValidateErrorMessage :errors='v$.excerptFromTheText.$errors'/>
          </div>

          <div class='col field'>
            <label
              v-required
              for='organizationName'>{{ t('ecm.document.branch') }}</label>
            <NamedDropdown
              v-model='document.branch'
              :filter='true'
              name='branch'
              option-label='name'
              option-value='code'
              :options='branchs'/>
            <ValidateErrorMessage :errors='v$.branch.$errors'/>
          </div>
        </div>
      </div>

      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col field'>
            <label
              v-required
              for='organizationCode'>{{ t('ecm.document.content') }}</label>
            <Textarea
              v-model='document.content'
              name='content'
              rows='5'/>
            <ValidateErrorMessage :errors='v$.content.$errors'/>
          </div>

          <div class='col field'>
            <label
              v-required
              for='organizationName'>{{ t('ecm.document.documentForm') }}</label>

            <NamedDropdown
              v-model='document.documentForm'
              :filter='true'
              name='documentForm'
              option-label='name'
              option-value='code'
              :options='documentForms'/>
            <ValidateErrorMessage :errors='v$.documentForm.$errors'/>
            <label
              v-required
              for='organizationName'>{{ t('ecm.document.urgency') }}</label>
            <NamedDropdown
              v-model='document.urgency'
              :filter='true'
              name='urgency'
              option-label='name'
              option-value='code'
              :options='urgencys'/>
            <ValidateErrorMessage :errors='v$.urgency.$errors'/>
          </div>
        </div>
      </div>

      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-3 field'>
            <label
              v-required
              for='organizationCode'>{{ t('ecm.document.documentNo') }}</label>
            <InputText
              v-model='document.documentNo'
              name='documentNo'/>
            <ValidateErrorMessage :errors='v$.documentNo.$errors'/>
          </div>
          <div class='col-3 field'>
            <label
              v-required
              for='organizationName'>{{ t('ecm.document.dateIssued') }}</label>
            <NamedInputCalendar
              id='dateIssued'
              v-model='document.dateIssued'
              name='dateIssued'
              :select-other-months='true'
              show-icon/>
            <ValidateErrorMessage :errors='v$.dateIssued.$errors'/>
          </div>

          <div class='col-6 field'>
            <label
              v-required
              for='organizationName'>{{ t('ecm.document.confidentiality') }}</label>

            <NamedDropdown
              v-model='document.confidentiality'
              :filter='true'
              name='confidentiality'
              option-label='name'
              option-value='code'
              :options='confidentialitys'/>
            <ValidateErrorMessage :errors='v$.confidentiality.$errors'/>
          </div>
        </div>
      </div>

      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-3 field'>
            <label
              v-required
              for='organizationCode'>{{ t('ecm.document.registrationNo') }}</label>
            <InputText
              v-model='document.registrationNo'
              name='registrationNo'/>
            <ValidateErrorMessage :errors='v$.registrationNo.$errors'/>
          </div>

          <div class='col-3 field'>
            <label
              v-required
              for='organizationName'>{{ t('ecm.document.toDate') }}</label>
            <NamedInputCalendar
              id='toDate'
              v-model='document.toDate'
              name='toDate'
              :select-other-months='true'
              show-icon/>
            <ValidateErrorMessage :errors='v$.toDate.$errors'/>
          </div>
          <div class='col-6 field'>
            <label
              for='organizationName'>{{ t('ecm.document.signer') }}</label>
            <NamedDropdown
              v-model='document.signer'
              :filter='true'
              name='signer'
              option-label='username'
              option-value='id'
              :options='signers'/>
          </div>
        </div>
      </div>

      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-3 field'>
            <label
              for='organizationCode'>{{ t('ecm.document.noSaved') }}</label>
            <InputText
              v-model='document.noSaved'
              name='noSaved'/>
          </div>

          <div class='col-3 field'>
            <label
              v-required
              for='organizationName'>{{ t('ecm.document.processingDeadline') }}</label>
            <NamedInputCalendar
              id='processingDeadline'
              v-model='document.processingDeadline'
              name='processingDeadline'
              :select-other-months='true'
              show-icon/>
            <ValidateErrorMessage :errors='v$.processingDeadline.$errors'/>
          </div>

          <div class='col-6 field'>
            <label
              for='organizationName'>{{ t('ecm.document.issuingAgency') }}</label>
            <NamedDropdown
              v-model='document.issuingAgency'
              :filter='true'
              name='issuingAgency'
              option-label='name'
              option-value='code'
              :options='organizations'/>
          </div>
        </div>
      </div>
    </div>

    <div class='attachment-card card'>
      <table>
        <tr>
          <td class='col-3'>
            <label
              v-required
              for='organizationName'>{{ t('ecm.document.fileAttach') }}</label></td>
          <td class='col-9'>
            <AppUpload
              ref='contractUpload'
              mode='basic'
              name='fileAttach'
              :path='document.fileAttach'
              :show-name-file='true'
              @change='chooseFileAttach($event)'/>
            <small
              v-if='submitForm && fileAttachInvalid'
              class='p-error'>{{ t('ecm.document.message.fileAttachEmpTy') }}</small>
          </td>
        </tr>
        <tr>
          <td class='col-3'>
            <label
              for='organizationName'>{{ t('ecm.document.appendixFile') }}</label></td>
          <td class='col-9'>
            <AppUpload
              ref='contractUpload'
              mode='basic'
              name='appendixFile'
              :path='document.appendixFile'
              :show-name-file='true'/>
          </td>
        </tr>

        <tr>
          <td class='col-3'>
            <label
              for='organizationName'>{{ t('ecm.document.appendixFormFile') }}</label></td>
          <td class='col-9'>
            <AppUpload
              ref='contractUpload'
              mode='basic'
              name='appendixFormFile'
              :path='document.appendixFormFile'
              :show-name-file='true'/>
          </td>
        </tr>
      </table>
    </div>
    <div class='flex flex-row gap-2 justify-content-center py-1'>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='$router.back()'/>
      <Button
        icon='pi pi-check'
        :label='t("common.save")'
        type='submit'/>
    </div>
  </form>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getAllUserStatusActive } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getCategoryByGroup } from '@/apps/admin/api/graphql/category-graphql-api';
import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { DocumentFromInterface } from '@/apps/admin/model/document';
import { findDocumentById } from '@/apps/ecm/api/graphql/document-from-graphql';
import { createOrUpdateDocument } from '@/apps/ecm/api/rest/document';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import router from '@/common/router';

const route = useRoute();
const { t } = useI18n() || {};
const organizations = ref([]);
const signers = ref([]);
const branchs = ref([]);
const documentForms = ref([]);
const urgencys = ref([]);
const documentTypes = ref([]);
const confidentialitys = ref([]);
const submitForm = ref(false);
let fileAttachInvalid = ref(true);
let form = ref();

const {
  id,
  searchParams
} = route.query;
if (id) {
  const { onResult: findDocumentByIdOnResult } = findDocumentById(id as string);
  fileAttachInvalid.value = false;
  findDocumentByIdOnResult((res) => {
    document.value = { ...res.data.findDocumentById };
  });
}

const { onResult: getUserOnResult } = getAllUserStatusActive();
const { onResult: getOrganizationOnResult } = getAllOrganizationGraphql();
getUserOnResult((res) => {
  signers.value = res.data.getAllUserStatusActive;
});

getOrganizationOnResult((res) => {
  organizations.value = res.data.allOrganizationPublic;
});

let document = ref<DocumentFromInterface>({} as DocumentFromInterface);
const { onResult: getBranchOnResult } = getCategoryByGroup('BRANCH');
getBranchOnResult((res) => {
  branchs.value = res.data.getCategoryByGroup;
});

const { onResult: getTextFormOnResult } = getCategoryByGroup('TEXT_FORM');
getTextFormOnResult((res) => {
  documentForms.value = res.data.getCategoryByGroup;
});

const { onResult: getUrgencyOnResult } = getCategoryByGroup('URGENCY');
getUrgencyOnResult((res) => {
  urgencys.value = res.data.getCategoryByGroup;
});

const { onResult: getDocumentTypeOnResult } = getCategoryByGroup('DOCUMENT_TYPE');
getDocumentTypeOnResult((res) => {
  documentTypes.value = res.data.getCategoryByGroup;
});

const { onResult: getConfidentialityOnResult } = getCategoryByGroup('CONFIDENTIALITY');
getConfidentialityOnResult((res) => {
  confidentialitys.value = res.data.getCategoryByGroup;
});

const validateRules = {
  excerptFromTheText: { required: helpers.withMessage(t('ecm.document.message.excerptFromTheTextEmpTy'), required) },
  branch: { required: helpers.withMessage(t('ecm.document.message.branchEmpTy'), required) },
  content: { required: helpers.withMessage(t('ecm.document.message.contentEmpTy'), required) },
  documentForm: { required: helpers.withMessage(t('ecm.document.message.documentFormEmpTy'), required) },
  urgency: { required: helpers.withMessage(t('ecm.document.message.urgencyEmpTy'), required) },
  documentNo: { required: helpers.withMessage(t('ecm.document.message.documentNoEmpTy'), required) },
  dateIssued: { required: helpers.withMessage(t('ecm.document.message.dateIssuedEmpTy'), required) },
  confidentiality: { required: helpers.withMessage(t('ecm.document.message.confidentialityEmpTy'), required) },
  registrationNo: { required: helpers.withMessage(t('ecm.document.message.registrationNoEmpTy'), required) },
  toDate: { required: helpers.withMessage(t('ecm.document.message.toDateEmpTy'), required) },
  processingDeadline: { required: helpers.withMessage(t('ecm.document.message.processingDeadlineEmpTy'), required) }
};

const v$ = useVuelidate(validateRules, document);

function submit() {
  submitForm.value = true;
  v$.value.$validate().then((isValid) => {
    if (isValid && !fileAttachInvalid.value) {
      const formData = new FormData(form.value);
      createOrUpdateDocument(formData).then((res) => {
        router.replace({
          name: 'EcmDocumentFrom',
          query: searchParams ? { searchParams: searchParams } : {}
        });
        toastSuccess({ message: t('ecm.document.message.createSuccess', {}) });
      });
    }
  });
}

function chooseFileAttach(fileAttach: DropdownChangeEvent) {
  if (fileAttach && !document.value.fileAttach || !fileAttachInvalid.value) {
    fileAttachInvalid.value = false;
    return false;
  } else {
    fileAttachInvalid.value = true;
    return true;
  }
}
</script>

<script lang='ts'>
export default { name: 'FormDocumentFrom' };
</script>

<style>

.card {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.field {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.attachment-card {
  padding: 20px;
}

.attachment-card .field {
  margin-bottom: 10px;
}

.attachment-card label {
  margin-bottom: 0;
}

.attachment-card .p-fileupload .p-button {
  background-color: #007bff;
  color: #fff;
}

.attachment-card .p-fileupload .p-button:hover {
  background-color: #0056b3;
}
</style>