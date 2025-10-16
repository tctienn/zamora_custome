<template>
  <div
    class='card flex flex-column gap-4 overflow-auto pb-8'
    style='height: calc(100vh - 10rem)'>
    <h5 class='m-0'>Thông tin tờ trình</h5>
    <form
      ref='form'
      @submit.prevent='saveDocSubmit'>
      <div class='flex'>
        <div class='col-6 pb-4'>
          <div class='col pl-0 py-0'>
            <label
              v-required
              class='font-semibold'>Đơn vị</label>
            <OrganizationTree
              v-model='doc.fromDeptPresent'
              class='mt-1 p-component w-full'
              :max-width-chip='"50rem"'
              :org-type='userDeptRole.type'
              :selection-mode="'single'"
              @change='changeFromDept($event)'>
            </OrganizationTree>
            <ValidateErrorMessage :errors='v$.fromDeptPresent.$errors'/>
            <input
              hidden
              name='fromDeptPresentId'
              :value='doc.fromDeptPresentId'/>
            <input
              hidden
              name='fromDeptPresentName'
              :value='doc.fromDeptPresentName'/>

            <input
              hidden
              name='id'
              :value='doc.id'/>

            <input
              hidden
              name='userDeptRole.userId'
              :value='userDeptRole.userId'/>

            <input
              hidden
              name='userDeptRole.userName'
              :value='userDeptRole.userName'/>

            <input
              hidden
              name='userDeptRole.deptId'
              :value='userDeptRole.deptId'/>

            <input
              hidden
              name='userDeptRole.deptName'
              :value='userDeptRole.deptName'/>

            <input
              hidden
              name='userDeptRole.roleId'
              :value='userDeptRole.roleId'/>

            <input
              hidden
              name='userDeptRole.roleName'
              :value='userDeptRole.roleName'/>

            <input
              hidden
              name='createdTime'
              :value='doc.createdTime'/>

            <input
              hidden
              name='createdBy'
              :value='doc.createdBy'/>
          </div>
        </div>

        <div class='col flex gap-3 pb-4'>
          <div class='col-6 py-0'>
            <label class='font-semibold'>Nơi lập</label>
            <NamedDropdown
              v-model='doc.docLocation'
              class='mt-1 w-full'
              :is-editable='true'
              name='docLocation'
              option-label='name'
              option-value='name'
              :options='placeOfEstablishment'/>
          </div>

          <div class='col-6 py-0'>
            <label class='font-semibold'>Thời gian nơi lập</label>
            <NamedInputCalendar
              v-model='doc.docDate'
              class='mt-1 w-full'
              format='DD/MM/YYYY HH:mm'
              input-format='YYYY-MM-DDTHH:mm:ss'
              name='docDate'
              :select-other-months='true'
              show-icon
              show-time/>
          </div>
        </div>
      </div>
      <div class='flex pb-4'>
        <div class='col-6 flex py-0'>
          <div class='col-4 pl-0 py-0'>
            <label
              v-required
              class='font-semibold'>Số</label>
            <InputText
              v-model='doc.number'
              class='mt-1 w-full'
              name='number'/>
            <ValidateErrorMessage :errors='v$.number.$errors'/>
          </div>

          <div class='col-4  py-0'>
            <label class='font-semibold'>Ký hiệu</label>
            <InputText
              v-model='doc.symbol'
              class='mt-1 w-full'
              name='symbol'/>
          </div>

          <div class='col-4  py-0'>
            <label class='font-semibold'>Năm</label>
            <NamedInputCalendar
              v-model='doc.year'
              class='mt-1 w-full'
              date-format='yy'
              name='year'
              :select-other-months='true'
              show-icon
              view='year'/>
          </div>
        </div>

        <div class='col flex gap-3 py-0'>
          <div class='col-6 py-0'>
            <label class='font-semibold'>Độ mật</label>
            <NamedDropdown
              v-model='doc.securityCode'
              class='mt-1 w-full'
              name='securityCode'
              option-label='label'
              option-value='value'
              :options='SECURITIES'/>
          </div>

          <div class='col-6 py-0'>
            <label
              v-required
              class='font-semibold'>Ngày nhập</label>
            <NamedInputCalendar
              v-model='doc.dateInput'
              class='mt-1 w-full'
              name='dateInput'
              :select-other-months='true'
              show-icon/>
            <ValidateErrorMessage :errors='v$.dateInput.$errors'/>
          </div>
        </div>
      </div>

      <div class='flex  pb-4'>
        <div class='col-4  py-0'>
          <label class='font-semibold'>Số lần trình</label>
          <NamedDropdown
            v-model='doc.numberSubmissions'
            class='mt-1 w-full'
            name='numberSubmissions'
            option-label='label'
            option-value='value'
            :options='NUMBER_SUBMISSIONS'/>
        </div>

        <div class='col-4  py-0'>
          <label class='font-semibold'>Loại phiếu trình</label>
          <NamedDropdown
            v-model='doc.docType'
            class='mt-1 w-full'
            :disabled='doc.id'
            name='docType'
            option-label='label'
            option-value='value'
            :options='TYPE_PRESENTATION'/>

          <input
            v-model='doc.docType'
            :disabled='!doc.id'
            hidden>
        </div>

        <div class='col-4 py-0'>

          <label
            v-required
            class='font-semibold'>Kính gửi</label>
          <NamedDropdown
            v-model='doc.submitToIds'
            class='mt-1 w-full'
            filter
            is-show-clear
            name='submitToIds'
            option-label='label'
            option-value='value'
            :options='receivers'
            @change='changeSubmitToIds'/>
          <ValidateErrorMessage :errors='v$.submitToIds.$errors'/>

          <input
            v-model='doc.submitToNames'
            hidden
            name='submitToNames'>

        </div>
      </div>

      <div class='flex  pb-4'>
        <div class='col  py-0'>
          <label
            v-required
            class='font-semibold'>Vấn đề trình</label>
          <InputText
            v-model='doc.about'
            class='mt-1 w-full'
            name='about'/>
          <ValidateErrorMessage :errors='v$.about.$errors'/>
        </div>
      </div>

      <div class='flex  pb-4'>
        <div class='col  py-0'>
          <label class='font-semibold'>Tóm tắt nội dung công việc</label>
          <Textarea
            v-model='doc.workSummary'
            auto-resize
            class='mt-1 w-full'
            name='workSummary'
            rows='5'/>
        </div>
      </div>

      <div class='flex  pb-4'>
        <div class='col  py-0'>
          <label
            v-required
            class='font-semibold'>Đơn vị trình</label>
          <OrganizationTree
            v-model='doc.toDeptPresent'
            class='mt-1 p-component w-full'
            :max-width-chip='"50rem"'
            :org-type='userDeptRole.type'
            :selection-mode="'single'"
            @change='changeToDept($event)'>
          </OrganizationTree>
          <ValidateErrorMessage :errors='v$.toDeptPresentId.$errors'/>
          <input
            hidden
            name='toDeptPresentId'
            :value='doc.toDeptPresentId'/>
          <input
            hidden
            name='toDeptPresentName'
            :value='doc.toDeptPresentName'/>
        </div>
      </div>

      <div class='flex  pb-4'>
        <div class='col  py-0'>
          <label class='font-semibold'>Quy trình xử lý</label>
          <div class='col flex flex-column gap-1 pl-0'>
            <div class='flex gap-4'>
              <label class='align-items-center cursor-pointer flex gap-2'>
                <RadioButton
                  v-model='doc.isTemporaryFlow'
                  :disabled='doc.isProcessing'
                  :value='false'/>
                {{ t('document.doc.docOut.availableFlow') }}</label>
              <label class='align-items-center cursor-pointer flex gap-2'>
                <RadioButton
                  v-model='doc.isTemporaryFlow'
                  :disabled='doc.isProcessing'
                  :value='true'/>
                {{ t('document.doc.docOut.selfDefineFlow') }}</label>
              <input
                v-model='doc.isTemporaryFlow'
                hidden
                name='isTemporaryFlow'>
            </div>
            <div class='flex mt-2 w-full'>
              <SelectFlowExisted
                v-if='!doc.isTemporaryFlow'
                v-model='doc.flowId'
                :disable-flow='doc.isProcessing'
                :options='flows'/>
            </div>
            <DocSubmitFlowDefine
              v-if='doc.isTemporaryFlow'
              v-model:edges='edges'
              v-model:nodes='nodes'
              :disable-flow='doc.isProcessing'
              :flow-id='doc.flowId'
              :is-temporary-flow='originIsTempFlow||false'/>
            <input
              v-model='doc.flowId'
              hidden
              name='flowId'>
          </div>
        </div>
      </div>

      <div class='flex'>
        <div class='col field'>
          <!--          <label class='font-semibold'>-->
          <!--            -->
          <!--          </label>-->
          <h5>Danh sách hồ sơ, tài liệu đính kèm</h5>
          <div>
            <GridDocs
              v-model:doc-outs='doc.docOuts'
              v-model:doc-type='doc.docType'
              v-model:file-presentation='doc.filePresentation'
              :doc-id='doc.id'/>
            <div class='flex'>
              <div class='col-2'>
                <ValidateErrorMessage :errors='v$.filePresentation.$errors'/>
              </div>
              <div class='col'>
                <ValidateErrorMessage :errors='v$.docOutIds.$errors'/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class='flex'>
        <div class='col field'>
          <UploadFilesForDocOut
            v-model:file-type-upload-name='fileTypeUploadName'
            v-model:file-upload-from-ecm='filesUploadFromEcm'
            v-model:files-deleted='listFileRelatedDelete'
            v-model:list-file='doc.relatedDocuments'
            class='upload-for-doc-out'
            :file-attachments-name="'relatedDocuments'"
            header='Tài liệu liên quan'/>

          <input
            hidden
            name='listFileRelateToDelete'
            :value='listFileRelatedDelete'/>
          <input
            v-model='fileTypeUploadName'
            hidden
            name='listFileTypeUpload'>
        </div>
      </div>
      <div v-if='doc.docType == TypeOfPresentation.TRINH_XIN_Y_KIEN'>
        <div class='flex'>
          <div class='col-6'>
            <div class='flex flex-column'>
              <div class='pb-4'>
                <label class='font-semibold'>Ý kiến 1</label>
                <Textarea
                  v-model='doc.opinion1'
                  class='mt-1 w-full'
                  name='opinion1'
                  rows='2'/>
              </div>

              <div class='pb-4'>
                <label class='font-semibold'>Ý kiến 2</label>
                <Textarea
                  v-model='doc.opinion2'
                  class='mt-1 w-full'
                  name='opinion2'
                  rows='2'/>
              </div>

              <div class='pb-4'>
                <label class='font-semibold'>Ý kiến 3</label>
                <Textarea
                  v-model='doc.opinion3'
                  class='mt-1 w-full'
                  name='opinion3'
                  rows='2'/>
              </div>

              <div class='pb-4'>
                <label class='font-semibold'>Ý kiến 4</label>
                <Textarea
                  v-model='doc.opinion4'
                  class='mt-1 w-full'
                  name='opinion4'
                  rows='2'/>
              </div>
              <div class='pb-4'>
                <label class='font-semibold'>Ý kiến 5</label>
                <Textarea
                  v-model='doc.opinion5'
                  class='mt-1 w-full'
                  name='opinion5'
                  rows='2'/>
              </div>
            </div>
          </div>
          <div class='col-6'>
            <div class='pb-1'>
              <label class='font-semibold'>
                Ý kiến quyết định của lãnh đạo
              </label>
              <Textarea
                v-model='doc.leaderOpinion'
                class='mt-1 w-full'
                name='leaderOpinion'
                rows='20'/>
              <div class='font-semibold pt-4'>
                <label>Ý kiến 6</label>
                <Textarea
                  v-model='doc.opinion6'
                  class='mt-1 w-full'
                  name='opinion6'
                  rows='2'/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if='doc.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN'
        class='col get-advice'>
        <FormQuestion
          v-model:question-model='questions'
          :is-create='true'
          :is-owner='isOwner'/>
        <ValidateErrorMessage :errors='v$.questions.$errors'/>
      </div>

      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='router.back()'/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='saveDocSubmit'/>
        <SubmitNextButtonsInForm
          v-if='!doc.isTemporaryFlow'
          :disabled='disabledNextButton'
          :doc='doc as unknown as DocSubmit'
          :flow-id='doc.flowId'/>
        <SubmitTempFlowButtons
          v-else
          :disabled='disabledNextButton'
          :edges='edges as EdgeInputInterface[]'
          :nodes='nodes as NodeInputInterface[]'>
        </SubmitTempFlowButtons>
      </div>
    </form>
  </div>
</template>

<script lang='ts' setup>

import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { cloneDeep, pick } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, provide, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getAllUserPublicServiceFullField } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { findByIdIn } from '@/apps/document/api/graphql/doc-out';
import { findDocSubmitById } from '@/apps/document/api/graphql/doc-submit';
import { saveDocumentTempConfig } from '@/apps/document/api/graphql/document-flow';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import { getAllPlaceOfEstablishment } from '@/apps/document/api/graphql/place-of-establishment';
import { findUsersByOrganizationTypeAndRole } from '@/apps/document/api/graphql/userOrganization';
import { saveOrUpdateDocSubmit } from '@/apps/document/api/rest/docSubmit';
import { AttachType, type DocumentAttachment } from '@/apps/document/model/attachment';
import {
  NUMBER_SUBMISSIONS,
  SECURITIES,
  TYPE_PRESENTATION,
  TypeOfPresentation
} from '@/apps/document/model/doc/doc-in';
import {
  type DocSubmit,
  type DocSubmitInput,
  DocSubmitStatus,
  type Option,
  type Question
} from '@/apps/document/model/doc/doc-submit-input';
import { DOC_SUBMIT_FLOW_TYPE } from '@/apps/document/model/flow';
import { OrganizationType } from '@/apps/document/model/organization';
import { RoleType } from '@/apps/document/model/permission';
import { PlaceOfEstablishment } from '@/apps/document/model/placeOfEstablishment';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import SelectFlowExisted from '@/apps/document/views/doc/doc-out/component/flow/SelectFlowExisted.vue';
import DocSubmitFlowDefine from '@/apps/document/views/doc/submit/component/flow/DocSubmitFlowDefine.vue';
import SubmitNextButtonsInForm
  from '@/apps/document/views/doc/submit/component/next-buttons-infom/SubmitNextButtonsInForm.vue';
import SubmitTempFlowButtons
  from '@/apps/document/views/doc/submit/component/temp-flow-buttons/SubmitTempFlowButtons.vue';
import FormQuestion from '@/apps/document/views/doc/submit/FormQuestion.vue';
import GridDocs from '@/apps/document/views/doc/submit/GridDocs.vue';
import { findByOrgTypeAndOrgIdsContainingAndType } from '@/apps/work-flow/api/graphql/flow-api';
import {
  type EdgeInputInterface,
  type FlowInterface,
  type NodeInputInterface,
  NodeType
} from '@/apps/work-flow/model/flow';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';
import UploadFilesForDocOut from '@/common/components/custom/UploadFilesForDocOut.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const fileTypeUploadName = ref<string[]>([]);
const questions = ref([] as Question[]);
const filesUploadFromEcm = ref();
const listFileRelatedDelete = ref();
const route = useRoute();
const router = useRouter();
const isOwner = true;
const { id } = route.params;
const placeOfEstablishment = ref<PlaceOfEstablishment[]>([] as PlaceOfEstablishment[]);
const doc = ref({
  year: new Date(),
  filePresentation: {} as DocumentAttachment,
  docDate: new Date(),
  dateInput: new Date(),
  securityCode: SECURITIES[0].value,
  numberSubmissions: NUMBER_SUBMISSIONS[0].value,
  docType: TYPE_PRESENTATION[0].value,
  isTemporaryFlow: false
} as DocSubmitInput);
const receivers = ref<{ label: string, value: string, fullName: string }[]>();
const form = ref<HTMLFormElement>();
const orgs = ref<{ label: string, value: string }[]>([]);
const { onResult: getPlaceOnResult } = getAllPlaceOfEstablishment();

getPlaceOnResult((res) => {
  placeOfEstablishment.value = res.data.getAllPlaceOfEstablishment;
  if (!id) {
    doc.value.docLocation = placeOfEstablishment.value.find((doc) => doc.isDefault)?.name ?? '';
  }
});

if (userDeptRole.value.type == OrganizationType.ADMINISTRATIVE) {
  getAllOrganizationPublicGraphql().onResult((res) => orgs.value = res.data.allOrganizationPublic.map((o: any) => ({
    label: o.name,
    value: o.id
  })));
} else if (userDeptRole.value.type == OrganizationType.PARTY) {
  getByTypeGraphql(OrganizationType.PARTY).onResult((res) => orgs.value = res.data.getByType.map((o: any) => ({
    label: o.name,
    value: o.id
  })));
} else {
  getByTypeGraphql(OrganizationType.UNION).onResult((res) => orgs.value = res.data.getByType.map((o: any) => ({
    label: o.name,
    value: o.id
  })));
}

if (id) {
  findDocSubmitById(id.toString(), userDeptRole.value).onResult((res) => {
    doc.value = res.data.findDocSubmitById;
    doc.value = {
      ...doc.value,
      fromDeptPresent: [doc.value.fromDeptPresentId],
      toDeptPresent: [doc.value.toDeptPresentId],
      docDate: doc.value.docDate ? new Date(doc.value.docDate) : null,
      dateInput: doc.value.dateInput ? new Date(doc.value.dateInput) : null,
      filePresentation: doc.value.filePresentation ? doc.value.filePresentation : null,
      docOuts: doc.value.docOuts,
      year: typeof doc.value.year == 'number' ? new Date(doc.value.year, 1, 1) : new Date()
    };
    originIsTempFlow.value = doc.value.isTemporaryFlow;
    questions.value = cloneDeep(res.data.findDocSubmitById.questions);
    findByIdIn(userDeptRole.value, doc.value.docOutIds).onResult((response) => {
      doc.value.docOuts = response.data.findByIdIn;
    });
  });
}

const validateDocOuts = () => {
  if (doc.value.docType == TypeOfPresentation.TRINH_VA_BAN_HANH_VAN_BAN) {
    return doc.value.docOuts.length > 0;
  } else {
    return true;
  }
};

const validateQuestion = () => {
  if (doc.value.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN) {
    return questions.value.length > 0;
  } else {
    return true;
  }
};

const validateRules = {
  fromDeptPresent: {
    required: helpers.withMessage(
      t('Đơn vị không được để trống.'),
      required,
    ),
  },
  number: {
    required: helpers.withMessage(
      t('Số không được để trống.'),
      required,
    ),
  },
  dateInput: {
    required: helpers.withMessage(
      t('Ngày nhập không được để trống.'),
      required,
    ),
  },
  submitToIds: {
    required: helpers.withMessage(
      t('Kính gửi không được để trống.'),
      required,
    ),
  },
  about: {
    required: helpers.withMessage(
      t('Vấn đề trình không được để trống.'),
      required,
    ),
  },
  toDeptPresentId: {
    required: helpers.withMessage(
      t('Cơ quan trình không được để trống.'),
      required,
    ),
  },
  docOutIds: {
    required: helpers.withMessage(
      t('Phải có ít nhất 1 văn bản dự thảo.'),
      validateDocOuts,
    ),
  },
  filePresentation: {
    required: helpers.withMessage(
      t('Phải có Tờ trình đính kèm.'),
      required,
    ),
  },
  questions: {
    required: helpers.withMessage(
      t('Phải có ít nhất 1 ý kiến.'),
      validateQuestion,
    ),
  }
};

const v$ = useVuelidate(validateRules, doc, { $scope: false });

function changeFromDept(event: Event) {
  doc.value.fromDeptPresentId = Object.keys(event)[0];
  const org = orgs.value.find(o => o.value == doc.value.fromDeptPresentId);
  doc.value.fromDeptPresentName = org ? org.label : '';
}

function changeToDept(event: Event) {
  doc.value.toDeptPresentId = Object.keys(event)[0];
  const org = orgs.value.find(o => o.value == doc.value.toDeptPresentId);
  doc.value.toDeptPresentName = org ? org.label : '';
}

function changeSubmitToIds(event: any) {
  doc.value.submitToNames = receivers.value?.find((x: any) => x.value == event.value)?.label ?? '';
}

if (userDeptRole.value.type == OrganizationType.ADMINISTRATIVE) {
  getAllUserPublicServiceFullField().onResult((res) => {
    receivers.value = res.data.getAllUserPublicServiceFullField.filter((u: any) => u.roles?.some((role: any) => role?.includes(RoleType.LANH_DAO)));
    receivers.value = receivers.value?.map((re: any) => ({
      label: (re.positionName ? `${re.positionName} ` : ' ') + re.fullName + (re.organizationName ? ` (${re.organizationName}) ` : ' '),
      value: re.id,
      fullName: re.fullName
    }));
  });
} else {
  findUsersByOrganizationTypeAndRole(userDeptRole.value.type, RoleType.LANH_DAO.toString()).onResult((res) => {
    receivers.value = res.data.findUsersByOrganizationTypeAndRole;
    receivers.value = receivers.value?.map((re: any) => ({
      label: (re.position ? `${re.position} ` : ' ') + re.fullName + ` (${re?.organizationInfo?.name}) `,
      value: re.id,
      fullName: re.fullName
    }));
  });
}

function saveDocSubmit() {
  saveDocPromise().then(() => router.back());
}

const classNameSubmitDoc = DOC_SUBMIT_FLOW_TYPE;
const flows = ref<FlowInterface[]>([]);
const {
  onResult: getFlowResult,
  load: getFlowLoad,
  refetch: getFlowRefetch,
} = findByOrgTypeAndOrgIdsContainingAndType(userDeptRole.value.type, userDeptRole.value.deptId, classNameSubmitDoc);

getFlowResult((res) => {
  flows.value = res.data.findByOrgTypeAndOrgIdsContainingAndType;
});

function saveDocPromise() {
  return new Promise((resolve, reject) => {
    v$.value.$validate().then((isValid) => {
      if (isValid) {
        const formData = new FormData(form.value);
        if (doc.value.docOuts) {
          for (let d of doc.value.docOuts) {
            formData.append('docOutIds', d.id ?? '');
          }
        }

        filesUploadFromEcm.value?.forEach((x: any, index: number) => {
          if (x.id) {
            formData.append(`filesFromEcm[${index}].id`, x.attachmentId?.toString());
          }
          formData.append(`filesFromEcm[${index}].objectId`, x.objectId?.toString());
          formData.append(`filesFromEcm[${index}].fullName`, x.fullName?.toString());
          formData.append(`filesFromEcm[${index}].fileName`, x.fileName?.toString());
          formData.append(`filesFromEcm[${index}].fileExtension`, x.fileExtension?.toString());
          formData.append(`filesFromEcm[${index}].filePath`, x.filePath?.toString());
          formData.append(`filesFromEcm[${index}].attachType`, AttachType.FILE_LIENQUAN.toString());
          formData.append(`filesFromEcm[${index}].size`, x.size?.toString());
          formData.append(`filesFromEcm[${index}].typeOfTake`, x.typeOfTake);
        });
        if (doc.value.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN) {
          questions.value?.forEach((question: Question, index: number) => {
            formData.append(`questions[${index}].id`, question.id);
            formData.append(`questions[${index}].label`, question.label);
            formData.append(`questions[${index}].docId`, question.docId);
            formData.append(`questions[${index}].orderNumber`, question.orderNumber.toString());
            formData.append(`questions[${index}].isYesNoQuestion`, question.isYesNoQuestion.toString());
            question.options?.forEach((option: Option, ind: number) => {
              formData.append(`questions[${index}].options[${ind}].id`, option.id);
              formData.append(`questions[${index}].options[${ind}].label`, option.label);
              formData.append(`questions[${index}].options[${ind}].questionId`, option.questionId);
              formData.append(`questions[${index}].options[${ind}].orderNumber`, option.orderNumber.toString());
              formData.append(`questions[${index}].options[${ind}].otherOpinion`, option.otherOpinion.toString());
            });
          });
        }
        saveOrUpdateDocSubmit(formData)
          .then((value) => {
            toastSuccess({ message: t('Lưu thành công.') });
            resolve(value);
          }).catch((err) => {
            toastError({ message: t(`document.doc.error.${err.code}`) });
            reject(err);
          });
      } else {
        reject('form not validate');
      }
    });
  });
}

getFlowLoad();
provide('saveDocPromise', saveDocPromise);
provide('saveTempFlowPromise', saveTempFlowPromise);
provide('afterAction', () => router.back());
provide('hideButtonsName', toRef(['REJECT']));

const disabledNextButton = computed(() => {
  return v$.value.$invalid;
});

//TEMP FLOW
const originIsTempFlow = ref<boolean>();
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const {
  mutate: saveTempFlowMutate,
  loading: saveLoading
} = saveDocumentTempConfig();

function saveTempFlowPromise(): Promise<FlowInterface> {
  return new Promise((resolve: (value: FlowInterface) => void, reject) => {
    const lastNode = nodes.value.find(n => n.type === NodeType.END);
    const beforeLastNodeIds = lastNode ? edges.value.reduce<string[]>((ids, edge) => {
      if (edge.target === lastNode?.id) {
        ids.push(edge.source);
      }
      return ids;
    }, []) : [];
    const nodesData = nodes.value.map((n) => {
      //Change the before last
      if (beforeLastNodeIds.includes(n.id)) {
        const newE = pick(n, ['id', 'data', 'position', 'dimensions', 'handleBounds', 'type']) as NodeInputInterface;
        newE.data =
          {
            ...newE.data,
            status: DocSubmitStatus.HOAN_THANH
          };
        return newE;
      }

      return pick(n, ['id', 'data', 'position', 'dimensions', 'handleBounds', 'type']);
    });
    const edgesData = edges.value.map(e => pick(e, ['id', 'source', 'target', 'data', 'sourceX', 'targetX', 'sourceY', 'targetY', 'targetHandle', 'sourceHandle']));
    saveTempFlowMutate({
      config: {
        nodes: nodesData,
        edges: edgesData,
        type: DOC_SUBMIT_FLOW_TYPE,
        orgType: userDeptRole.value.type,
        orgIds: [userDeptRole.value.deptId]
      }
    }).then((res) => {
      const data = res?.data?.saveDocumentTempConfig as FlowInterface;
      doc.value.flowId = data.id || '';
      return resolve(data);
    }).catch((error) => {
      return reject(error);
    });
  });
}

</script>

<style scoped>

:deep(.p-fluid .upload-for-doc-out .p-button) {
  width: auto;
}

.field {
  margin-bottom: 0
}

</style>

<script lang='ts'>
export default { name: 'SubmitForm' };
</script>