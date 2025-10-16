<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    :dismissable='false'
    position='right'
    :show-close-icon='false'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "70vw"}}'
    @hide='emits("hide-sidebar")'>

    <div
      class='border-bottom-1 border-gray-300 fixed left-0 p-3 surface-0 top-0 w-full'
      style='z-index: 1000'>
      <div
        class='flex justify-content-between'>
        <div class='flex gap-2'>
          <ButtonIcon
            class='border-round-sm flex justify-content-center px-0'
            icon='arrow_back'
            severity='danger'
            size='small'
            style='width: 30px; height: 30px;'
            @click='emits("hide-sidebar")'/>
          <div class='align-content-center font-semibold text-2xl'>Thông tin tiếp nhận văn bản</div>
        </div>
        <div class='flex gap-2'>
          <ButtonIcon
            class='border-round-sm'
            :disabled='isLoading'
            icon='save'
            :label='t("document.doc.docIn.saveAndBack")'
            size='small'
            style='height: 31px;'
            @click='saveDocAndBack'/>

          <ButtonIcon
            class='border-round-sm'
            :disabled='isLoading'
            icon='add_circle'
            :label='t("document.doc.docIn.saveAndContinue")'
            severity='secondary'
            size='small'
            style='height: 31px;'
            @click='saveDocAndContinue'/>

          <NextButtonsInForm
            v-if='!isAdminAction && !doc.flowId'
            :disabled='isLoading || disableNextButtons'
            :doc='doc as unknown as DocIn'
            :flow-id='doc.flowId'>
          </NextButtonsInForm>
        </div>
      </div>
    </div>

    <form
      ref='form'
      class='pt-6 px-0'
      @submit.prevent='saveDoc'>

      <Accordion
        :active-index='[0, 1, 2]'
        class='accordion-custom'
        :multiple='true'>
        <!-- Required Fields Panel -->
        <AccordionTab header='Thông tin bắt buộc *'>
          <div class='flex flex-wrap p-2'>
            <!-- Trích yếu -->
            <div class='col-12 flex p-0'>
              <div class='col field px-0 py-1'>
                <label
                  v-required
                  class='align-content-center'>{{
                    t('document.doc.advancedSearch.quote')
                  }}</label>

                <Textarea
                  id='categoryDescription'
                  v-model='doc.quote'
                  v-trim
                  class='w-full'
                  :invalid='v$.quote.$errors.length > 0'
                  name='quote'
                  rows='3'/>
                <ValidateErrorMessage :errors='v$.quote.$errors'/>
              </div>
            </div>
            <div class='col-6 p-0 pr-1'>
              <!-- Số/Ký hiệu, Ngày văn bản, Ngày nhận -->
              <div class='flex flex-wrap'>
                <div class='col-6 field pl-0 pr-2 py-1'>
                  <label
                    v-required
                    class='align-content-center doc-in-label'>{{
                      t('document.doc.advancedSearch.docCode')
                    }}</label>

                  <InputText
                    v-model='doc.docCode'
                    class='w-full'
                    :invalid='v$.docCode.$errors.length > 0'
                    name='docCode'/>
                  <ValidateErrorMessage :errors='v$.docCode.$errors'/>
                </div>

                <div class='col-6 field pl-0 pr-2 py-1'>
                  <label class='align-content-center'>{{
                    t('document.doc.advancedSearch.docType')
                  }}</label>

                  <NamedDropdown
                    v-model='doc.docTypeId'
                    class='w-full'
                    filter
                    is-show-clear
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

                <div class='col-6 field pl-0 pr-2 py-1'>
                  <label
                    v-required
                    class='align-content-center'>{{
                      t('document.doc.docInDetail.dayDoc')
                    }}</label>

                  <NamedInputCalendar
                    id='processingDeadline'
                    v-model='doc.docDate'
                    class='w-full'
                    icon-display='input'
                    :invalid='v$.docDate.$errors.length'
                    name='docDate'
                    :select-other-months='true'
                    show-icon/>
                  <ValidateErrorMessage :errors='v$.docDate.$errors'/>
                </div>

                <div class='col-6 field pl-0 pr-2 py-1'>
                  <label
                    v-required
                    class='align-content-center'>{{
                      t('document.doc.docIn.incomingDate')
                    }}</label>

                  <NamedInputCalendar
                    id='processingDeadline'
                    v-model='doc.incomingDate'
                    class='w-full'
                    icon-display='input'
                    :invalid='v$.incomingDate.$errors.length'
                    name='incomingDate'
                    :select-other-months='true'
                    show-icon/>

                  <ValidateErrorMessage :errors='v$.incomingDate.$errors'/>
                </div>
                <div class='col-12 field pl-0 pr-2 py-1'>
                  <label
                    v-required
                    class='align-content-center'>{{
                      t('document.doc.advancedSearch.orgOutName')
                    }}</label>
                  <NamedDropdown
                    v-model='doc.publisherId'
                    class='w-full'
                    filter
                    :invalid='v$.publisherId.$errors.length'
                    is-show-clear
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
                <div class='col-12 field mt-3 pl-0 pr-2 py-1'>
                  <label class='align-content-center'>{{
                    t('document.doc.advancedSearch.signer')
                  }}</label>

                  <NamedDropdown
                    v-model='doc.signerName'
                    class='w-full'
                    filter
                    is-editable
                    is-show-clear
                    name='signerName'
                    :options='signers'/>
                </div>
              </div>
            </div>
            <div class='col-6 p-0 pl-1'>
              <div class='flex flex-wrap'>
                <div
                  class='border-1 border-green-400 border-round-sm col-12 docIn-num-block flex flex-wrap px-2 py-1'>
                  <div class='col-12 field px-0 py-1'>
                    <label
                      v-required
                      class='align-content-center doc-in-label'
                      for='bookId'>{{
                        t('document.doc.advancedSearch.book')
                      }}</label>

                    <input
                      v-model='doc.id'
                      hidden
                      name='id'/>
                    <input
                      v-if='props.docId'
                      v-model='doc.bookId'
                      hidden
                      name='docInBookModel.bookId'/>
                    <NamedDropdown
                      v-model='doc.bookId'
                      class='w-full'
                      :disabled='props.docId'
                      filter
                      :filter-function='customFilter'
                      input-id='bookId'
                      name='docInBookModel.bookId'
                      option-label='bookName'
                      option-value='id'
                      :options='books'
                      @change='changeBook($event)'/>
                    <ValidateErrorMessage :errors='v$.bookId.$errors'/>
                  </div>

                  <div class='col-6 field pl-0 pr-1 py-1'>
                    <label
                      v-required
                      class='align-content-center doc-in-label'>{{
                        t('document.doc.advancedSearch.bookNumber')
                      }}</label>

                    <NamedInputNumber
                      v-model='doc.bookNumber'
                      class='book-number text-left w-full'
                      :invalid='v$.bookNumber.$errors.length'
                      name='docInBookModel.bookNumber'/>
                    <ValidateErrorMessage :errors='v$.bookNumber.$errors'/>
                  </div>
                  <!-- Số phụ, Loại văn bản -->
                  <div class='col-6 field pl-1 pr-0 py-1'>
                    <label class='align-content-center'>{{
                      t('document.doc.advancedSearch.subBookNumber')
                    }}</label>

                    <NamedInputNumber
                      v-model='doc.subBookNumber'
                      class='sub-number w-full'
                      name='docInBookModel.subBookNumber'/>
                  </div>
                  <!-- Chọn quy trình -->
                  <div class='col-12 field px-0 py-1'>
                    <label class='align-content-center doc-in-label'>{{
                      t('document.doc.docInDetail.chooseFlow')
                    }}</label>
                    <div class='flex'>
                      <NamedDropdown
                        v-model='doc.flowId'
                        class='mr-2 w-full'
                        :disable-flow='doc.isProcessing'
                        filter
                        is-show-clear
                        name='docInBookModel.flowId'
                        option-label='name'
                        option-value='id'
                        :options='flows'
                        @update:model-value='updateFlowName'/>
                      <ButtonIcon
                        v-tooltip.left='t("document.doc.docIn.viewFlow")'
                        class='align-items-center border-round-sm justify-content-center ml-1 w-3rem'
                        :disabled='!doc.flowId'
                        icon='family_history'
                        severity='secondary'
                        size='1.5'
                        @click='showDocumentFlow'></ButtonIcon>
                    </div>
                  </div>
                </div>
                <!--Phương thức nhaan-->
                <div class='col-6 field px-0 py-1'>
                  <label class='align-content-center'>{{
                    t('document.doc.docInDetail.publisherType')
                  }}</label>

                  <NamedDropdown
                    v-model='doc.publisherType'
                    class='w-full'
                    filter
                    is-show-clear
                    name='publisherType'
                    option-label='label'
                    option-value='value'
                    :options='METHOD_RECIEVES'/>
                </div>
                <!--                  Số chuyển phát-->
                <div class='col-6 field pr-0 py-1'>
                  <label class='align-content-center'>{{
                    t('document.doc.docIn.deliveryNumber')
                  }}</label>

                  <InputText
                    v-model='doc.deliveryNumber'
                    v-code
                    class='p-component p-inputtext w-full'
                    name='deliveryNumber'/>
                </div>
              </div>
            </div>
            <!-- Checkboxes -->
            <div class='col-12 flex pt-1 px-0'>
              <div class='col px-0 py-1'>
                <label class='align-content-center doc-in-label font-normal'>Phương thức thông báo</label>
                <div class='flex justify-content-between mt-2'>
                  <div class='flex gap-2'>
                    <Checkbox
                      v-model='doc.isEnvelope'
                      binary
                      name='isEnvelope'
                      value='true'/>

                    <label class='align-content-center'>{{
                      t('document.doc.docInDetail.isEnvelope')
                    }}</label>
                  </div>
                  <div class='flex gap-2'>
                    <Checkbox
                      v-model='doc.isOnlyLeader'
                      binary
                      name='isOnlyLeader'
                      value='true'/>

                    <label
                      class='align-content-center'
                      for='ingredient1'>
                      {{ t('document.doc.docIn.isOnlyLeader') }}
                    </label>
                  </div>
                  <div class='flex gap-2'>
                    <Checkbox
                      v-model='doc.isRequireAnswer'
                      binary
                      name='isRequireAnswer'
                      value='true'/>

                    <label
                      class='align-content-center'
                      for='ingredient1'>
                      {{ t('document.doc.docInDetail.isRequireAnswer') }}
                    </label>
                  </div>
                  <div class='flex gap-2'>
                    <Checkbox
                      v-model='doc.isReply'
                      binary
                      name='isReply'
                      value='true'/>

                    <label class='align-content-center'>{{
                      t('document.doc.docInDetail.isReply')
                    }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionTab>

        <!-- Optional Fields Panel -->
        <AccordionTab header='Thông tin tùy chọn'>
          <div class='p-2'>

            <!-- Độ mật, Độ khẩn, Hạn xử lý, Số ngày -->
            <div class='flex'>
              <div class='col-3 field px-0 py-1'>
                <label class='align-content-center'>{{
                  t('document.doc.advancedSearch.securityCode')
                }}</label>

                <NamedDropdown
                  v-model='doc.securityCode'
                  class='w-full'
                  filter
                  is-show-clear
                  name='securityCode'
                  option-label='label'
                  option-value='value'
                  :options='SECURITIES'/>
              </div>

              <div class='col-3 field pr-0 py-1'>
                <label class='align-content-center'>{{
                  t('document.doc.advancedSearch.priorityCode')
                }}</label>

                <NamedDropdown
                  v-model='doc.priorityCode'
                  class='w-full'
                  is-show-clear
                  name='priorityCode'
                  option-label='label'
                  option-value='value'
                  :options='PRIORITIES'/>
              </div>

              <div class='col-3 field py-1'>
                <label class='align-content-center'>{{
                  t('document.doc.deadline')
                }}</label>

                <NamedInputCalendar
                  v-model='doc.deadlineDate'
                  class='w-full'
                  icon-display='input'
                  name='deadlineDate'
                  :select-other-months='true'
                  show-icon/>
                <ValidateErrorMessage :errors='v$.deadlineDate.$errors'/>
              </div>

              <div class='col-3 field px-0 py-1'>
                <label class='align-content-center'>{{
                  t('document.doc.deadlineNumber')
                }}</label>

                <NamedInputNumber
                  v-model='doc.deadlineNumber'
                  class='w-full'
                  name='deadlineNumber'/>
              </div>
            </div>

            <!-- Số bản, Số trang -->
            <div class='flex'>
              <div class='col-3 field px-0 py-1'>
                <label class='align-content-center'>{{
                  t('document.doc.docInDetail.numberOfCopy')
                }}</label>

                <NamedInputNumber
                  v-model='doc.numberOfCopy'
                  class='w-full'
                  name='numberOfCopy'/>
              </div>
              <div class='col-3 field pr-0 py-1'>
                <label class='align-content-center'>{{
                  t('document.doc.docInDetail.numberOfPage')
                }}</label>

                <NamedInputNumber
                  v-model='doc.numberOfPage'
                  class='w-full'
                  name='numberOfPage'/>
              </div>
              <!--  Lĩnh vực -->

              <div class='col-6 field pr-0 py-1'>
                <label class='align-content-center'>{{
                  t('document.doc.advancedSearch.area')
                }}</label>

                <NamedDropdown
                  v-model='doc.areaId'
                  class='w-full'
                  filter
                  is-show-clear
                  name='areaId'
                  option-label='name'
                  option-value='id'
                  :options='fields'
                  @change='changeArea'/>

                <input
                  v-model='doc.areaName'
                  hidden
                  name='areaName'/>
              </div>
            </div>
            <div class='flex gap-2 mt-2'>
              <Checkbox
                v-model='doc.isLawDocument'
                binary
                name='isLawDocument'
                :value='true'/>

              <label class='align-content-center'>{{
                t('document.doc.docInDetail.isLawDocument')
              }}</label>
            </div>
            <!-- Ghi chú -->
            <div class='flex pt-3'>
              <div class='col field px-0 py-1'>
                <label class='align-content-center'>{{
                  t('document.doc.docIn.note')
                }}</label>

                <Textarea
                  v-model='doc.note'
                  v-trim
                  class='w-full'
                  name='note'
                  rows='3'/>
              </div>
            </div>
          </div>
        </AccordionTab>

        <!-- File Attachments Panel -->
        <AccordionTab header='Văn bản đến số hóa và tài liệu đính kèm *'>
          <div class='p-2'>
            <div class='flex'>
              <div class='col px-0 py-1'>
                <UploadFilesGridWithRadio
                  v-model:files-deleted='listFileDelete'
                  v-model:list-file='attachments'
                  :doc-type='DocTypeEnum.VB_DEN'
                  :file-attachments-name="'attachmentModel'"
                  :header='t("document.doc.docInDetail.attachments")'/>
                <ValidateErrorMessage :errors='v$.attachments.$errors'/>

                <input
                  hidden
                  name='listFileToDelete'
                  :value='listFileDelete'/>
              </div>
            </div>
          </div>
        </AccordionTab>
      </Accordion>

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
    </form>
  </Sidebar>
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

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onMounted, provide, type Ref, ref, watch } from 'vue';
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
import { useDocumentActions } from '@/common/composables/useDocumentActions';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { AttachType } from '@/common/model/attachment';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  isAdminAction: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: false
  },
  docId: {
    type: String,
    default: null
  }
});

const emits = defineEmits(['hide-sidebar']);

// Initialize document actions composable
const { emitSaveAndBack, emitSaveAndContinue } = useDocumentActions();

const { userDeptRole: userDeptRoleStore } = storeToRefs(useDocumentRolesStore());
const isLoading = ref(false);
const form = ref<HTMLFormElement>();
const attachments = ref([]);
const users = ref<UserMoreInfo[]>();
const visibleSidebar = ref(props.visible);
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
const {
  userDeptRole,
  currentOrgId,
  type
} = storeToRefs(
  useDocumentRolesStore(),
);

onMounted(async () => {
  await nextTick(); // Đảm bảo DOM đã render
  const inputEl = document.getElementById('bookId') as HTMLInputElement;
  if (inputEl) {
    inputEl.focus();
  }
});

//test
const {
  load: getNumberDayLoad,
  onResult: getNumberOnResult
} = getNumberDay();
const listFileDelete = ref();
// const route = useRoute();
// const { id } = route.params;
if (props.docId) {
  const findResponse = props.isAdminAction ? adminFindDocInById(props.docId) : findDocById(userDeptRoleStore.value, props.docId);
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

  const { onResult: getAttachmentResult } = findByObjectId(props.docId);

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

  if (!props.docId) {
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
  books.value = res.data.getBook?.filter((b: any) => b.isDeleted == false);
  if (!props.docId) {
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

function showDocumentFlow() {
  visibleView.value = true;
  updateFlowName(doc.value.flowId);
}

function saveDoc() {
  saveDocPromise();
}

const customFilter = (option: any, filterText: any) => {
  if (!filterText) {
    return true;
  }
  return option.name.toLowerCase().includes(filterText.trim().toLowerCase());
};

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
      const saveApi = props.isAdminAction ? adminSaveDocIn(props.docId, formData) : saveDocIn(formData);
      saveApi
        .then(() => {
          toastSuccess({ message: t('document.doc.docIn.saveSuccess') });
          isLoading.value = false;
          emitSaveAndBack();
          emits('hide-sidebar');
        })
        .catch((err) => {
          toastError({ message: t(`document.doc.error.${err.code}`) });
          isLoading.value = false;
        });
    } else {
      const invalidInput = document.querySelector('.p-invalid') as HTMLElement;
      if (invalidInput) {
        invalidInput.focus();
        invalidInput.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

function saveDocAndContinue() {
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
      const saveApi = props.isAdminAction ? adminSaveDocIn(props.docId, formData) : saveDocIn(formData);
      saveApi
        .then(() => {
          toastSuccess({ message: t('document.doc.docIn.saveSuccess') });
          isLoading.value = false;
          emitSaveAndContinue();
          doc.value = {
            incomingDate: new Date(),
            securityCode: SECURITIES[0].value,
            priorityCode: PRIORITIES[0].value,
            publisherType: METHOD_RECIEVES[0].value,
            numberOfPage: 1,
            numberOfCopy: 1
          } as DocInInput;

          attachments.value = [];

          v$.value.$reset();
        })
        .catch((err) => {
          toastError({ message: t(`document.doc.error.${err.code}`) });
          isLoading.value = false;
        });
    } else {
      const invalidInput = document.querySelector('.p-invalid') as HTMLElement;
      if (invalidInput) {
        invalidInput.focus();
        invalidInput.scrollIntoView({ behavior: 'smooth' });
      }
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
            emits('hide-sidebar');
          })
          .catch((err) => {
            toastError({ message: t('document.doc.error.' + err.code) });
            isLoading.value = false;
            reject(err);
          });
      } else {
        reject(new Error('Validation failed'));
        const invalidInput = document.querySelector('.p-invalid') as HTMLElement;
        if (invalidInput) {
          invalidInput.focus();
          invalidInput.scrollIntoView({ behavior: 'smooth' });
        }
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

const validateDocDate = () => {
  return true;
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
  incomingDate: {
    required: helpers.withMessage(t('document.doc.docIn.validate.incomingDateNotNull'), required),
    notAfterDeadlineDate: helpers.withMessage(
      t('document.doc.docIn.validate.docDateNotAfterIncomingDoc'),
      (value: any) => {
        if (doc.value.docDate) {
          return !(value && new Date(value) <= new Date(doc.value.docDate));
        } else {
          return true;
        }
      }
    ),
  },
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
    if (!props.docId) {
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
provide('afterAction', () => emits('hide-sidebar'));
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

<script lang='ts'>
export default { name: 'SidebarDocumentIn' };
</script>

<style>
.doc-in-label {
  font-weight: bold;
}

.book-number > .p-inputtext {
  text-align: center;
  color: #3583C5;
  background: #FEFBEF
}

.field {
  margin-bottom: 0.5rem;
}
</style>

<style scoped>
:deep(.p-accordion .p-accordion-content) {
  padding: 5px 7px;
}
.docIn-num-block {
  margin-top: -0.25rem;
  margin-bottom: 0.65rem;
  background: #E6F4E7
}
:deep(.p-accordion .p-accordion-header .p-accordion-header-link) {
  padding: 9px !important;
}
</style>
