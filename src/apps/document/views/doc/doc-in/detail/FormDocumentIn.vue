<template>
  <div
    class='card flex flex-column gap-4 overflow-auto pb-8'
    style='height: calc(100vh - 10rem)'>
    <h5 class='m-0 p-0'>{{ t("document.doc.docInDetail.infoDoc") }}</h5>
    <form
      ref='form'
      @submit.prevent='saveDoc'>
      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label
            v-required
            class='align-content-center'>{{
              t("document.doc.advancedSearch.book")
            }}</label>
        </div>
        <div class='col-3'>
          <input
            v-model='doc.id'
            hidden
            name='id'/>
          <input
            v-if='id'
            v-model='doc.bookId'
            hidden
            name='docInBookModel.bookId'/>
          <NamedDropdown
            v-model='doc.bookId'
            class='w-full'
            :disabled='id'
            filter
            name='docInBookModel.bookId'
            option-label='bookName'
            option-value='id'
            :options='books'
            @change='changeBook($event)'/>
          <ValidateErrorMessage :errors='v$.bookId.$errors'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label
            v-required
            class='align-content-center'>{{
              t("document.doc.advancedSearch.bookNumber")
            }}</label>
        </div>
        <div class='col-3'>
          <NamedInputNumber
            v-model='doc.bookNumber'
            class='w-full'
            name='docInBookModel.bookNumber'/>
          <ValidateErrorMessage :errors='v$.bookNumber.$errors'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label class='align-content-center'>{{
            t("document.doc.advancedSearch.subBookNumber")
          }}</label>
        </div>
        <div class='col'>
          <NamedInputNumber
            v-model='doc.subBookNumber'
            class='w-full'
            name='docInBookModel.subBookNumber'/>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label
            v-required
            class='align-content-center'>{{
              t("document.doc.advancedSearch.orgOutName")
            }}</label>
        </div>
        <div class='col-3'>
          <NamedDropdown
            v-model='doc.publisherId'
            class='w-full'
            filter
            name='publisherId'
            option-label='orgOutName'
            option-value='id'
            :options='orgOuts'
            @change='changePublisher($event)'/>

          <input
            v-model='doc.publisherName'
            hidden
            name='publisherName'/>

          <ValidateErrorMessage :errors='v$.publisherId.$errors'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label class='align-content-center'>{{
            t("document.doc.advancedSearch.docType")
          }}</label>
        </div>
        <div class='col'>
          <NamedDropdown
            v-model='doc.docTypeId'
            class='w-full'
            filter
            name='docTypeId'
            option-label='name'
            option-value='id'
            :options='docTypes'
            @change='changeDocType($event)'/>

          <input
            v-model='doc.docTypeName'
            hidden
            name='docTypeName'/>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label
            v-required
            class='align-content-center'>{{
              t("document.doc.advancedSearch.docCode")
            }}</label>
        </div>
        <div class='col-3'>
          <InputText
            v-model='doc.docCode'
            class='w-full'
            name='docCode'/>
          <ValidateErrorMessage :errors='v$.docCode.$errors'/>
        </div>
        <div class='col-1 field-custom flex pl-3'>
          <label
            v-required
            class='align-content-center'>{{
              t("document.doc.docInDetail.dayDoc")
            }}</label>
        </div>
        <div class='col-3'>
          <NamedInputCalendar
            id='processingDeadline'
            v-model='doc.docDate'
            class='w-full'
            name='docDate'
            :select-other-months='true'
            show-icon/>
          <ValidateErrorMessage :errors='v$.docDate.$errors'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label
            v-required
            class='align-content-center'>{{
              t("document.doc.docIn.incomingDate")
            }}</label>
        </div>
        <div class='col'>
          <NamedInputCalendar
            id='processingDeadline'
            v-model='doc.incomingDate'
            class='w-full'
            name='incomingDate'
            :select-other-months='true'
            show-icon/>

          <ValidateErrorMessage :errors='v$.incomingDate.$errors'/>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label
            v-required
            class='align-content-center'>{{
              t("document.doc.advancedSearch.quote")
            }}</label>
        </div>
        <div class='col'>
          <Textarea
            id='categoryDescription'
            v-model='doc.quote'
            v-trim
            class='w-full'
            name='quote'
            rows='2'/>
          <ValidateErrorMessage :errors='v$.quote.$errors'/>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label class='align-content-center'>{{
            t("document.doc.advancedSearch.securityCode")
          }}</label>
        </div>
        <div class='col-3'>
          <NamedDropdown
            v-model='doc.securityCode'
            class='w-full'
            filter
            name='securityCode'
            option-label='label'
            option-value='value'
            :options='SECURITIES'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label class='align-content-center'>{{
            t("document.doc.deadline")
          }}</label>
        </div>
        <div class='col-3'>
          <NamedInputCalendar
            v-model='doc.deadlineDate'
            class='w-full'
            name='deadlineDate'
            :select-other-months='true'
            show-icon/>
          <ValidateErrorMessage :errors='v$.deadlineDate.$errors'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label class='align-content-center'>{{
            t("document.doc.deadlineNumber")
          }}</label>
        </div>
        <div class='col'>
          <NamedInputNumber
            v-model='doc.deadlineNumber'
            class='w-full'
            name='deadlineNumber'/>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label class='align-content-center'>{{
            t("document.doc.advancedSearch.priorityCode")
          }}</label>
        </div>
        <div class='col-3'>
          <NamedDropdown
            v-model='doc.priorityCode'
            class='w-full'
            name='priorityCode'
            option-label='label'
            option-value='value'
            :options='PRIORITIES'/>
        </div>

        <div class='col-2 flex gap-2 pl-3'>
          <label class='align-content-center'>{{
            t("document.doc.docInDetail.isEnvelope")
          }}</label>
          <div class='align-content-center'>
            <Checkbox
              v-model='doc.isEnvelope'
              binary
              name='isEnvelope'
              value='true'/>
          </div>
        </div>

        <div class='col-3 flex gap-2'>
          <label
            class='align-content-center'
            for='ingredient1'>
            {{ t("document.doc.docInDetail.isRequireAnswer") }}
          </label>
          <div class='align-content-center'>
            <Checkbox
              v-model='doc.isRequireAnswer'
              binary
              name='isRequireAnswer'
              value='true'/>
          </div>
        </div>

        <div class='col flex gap-2'>
          <label
            class='align-content-center'
            for='ingredient1'>
            {{ t("document.doc.docIn.isOnlyLeader") }}
          </label>
          <div class='align-content-center'>
            <Checkbox
              v-model='doc.isOnlyLeader'
              binary
              name='isOnlyLeader'
              value='true'/>
          </div>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label class='align-content-center'>{{
            t("document.doc.docInDetail.flow")
          }}</label>
        </div>
        <div class='col flex'>
          <NamedDropdown
            v-model='doc.flowId'
            class='w-full'
            :disable-flow='doc.isProcessing'
            filter
            name='docInBookModel.flowId'
            option-label='name'
            option-value='id'
            :options='flows'
            @update:model-value='updateFlowName'/>
          <ButtonIcon
            v-tooltip.left='t("document.doc.docIn.viewFlow")'
            class='ml-2'
            :disabled='!doc.flowId'
            icon='family_history'
            size='1.5'
            @click='visibleView = true'></ButtonIcon>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label class='align-content-center'>{{
            t("document.doc.docIn.note")
          }}</label>
        </div>
        <div class='col'>
          <Textarea
            v-model='doc.note'
            v-trim
            class='w-full'
            name='note'
            rows='2'/>
        </div>
      </div>

      <div class='formgrid grid pb-2'>
        <div class='col-1'>
          <label class='font-bold'>{{
            t("document.doc.docInDetail.attachments")
          }}</label>
        </div>
        <div class='col-11'>
          <UploadFilesGridWithRadio
            v-model:files-deleted='listFileDelete'
            v-model:list-file='attachments'
            :doc-type='DocTypeEnum.VB_DEN'
            :file-attachments-name="'attachmentModel'"/>
          <ValidateErrorMessage :errors='v$.attachments.$errors'/>
        </div>
        <input
          hidden
          name='listFileToDelete'
          :value='listFileDelete'/>
      </div>

      <h5 class='m-0 p-0'>{{ t("document.doc.docInDetail.otherInfo") }}</h5>
      <div class='formgrid grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label class='align-content-center'>{{
            t("document.doc.advancedSearch.signer")
          }}</label>
        </div>
        <div class='col-3'>
          <NamedDropdown
            v-model='doc.signerName'
            class='w-full'
            filter
            is-editable
            name='signerName'
            :options='signers'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label class='align-content-center'>{{
            t("document.doc.docInDetail.numberOfCopy")
          }}</label>
        </div>
        <div class='col-3'>
          <NamedInputNumber
            v-model='doc.numberOfCopy'
            class='w-full'
            name='numberOfCopy'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label class='align-content-center'>{{
            t("document.doc.docInDetail.numberOfPage")
          }}</label>
        </div>
        <div class='col'>
          <NamedInputNumber
            v-model='doc.numberOfPage'
            class='w-full'
            name='numberOfPage'/>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-1'>
        <div class='col-1 flex'>
          <label class='align-content-center'>{{
            t("document.doc.docInDetail.publisherType")
          }}</label>
        </div>
        <div class='col-3'>
          <NamedDropdown
            v-model='doc.publisherType'
            class='w-full'
            filter
            name='publisherType'
            option-label='label'
            option-value='value'
            :options='METHOD_RECIEVES'/>
        </div>

        <div class='col-2 flex gap-2 pl-3'>
          <label class='align-content-center'>{{
            t("document.doc.docInDetail.isReply")
          }}</label>
          <div class='align-content-center'>
            <Checkbox
              v-model='doc.isReply'
              binary
              name='isReply'
              value='true'/>
          </div>
        </div>
        <div class='col-2 flex gap-2'>
          <label class='align-content-center'>{{
            t("document.doc.docInDetail.isLawDocument")
          }}</label>
          <div class='align-content-center'>
            <Checkbox
              v-model='doc.isLawDocument'
              binary
              name='isLawDocument'
              :value='true'/>
          </div>
        </div>

        <div class='col-1 field-custom flex'>
          <label class='align-content-center'>{{
            t("document.doc.advancedSearch.area")
          }}</label>
        </div>
        <div class='col'>
          <NamedDropdown
            v-model='doc.areaId'
            class='w-full'
            filter
            name='areaId'
            option-label='name'
            option-value='id'
            :options='fields'
            @change='changeArea'/>

          <input
            v-model='doc.areaName'
            hidden
            name='areaName'/>

          <InputText
            v-model='userDeptRole.userId'
            class='p-component p-inputtext w-full'
            hidden
            name='userDeptRoleModel.userId'
            placeholder='userId'/>

          <InputText
            v-model='userDeptRole.userName'
            class='p-component p-inputtext w-full'
            hidden
            name='userDeptRoleModel.userName'
            placeholder='userName'/>

          <InputText
            v-model='userDeptRole.type'
            class='p-component p-inputtext w-full'
            hidden
            name='userDeptRoleModel.type'
            placeholder='userName'/>

          <InputText
            v-model='userDeptRole.deptId'
            class='p-component p-inputtext w-full'
            hidden
            name='userDeptRoleModel.deptId'
            placeholder='deptId'/>

          <InputText
            v-model='userDeptRole.deptName'
            class='p-component p-inputtext w-full'
            hidden
            name='userDeptRoleModel.deptName'
            placeholder='deptName'/>

          <InputText
            v-model='userDeptRole.roleId'
            class='p-component p-inputtext w-full'
            hidden
            name='userDeptRoleModel.roleId'
            placeholder='roleId'/>

          <InputText
            v-model='userDeptRole.roleName'
            class='p-component p-inputtext w-full'
            hidden
            name='userDeptRoleModel.roleName'
            placeholder='roleName'/>
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-4'>
        <div class='col-1 flex'>
          <label class='align-content-center'>{{
            t("document.doc.docIn.deliveryNumber")
          }}</label>
        </div>
        <div class='col-3'>
          <InputText
            v-model='doc.deliveryNumber'
            v-code
            class='mt-1 p-component p-inputtext w-full'
            name='deliveryNumber'/>
        </div>

        <div class='col'></div>
      </div>

      <div class='bottom-0 fixed flex gap-2 justify-content-center pb-5 w-full'>
        <div>
          <Button
            icon='pi pi-times'
            :label='t("document.doc.docIn.back")'
            severity='danger'
            @click='router.back()'/>
        </div>

        <div>
          <Button
            :disabled='isLoading'
            icon='pi pi-save'
            :label='t("document.doc.docIn.saveAndBack")'
            @click='saveDocAndBack'/>
        </div>

        <div>
          <!--          <NextButtons-->
          <!--            :current-process-id='currentProcessId'-->
          <!--            :disabled='isLoading || disableNextButtons'-->
          <!--            :doc-id='doc.id'-->
          <!--            :flow-id='doc.flowId'-->
          <!--            :user-dept-role='userDeptRole as UserDeptRoleInput'>-->
          <!--          </NextButtons>-->
          <NextButtonsInForm
            v-if='!isAdminAction'
            :disabled='isLoading || disableNextButtons'
            :doc='doc as unknown as DocIn'
            :flow-id='doc.flowId'>
          </NextButtonsInForm>
        </div>
      </div>
    </form>
  </div>

  <Dialog
    v-model:visible='visibleView'
    :block-scroll='true'
    content-class='overflow-hidden'
    :dismissable-mask='true'
    :header='flowNameMap[doc.flowId]'
    modal>
    <div style='height: 80vh; width: 80vw'>
      <WorkFlowView
        :flow-id='doc.flowId'
        style='height: 80vh; width: 80vw'>
      </WorkFlowView>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, provide, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { findByObjectId } from '@/apps/document/api/graphql/attachment';
import { getBook } from '@/apps/document/api/graphql/book';
import { getSigner } from '@/apps/document/api/graphql/doc-in';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getAllField } from '@/apps/document/api/graphql/field';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import { getAllReceivingMethod } from '@/apps/document/api/graphql/receiving-method';
import { getNumberDay } from '@/apps/document/api/graphql/rest-day';
import { adminFindDocInById, adminSaveDocIn } from '@/apps/document/api/rest/adminAction';
import { findDocById, findLastInProcess, saveDocIn, } from '@/apps/document/api/rest/docIn';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { type BookInterface, BookType } from '@/apps/document/model/book';
import {
  type DocIn,
  type DocInInput,
  METHOD_RECIEVES,
  PRIORITIES,
  SECURITIES,
  type UserDeptRoleInput,
} from '@/apps/document/model/doc/doc-in';
import { DocTypeEnum } from '@/apps/document/model/docInBook';
import type { DocTypeInterface } from '@/apps/document/model/docType';
import type { FieldInterface } from '@/apps/document/model/field';
import { DOC_IN_FLOW_TYPE } from '@/apps/document/model/flow';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import NextButtonsInForm from '@/apps/document/views/doc/doc-in/component/next-buttons-infom/NextButtonsInForm.vue';
import { findByOrgTypeAndOrgIdsContainingAndType } from '@/apps/work-flow/api/graphql/flow-api';
import type { FlowInterface } from '@/apps/work-flow/model/flow';
import WorkFlowView from '@/apps/work-flow/views/config/sidebar/component/WorkFlowView.vue';
import NamedInputNumber from '@/common/components/custom/NamedInputNumber.vue';
import UploadFilesGridWithRadio from '@/common/components/custom/UploadFilesGridWithRadio.vue';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { AttachType } from '@/common/model/attachment';
import router from '@/common/router';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  isAdminAction: {
    type: Boolean,
    default: false
  }
});

const { userDeptRole: userDeptRoleStore } = storeToRefs(useDocumentRolesStore());
const isLoading = ref(false);
const form = ref<HTMLFormElement>();
const attachments = ref([]);
const users = ref<UserMoreInfo[]>();
const signers = ref<string[]>();
const methodReveives = ref();
const doc = ref({
  incomingDate: new Date(),
  securityCode: SECURITIES[0].value,
  priorityCode: PRIORITIES[0].value,
  publisherType: METHOD_RECIEVES[0].value,
  numberOfPage: 1,
  numberOfCopy: 1
} as DocInInput);
computed(() => {
  return {
    ...doc.value,
    bookId: books.value.length > 0 ? books.value[0].id : null,
  };
});
const { t } = useI18n();
const { userDeptRole, currentOrgId, type } = storeToRefs(
  useDocumentRolesStore(),
);

//test
const { load: getNumberDayLoad, onResult: getNumberOnResult } = getNumberDay();
const listFileDelete = ref();
const route = useRoute();
const { id } = route.params;
if (id) {
  const findResponse = props.isAdminAction ? adminFindDocInById(id.toString()) : findDocById(userDeptRoleStore.value, id.toString());
  findResponse.then(
    (res: any) => {
      doc.value = res;
      doc.value = {
        ...doc.value,
        docDate: doc.value.docDate ? new Date(doc.value.docDate) : null,
        incomingDate: doc.value.incomingDate
          ? new Date(doc.value.incomingDate)
          : null,
        deadlineDate: doc.value.deadlineDate
          ? new Date(doc.value.deadlineDate)
          : null,
      };
    },
  );

  const { onResult: getAttachmentResult } = findByObjectId(id.toString());

  getAttachmentResult((res) => {
    attachments.value = res.data.findByObjectId;
  });
}

getNumberOnResult((res) => {
  doc.value.deadlineNumber = res.data.getNumberDay;
});

getAllReceivingMethod().onResult((res) => {
  methodReveives.value = res.data.getAllReceivingMethod;
});

getAllUserMoreInfoGraphql().onResult((res) => {
  users.value = res.data.getAllUserMoreInfo;
});

getSigner().onResult((res) => {
  signers.value = res.data.getSigner;
});

const books = ref<BookInterface[]>([] as BookInterface[]);
const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const fields = ref<FieldInterface[]>([] as FieldInterface[]);
const flows = ref<FlowInterface[]>([]);

const docTypes = ref<DocTypeInterface[]>([] as DocTypeInterface[]);
const { user } = useUserStore();
const {
  onResult: getBookResult,
  load: getBookLoad,
  refetch: getBookRefetch,
} = getBook();
const { onResult: getOrgResult } = getOrgOut();
const { onResult: getFieldResult } = getAllField();
const { onResult: getMethodResult } = getAllReceivingMethod();
const { onResult: getDocTypeResult } = getAllDocType();
const classNameDocOut = DOC_IN_FLOW_TYPE;
const {
  onResult: getFlowResult,
  refetch: getFlowRefetch,
  load: getFlowLoad,
} = findByOrgTypeAndOrgIdsContainingAndType(type.value, currentOrgId.value, classNameDocOut);
getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;

  if (!id) {
    doc.value.docTypeId = (
        docTypes.value.length > 0 ? docTypes.value[0].id : null
    )!;
    doc.value.docTypeName = (
        docTypes.value.length > 0 ? docTypes.value[0].name : null
    )!;
  }
});
getFlowResult((res) => {
  flows.value = res.data.findByOrgTypeAndOrgIdsContainingAndType;
});
getFieldResult((res) => {
  fields.value = res.data.getAllField;
});
getBookResult((res) => {
  books.value = res.data.getBook;
  if (!id) {
    doc.value.bookId = (
        books.value.length > 0
          ? books.value.find((b) => b.isDefault == true)?.id ?? books.value[0].id
          : null
    )!;
  }
});

getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut;
  // if (!id) {
  //   doc.value.publisherId = (
  //     orgOuts.value.length > 0 ? orgOuts.value[0].id : null
  //   )!;
  // }
});

getBookLoad(undefined, {
  structureType: type.value,
  depId: currentOrgId.value,
  bookType: BookType.DOC_IN,
}) || getBookRefetch();

getFlowLoad(undefined, {
  orgType: type.value,
  orgIds: currentOrgId.value,
  type: classNameDocOut
}) || getFlowRefetch();

function changeDocType(event: any) {
  doc.value.docTypeName =
      docTypes.value.find((dt: DocTypeInterface) => dt.id == event.value)?.name
      ?? '';
}

function changeArea() {
  doc.value.areaName = fields.value.find((f) => f.id == doc.value.areaId)?.name ?? '';
}

function changePublisher(event: any) {
  doc.value.publisherName =
      orgOuts.value.find((dt: any) => dt.id == event.value)?.orgOutName ?? '';
}

function saveDoc() {
  saveDocPromise();
}

function saveDocAndBack() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      isLoading.value = true;
      const formData = new FormData(form.value);
      let fileNameMain =
          attachments.value.find(
            (f: DocumentAttachment) => f.attachType === AttachType.FILE_CHINH,
          ) ?? ({} as DocumentAttachment);
      formData.append('fileNameMain', fileNameMain.fullName ?? '');
      formData.append('fileSizeMain', (fileNameMain.size ?? 0).toString());
      const saveApi = props.isAdminAction ? adminSaveDocIn(id as string, formData) : saveDocIn(formData);
      saveApi
        .then(() => {
          toastSuccess({ message: t('document.doc.docIn.saveSuccess') });
          isLoading.value = false;
          router.back();
        })
        .catch((err) => {
          toastError({ message: t(`document.doc.error.${err.code}`) });
          isLoading.value = false;
        });
    }
  });
}

function saveDocPromise(): Promise<DocIn | void> {
  return new Promise((resolve, reject) => {
    v$.value.$validate().then((isValid) => {
      if (isValid) {
        isLoading.value = true;
        const formData = new FormData(form.value);
        let fileNameMain =
            attachments.value.find(
              (f: DocumentAttachment) => f.attachType === AttachType.FILE_CHINH,
            ) ?? ({} as DocumentAttachment);
        formData.append('fileNameMain', fileNameMain.fullName ?? '');
        formData.append('fileSizeMain', (fileNameMain.size ?? 0).toString());

        saveDocIn(formData)
          .then((dataReturn) => {
            toastSuccess({ message: t('document.doc.docIn.saveSuccess') });
            isLoading.value = false;
            resolve(dataReturn);
          })
          .catch((err) => {
            toastError({ message: err.code });
            isLoading.value = false;
            reject(err);
          });
      } else {
        reject(new Error('Validation failed'));
      }
    });
  });
}

function changeBook(event: any) {
  doc.value.bookNumber =
      books.value.find((b) => b.id === (event.value ? event.value : event))
        ?.currentNumber || 0;
}

const validateAttachment = () => {
  let isExistMain = false;
  attachments.value.forEach((at: any) => {
    if (at.attachType == AttachType.FILE_CHINH) {
      isExistMain = true;
      return;
    }
  });
  return isExistMain;
};

const validateDeadlineDate = () => {
  return !(doc.value.deadlineDate && (doc.value.deadlineDate < doc.value.docDate! || doc.value.deadlineDate < doc.value.incomingDate!));
};

const validateRules = {
  deadlineDate: {
    required: helpers.withMessage(
      t('document.doc.docIn.validate.deadlineDateNotNull'),
      validateDeadlineDate,
    ),
  },
  bookId: {
    required: helpers.withMessage(
      t('document.doc.docIn.validate.bookIdNotNull'),
      required,
    ),
  },
  bookNumber: { required: helpers.withMessage(t('document.doc.docIn.validate.bookNumberNotNull'), required), },
  publisherId: {
    required: helpers.withMessage(
      t('document.doc.docIn.validate.publisherIdNotNull'),
      required,
    ),
  },
  incomingDate: { required: helpers.withMessage(t('document.doc.docIn.validate.incomingDateNotNull'), required), },
  quote: {
    required: helpers.withMessage(
      t('document.doc.docIn.validate.quoteNotNull'),
      required,
    ),
  },
  docCode: {
    required: helpers.withMessage(
      t('document.doc.docIn.validate.docCodeNotNull'),
      required,
    ),
  },
  docDate: {
    required: helpers.withMessage(
      t('document.doc.docIn.validate.docDateNotNull'),
      required,
    ),
  },
  attachments: {
    required: helpers.withMessage(
      t('document.doc.docIn.validate.attachmentsNotNull'),
      validateAttachment,
    ),
  },
};

const v$ = useVuelidate(validateRules, doc, { $scope: false });
const visibleView = ref<boolean>(false);
const flowNameMap = ref<Record<string, string>>({});

function updateFlowName(id: string) {
  if (flowNameMap.value[id]) {
    return;
  }
  const flow = flows.value.find((e) => e.id == id);
  if (flow) {
    flowNameMap.value = {
      ...flowNameMap.value,
      [id]: flow.name,
    };
  }
}

watch(
  () => doc.value.bookId,
  (value) => {
    if (!id) {
      changeBook(value);
    }
  },
);

// const currentProcessId = ref<string | undefined>();
// if (doc.value.flowId) {
//   findLastProcess(
//       userDeptRole.value as UserDeptRoleInput,
//       id as string,
//       userDeptRole.value.deptId as string,
//   ).then((value) => {
//     if (value) {
//       currentProcessId.value = value;
//     }
//   });
// }

provide('saveDocPromise', saveDocPromise);
provide('afterAction', () => router.back());
provide<Ref<DocInInput>, string>('doc', doc);
provide('isInForm', true);

const disableNextButtons = computed<boolean>(() => {
  return v$.value.$invalid;
});

watch(() => [doc.value.incomingDate, doc.value.deadlineDate], (value) => {
  if (value[0] && value[1]) {
    const fromDate = moment(value[0]).format('YYYY-MM-DD');
    const toDate = moment(value[1]).format('YYYY-MM-DD');
    if (fromDate > toDate) {
      doc.value.deadlineNumber = undefined;
    } else {
      getNumberDayLoad(undefined, {
        dateA: fromDate,
        dateB: toDate
      });
    }
  } else {
    doc.value.deadlineNumber = undefined;
  }
});
</script>

<script lang="ts">
export default { name: 'FormDocument' };
</script>

<style scoped>
.field-custom {
  display: inline-block;
  width: auto;
  padding-right: 0.5rem
}
</style>
