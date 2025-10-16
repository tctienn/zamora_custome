<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    :dismissable='false'
    position='right'
    v-bind='{...DEFAULT_DIALOG_CONFIG,style: {width: "70vw"}}'
    :pt="{
      header: {
        class: 'p-2 pb-3 border-bottom-1 border-gray-300'
      },
      content: {
        class: 'pt-3'
      }
    }"
    :show-close-icon='false'
    @hide='emits("hide-sidebar")'>

    <template #header>
      <div
        class='left-0 surface-0 w-full'
        style='z-index: 1000'>
        <div
          class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              class='border-round-sm'
              icon='arrow_back'
              severity='danger'
              size='small'
              @click='emits("hide-sidebar")'/>
            <div class='align-content-center font-semibold text-2xl'>Thông tin nhập văn bản đã ký</div>
          </div>
          <div class='flex gap-1'>
            <ButtonIcon
              class='border-round-sm'
              :disabled='isLoading'
              icon='save'
              :label='t("document.doc.docIn.saveAndBack")'
              size='small'
              @click='saveDoc'/>
          </div>
        </div>
      </div>
    </template>

    <form
      ref='form'
      class='px-0'
      @submit.prevent='saveDoc'>

      <Accordion
        :active-index='[0, 1, 2]'
        class='accordion-custom'
        :multiple='true'>
        <!-- Required Fields Panel -->
        <AccordionTab header='Thông tin bắt buộc *'>
          <div class='flex flex-wrap px-0 py-2'>
            <!-- Trích yếu -->
            <div class='col-6 field py-1'>
              <label
                v-required
                class='align-content-center'>{{ t('document.doc.docOut.drafterDept') }}</label>
              <OrganizationTree
                v-model='doc.drafterDept'
                class='p-component w-full'
                :max-width-chip='"50rem"'
                :org-type='userDeptRole.type'
                :selection-mode="'single'"
                @change='changeOrgDrafter($event)'>
              </OrganizationTree>
              <ValidateErrorMessage :errors='v$.drafterDeptId.$errors'/>
            </div>

            <div class='col-6 field py-1'>
              <label
                v-required
                class='align-content-center pr-0'>{{ t('document.doc.docOut.drafterId') }}</label>

              <NamedDropdown
                v-model='doc.drafterId'
                class='w-full'
                filter
                name='outgoingDocModel.drafterId'
                option-label='fullName'
                option-value='id'
                :options='editors'
                @change='changeDrafter'/>

              <input
                hidden
                name='outgoingDocModel.drafterName'
                :value='doc.drafterName'/>
              <ValidateErrorMessage :errors='v$.drafterId.$errors'/>
            </div>
            <div class='col-12 flex p-0'>
              <div class='col-12 field py-1'>
                <label
                  v-required
                  class='align-content-center'>{{
                    t('document.doc.docOut.quote')
                  }}</label>

                <Textarea
                  id='categoryDescription'
                  v-model='doc.quote'
                  v-trim
                  class='w-full'
                  name='outgoingDocModel.quote'
                  rows='3'/>
                <ValidateErrorMessage :errors='v$.quote.$errors'/>
              </div>
            </div>
            <div class='col-12 p-0'>
              <!--              Loai van ban-->
              <div class='flex flex-wrap'>
                <div class='col-3 field pr-2 py-1'>
                  <label
                    v-required
                    class='align-content-center'>{{ t('document.doc.docOut.docTypeId') }}</label>

                  <NamedDropdown
                    v-model='doc.docTypeId'
                    class='w-full'
                    filter
                    name='outgoingDocModel.docTypeId'
                    option-label='name'
                    option-value='id'
                    :options='docTypes'
                    @change='changeDocType($event)'/>

                  <input
                    v-model='doc.docTypeName'
                    hidden
                    name='outgoingDocModel.docTypeName'/>

                  <input
                    v-model='doc.docTypeCode'
                    hidden
                    name='outgoingDocModel.docTypeCode'/>

                  <ValidateErrorMessage :errors='v$.docTypeId.$errors'/>
                </div>
                <!--              linh vuc -->
                <div class='col-3 field pl-2 py-1'>
                  <label
                    v-required
                    class='align-content-center'>{{ t('document.doc.docOut.areaId') }}</label>
                  <NamedDropdown
                    v-model='doc.areaId'
                    class='w-full'
                    filter
                    name='outgoingDocModel.areaId'
                    option-label='name'
                    option-value='id'
                    :options='fields'
                    @change='changeArea(doc.areaId)'/>

                  <input
                    v-model='doc.areaName'
                    hidden
                    name='outgoingDocModel.areaName'/>

                  <ValidateErrorMessage :errors='v$.areaId.$errors'/>
                </div>
                <!--  ngay van ban-->
                <div class='col-3 field pr-2 py-1'>
                  <label
                    v-required
                    class='align-content-center'>{{ t('document.doc.docOut.docDate') }}</label>
                  <NamedInputCalendar
                    id='dateIssued'
                    v-model='doc.docDate'
                    class='w-full'
                    name='outgoingDocModel.docDate'
                    :select-other-months='true'
                    show-icon/>
                  <ValidateErrorMessage :errors='v$.docDate.$errors'/>
                </div>
                <!--                ngay deadline-->
                <div class='col-3 field pl-2 py-1'>
                  <label class='align-content-center'>{{ t('document.doc.docOut.deadlineDate') }}</label>
                  <NamedInputCalendar
                    v-model='doc.deadlineDate'
                    class='w-full'
                    name='outgoingDocModel.deadlineDate'
                    :select-other-months='true'
                    show-icon/>
                </div>
                <!--                don vi ban hanh-->
                <div class='col-6 field py-1'>
                  <label
                    v-required
                    class='align-content-center inline-block'>{{ t('document.doc.docOut.issuerDept') }}</label>

                  <OrganizationTree
                    v-model='doc.issuerDept'
                    class='p-component w-full'
                    :max-width-chip='"50rem"'
                    :org-type='userDeptRole.type'
                    :selection-mode="'single'"
                    @change='changeOrgIssuer($event)'>
                  </OrganizationTree>

                  <ValidateErrorMessage :errors='v$.issuerDeptId.$errors'/>
                </div>
                <!--                nguoi ki-->
                <div
                  v-if='doc.isFromOutsidePaper'
                  class='col-6 field py-1'>
                  <label
                    v-required
                    class='align-content-center pr-0'>{{ t('document.doc.docOut.signerId') }}</label>
                  <NamedDropdown
                    v-model='doc.signerId'
                    class='w-full'
                    filter
                    is-show-clear
                    name='outgoingDocModel.signerId'
                    option-label='fullName'
                    option-value='id'
                    :options='signers'
                    @change='changeSigner'/>
                  <ValidateErrorMessage :errors='v$.signerId.$errors'/>
                  <input
                    v-model='doc.signerName'
                    hidden
                    name='outgoingDocModel.signerName'/>
                </div>
                <div v-else>
                  <input
                    v-model='doc.signerId'
                    hidden
                    name='outgoingDocModel.signerId'/>
                  <input
                    v-model='doc.signerName'
                    hidden
                    name='outgoingDocModel.signerName'/>
                </div>
              </div>

              <!-- Sổ văn bản và số văn bản -->
              <div class='flex flex-wrap'>
                <div class='col-3 field py-1'>
                  <label
                    v-required
                    class='align-content-center doc-out-label'>{{ t('document.doc.docOut.bookId') }}</label>
                  <NamedDropdown
                    v-model='doc.bookId'
                    class='w-full'
                    filter
                    name='outgoingDocModel.bookId'
                    option-label='bookName'
                    option-value='id'
                    :options='books'
                    @change='changeBook($event)'/>
                  <ValidateErrorMessage :errors='v$.bookId.$errors'/>
                </div>

                <div class='col-3 field py-1'>
                  <label
                    v-required
                    class='align-content-center'>{{ t('document.doc.docOut.docCode') }}</label>
                  <InputText
                    v-model='doc.docCode'
                    class='w-full'
                    name='outgoingDocModel.docCode'/>
                  <ValidateErrorMessage :errors='v$.docCode.$errors'/>
                </div>
                <div class='col-3 field py-1'>
                  <label class='align-content-center'>{{ t('document.doc.docOut.subBookNumber') }}</label>
                  <NamedInputNumber
                    v-model='doc.subBookNumber'
                    class='w-full'
                    name='outgoingDocModel.subBookNumber'/>
                </div>
                <div class='col-3 field py-1'>
                  <label class='align-content-center'>{{ t('document.doc.docOut.numberOfCopy') }}</label>
                  <NamedInputNumber
                    v-model='doc.numberOfCopy'
                    class='w-full'
                    name='outgoingDocModel.numberOfCopy'/>
                </div>
                <div class='col-4 field py-1'>
                  <label class='align-content-center'>{{ t('document.doc.docOut.priorityCode') }}</label>
                  <NamedDropdown
                    v-model='doc.priorityCode'
                    class='w-full'
                    name='outgoingDocModel.priorityCode'
                    option-label='label'
                    option-value='value'
                    :options='PRIORITIES'/>
                </div>

                <div class='col-4 field py-1'>
                  <label class=''>{{ t('document.doc.docOut.securityCode') }}</label>
                  <NamedDropdown
                    v-model='doc.securityCode'
                    class='w-full'
                    name='outgoingDocModel.securityCode'
                    option-label='label'
                    option-value='value'
                    :options='SECURITIES'/>
                </div>
                <div class='col-4 field py-1'>
                  <label class='align-content-center'>{{ t('document.doc.docOut.numberOfPage') }}</label>
                  <NamedInputNumber
                    v-model='doc.numberOfPage'
                    class='w-full'
                    name='outgoingDocModel.numberOfPage'/>
                </div>
                <div class='col-6 field py-1'>
                  <label
                    v-required
                    class='align-content-center'>{{ t('document.doc.docOut.bookNumber') }}</label>

                  <div class='field-custom flex gap-2'>
                    <NamedInputNumber
                      v-model='doc.bookNumber'
                      class='w-full'
                      name='outgoingDocModel.bookNumber'/>
                    <ButtonIcon
                      class='btn-create'
                      :disabled='!bookNumReserve'
                      icon='playlist_add'
                      @click='visibleBookNumber = true'/>
                  </div>
                  <ValidateErrorMessage :errors='v$.bookNumber.$errors'/>
                </div>
                <div class='align-content-center align-items-end col-6 field py-1'>
                  <div class='flex gap-5 justify-content-end mt-5'>
                    <div class='flex gap-2'>
                      <label class='align-content-center'>{{ t('document.doc.docOut.isLawDocument') }}</label>
                      <div class='align-content-center'>
                        <Checkbox
                          v-model='doc.isLawDocument'
                          :binary='true'
                          class='align-content-center'
                          input-id='ingredient1'
                          name='outgoingDocModel.isLawDocument'/>
                      </div>
                    </div>

                    <div class='flex gap-2'>
                      <label class='align-content-center'>{{ t('document.doc.docOut.isReply') }}</label>
                      <div class='align-content-center'>
                        <Checkbox
                          v-model='doc.isReply'
                          :binary='true'
                          input-id='ingredient1'
                          name='outgoingDocModel.isReply'/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionTab>

        <!-- Recipients Panel -->
        <AccordionTab header='Người/Đơn vị nhận'>
          <div class='flex flex-wrap p-2'>
            <div class='align-items-center col-12 flex justify-content-between px-0 py-1'>
              <label class='font-semibold'>{{ t('document.doc.docOut.receive') }}</label>
              <div class='flex gap-1'>
                <ButtonIcon
                  v-tooltip.top="'Chọn'"
                  class='p-button-icon-only'
                  icon='add'
                  @click='openDialogTree'/>
                <ButtonIcon
                  v-tooltip.top="'Xóa'"
                  class='p-button-icon-only'
                  icon='close'
                  @click='clearDialogTree'/>
              </div>
            </div>

            <div class='col-12 px-0 py-1'>
              <DataTable
                class='border-1 surface-border w-full'
                :value='optionsTree'
                v-bind='DEFAULT_DATATABLE_CONFIG'>

                <template #empty>
                  <span class='block font-bold text-600 text-center'>
                    {{
                      t('common.emptyRecords', {
                        itemType: toLower('Người/Đơn vị nhận'),
                      })
                    }}
                  </span>
                </template>

                <Column
                  class='col-1 text-center'
                  header='STT'>
                  <template #body='{index}'>
                    {{ index + 1 }}
                  </template>
                </Column>

                <Column
                  header='Người/Đơn vị nhận'
                  header-class='text-center col-8'>
                  <template #body='{data: {label}}'>
                    {{ label }}
                  </template>
                </Column>

                <Column
                  class='col-2'
                  header='Loại'
                  header-class='text-center'>
                  <template #body='{data:{value: {objectType}}}'>
                    {{ mapReceiveObjectTypeName(objectType) }}
                  </template>
                </Column>

                <Column
                  class='text-center'
                  header='Thao tác'>
                  <template #body='{data:{value}}'>
                    <div class='action-wrapper'>
                      <ButtonIcon
                        v-tooltip.left='"Xóa"'
                        class='btnAction'
                        icon='delete'
                        icon-size='1.5'
                        rounded
                        text
                        @click='deleteReceive(value)'/>
                    </div>
                  </template>
                </Column>
              </DataTable>
              <ValidateErrorMessage :errors='v$.receivers.$errors'/>
            </div>

          </div>
        </AccordionTab>

        <!-- Attachments Panel -->
        <AccordionTab header='Tài liệu đính kèm'>
          <div class='flex flex-wrap p-2'>
            <div class='col-12 px-0 py-1'>
              <UploadFilesGridWithRadio
                v-model:files-deleted='listFileDelete'
                v-model:list-file='attachments'
                :can-edit='true'
                :doc-type='DocTypeEnum.VB_DI'
                :file-attachments-name="'attachmentModel'"
                :header="'1.Văn bản dự thảo - Ký số ban hành'"
                :is-view='!doc.isFromOutsidePaper'
                :max-height="'11rem'"/>
              <ValidateErrorMessage :errors='v$.attachments.$errors'/>
              <input
                hidden
                name='listFileToDelete'
                :value='listFileDelete'/>
            </div>

            <div class='col-12 px-0 py-1'>
              <UploadFilesForDocOut
                v-model:file-type-upload-name='fileTypeUploadName'
                v-model:file-upload-from-ecm='filesUploadFromEcm'
                v-model:file-upload-from-system='filesUploadFromSystem'
                v-model:files-deleted='listFileRelatedDelete'
                v-model:list-file='relatedDocuments'
                :can-edit='true'
                :file-attachments-name="'relatedDocuments'"
                :header="'2.Tài liệu liên quan'"/>

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
        </AccordionTab>
      </Accordion>

      <!-- Hidden fields -->
      <div class='formgrid grid grid-nogutter'>
        <input
          v-model='doc.id'
          hidden
          name='outgoingDocModel.id'>

        <input
          v-model='doc.createdBy'
          hidden
          name='outgoingDocModel.createdBy'>

        <input
          v-model='doc.createdTime'
          hidden
          name='outgoingDocModel.createdTime'>

        <input
          v-model='doc.isFromOutsidePaper'
          hidden
          name='outgoingDocModel.isFromOutsidePaper'/>

        <input
          v-model='doc.bookName'
          hidden
          name='outgoingDocModel.bookName'>

        <input
          v-model='userDeptRole.userId'
          hidden
          name='userDeptRoleModel.userId'>

        <input
          v-model='userDeptRole.userName'
          hidden
          name='userDeptRoleModel.userName'>

        <input
          v-model='userDeptRole.deptId'
          hidden
          name='userDeptRoleModel.deptId'>

        <input
          v-model='userDeptRole.deptName'
          hidden
          name='userDeptRoleModel.deptName'>

        <input
          v-model='userDeptRole.roleId'
          hidden
          name='userDeptRoleModel.roleId'>

        <input
          v-model='userDeptRole.roleName'
          hidden
          name='userDeptRoleModel.roleName'>

        <input
          v-model='userDeptRole.type'
          hidden
          name='userDeptRoleModel.type'>

        <input
          v-model='doc.signTime'
          hidden
          name='outgoingDocModel.signTime'>

        <input
          v-model='doc.signType'
          hidden
          name='outgoingDocModel.signType'>

        <input
          hidden
          name='outgoingDocModel.drafterDeptId'
          :value='doc.drafterDeptId'/>

        <input
          hidden
          name='outgoingDocModel.drafterDeptName'
          :value='doc.drafterDeptName'/>

        <input
          hidden
          name='outgoingDocModel.drafterDeptCode'
          :value='doc.drafterDeptCode'/>

        <input
          hidden
          name='outgoingDocModel.issuerDeptId'
          :value='doc.issuerDeptId'/>
        <input
          hidden
          name='outgoingDocModel.issuerDeptName'
          :value='doc.issuerDeptName'/>

        <input
          hidden
          name='outgoingDocModel.issuerId'
          :value='doc.issuerId'/>

        <input
          hidden
          name='outgoingDocModel.issuerName'
          :value='doc.issuerId'/>
      </div>
    </form>
  </Sidebar>

  <DialogBookNumber
    v-if='visibleBookNumber'
    :book-num-reserve='bookNumReserve'
    :visible='visibleBookNumber'
    @hide-dialog='hideBookNumber'
    @save-number='getBookNumber'/>

  <UserOrganizationDialog
    v-if='visibleDialogTree'
    :user-dept='optionsTree'
    :visible='visibleDialogTree'
    @hide-dialog='hideDialogUserOrganization'/>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import DataTable from 'primevue/datatable';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getAllUserMoreInfoGraphql, getAllUserServicePublic } from '@/apps/admin/api/graphql/admin-customer-tenant';
import {
  getAllOrganizationPublicGraphql, getRootGraphql,
  getUsersByRoleAndByOrganizationId
} from '@/apps/admin/api/graphql/organization-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { getBook } from '@/apps/document/api/graphql/book';
import { getAllNumbReserveByBookId } from '@/apps/document/api/graphql/book-num-reserve';
import { findDocOutByIdGraph } from '@/apps/document/api/graphql/doc-out';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getAllField } from '@/apps/document/api/graphql/field';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import { getByTypeGraphql, getRootOrganizationGraphql } from '@/apps/document/api/graphql/organization';
import { getTextSymbolByDeptId } from '@/apps/document/api/graphql/text-symbol';
import {
  findByOrganizationIdLazyQuery,
  findUsersByOrganizationTypeAndRole
} from '@/apps/document/api/graphql/userOrganization';
import { savePromulgateDoc } from '@/apps/document/api/rest/docOut';
import { AttachType, type DocumentAttachment } from '@/apps/document/model/attachment';
import { type BookInterface, BookType } from '@/apps/document/model/book';
import { PRIORITIES, SECURITIES } from '@/apps/document/model/doc/doc-in';
import type { DocOut, DocOutInput } from '@/apps/document/model/doc/doc-out';
import { DocTypeEnum } from '@/apps/document/model/docInBook';
import type { DocTypeInterface } from '@/apps/document/model/docType';
import type { FieldInterface } from '@/apps/document/model/field';
import { OrganizationType } from '@/apps/document/model/organization';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { ReceiveObjectType } from '@/apps/document/model/outgoingDocReceivers';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import OutNextButtonsInForm
  from '@/apps/document/views/doc/doc-out/component/next-buttons-infom/OutNextButtonsInForm.vue';
import OutTempFlowButtons from '@/apps/document/views/doc/doc-out/component/temp-flow-buttons/OutTempFlowButtons.vue';
import DialogBookNumber from '@/apps/document/views/doc/doc-out/detail/DialogBookNumber.vue';
import UserOrganizationDialog from '@/apps/document/views/doc/UserOrganizationDialog.vue';
import type { EdgeInputInterface, NodeInputInterface } from '@/apps/work-flow/model/flow';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedInputNumber from '@/common/components/custom/NamedInputNumber.vue';
import UploadFilesForDocOut from '@/common/components/custom/UploadFilesForDocOut.vue';
import UploadFilesGridWithRadio from '@/common/components/custom/UploadFilesGridWithRadio.vue';
import { useDocumentActions } from '@/common/composables/useDocumentActions';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { TypeOfTake } from '@/common/model/attachment';
import type { User } from '@/common/model/User';
import router from '@/common/router';

const props = defineProps({
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

const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const books = ref<BookInterface[]>([] as BookInterface[]);
const {
  userDeptRole,
  currentOrgId,
  type
} = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const orgs = ref<{ label: string, value: string, code: string }[]>([]);
const editors = ref();
const visibleSidebar = ref(props.visible);
const optionsTree = ref<{ label: string, value: any }[]>([]);
const attachments = ref([] as DocumentAttachment[]);
const listFileDelete = ref();
const fileTypeUploadName = ref<string[]>([]);
const listFileRelatedDelete = ref();
const filesUploadFromSystem = ref();
const filesUploadFromEcm = ref();
const isLoading = ref(false);
const form = ref();
const relatedDocuments = ref([] as DocumentAttachment[]);
const route = useRoute();
const docTypes = ref<DocTypeInterface[]>([] as DocTypeInterface[]);
const fields = ref<FieldInterface[]>([] as FieldInterface[]);
const visibleDialogTree = ref(false);
const selectedUser = ref<any>();
const userIds = ref([] as string[]);
const symbol = ref<string>('');
const users = ref([] as UserMoreInfo[]);
const visibleBookNumber = ref(false);
const bookNumReserve = ref();
const signers = ref([] as User[]);
const rootOrganizationCode = ref<string>('');
const { onResult: getDocTypeResult } = getAllDocType();
const { onResult: getFieldResult } = getAllField();
const {
  onResult: userAdministrativeResult,
  load: userAdministrativeLoad,
  refetch: userAdministrativeRefetch
} = getUsersByRoleAndByOrganizationId();
const {
  load: findByBookIdLoad,
  refetch: findByBookIdRefetch,
  onResult: findByBookIdOnResult
} = getAllNumbReserveByBookId();
const {
  onResult: userOrganizationResult,
  load: userOrganizationLoad,
  refetch: userOrganizationRefetch
} = findByOrganizationIdLazyQuery();
const { onResult: getOrgResult } = getOrgOut();
const {
  onResult: getBookResult,
  load: getBookLoad,
  refetch: getBookRefetch
} = getBook();
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

const validateReceives = () => {
  return optionsTree.value.length > 0;
};
const initFrom = ref(true);
onMounted(() => {
  initFrom.value = true;
});
const validateSigner = () => {
  if (doc.value.isFromOutsidePaper == true) {
    if (doc.value.signerId == null || doc.value.signerId == '' || doc.value.signerId == undefined) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
};

const validateRules = {
  issuerDeptId: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.issuerDeptIdNotNull'),
      required,
    ),
  },
  quote: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.quoteNotNull'),
      required,
    ),
  },
  docTypeId: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.docTypeIdNotNull'),
      required,
    ),
  },
  areaId: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.areaIdNotNull'),
      required,
    ),
  },
  drafterDeptId: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.drafterDeptIdNotNull'),
      required,
    ),
  },
  attachments: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.attachmentsNotNull'),
      validateAttachment,
    ),
  },
  bookId: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.bookIdNotNull'),
      required,
    ),
  },
  bookNumber: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.bookNumberNotNull'),
      required,
    ),
  },
  docCode: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.docCodeNotNull'),
      required,
    ),
  },
  drafterId: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.drafterIdNotNull'),
      required,
    ),
  },
  docDate: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.docDateNotNull'),
      required,
    ),
  },
  signerId: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.signerIdNotNull'),
      validateSigner,
    ),
  },
  receivers: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.receiversNotNull'),
      validateReceives,
    ),
  }
};

const isHaveTextSymbol = ref(false);
// Initialize document actions composable
const { emitSaveAndBack } = useDocumentActions();

getTextSymbolByDeptId(userDeptRole.value.deptId).onResult(async (res) => {
  symbol.value = await res.data.getTextSymbolByDeptId;
  isHaveTextSymbol.value = !!symbol.value;
  if (!props.docId) {
    doc.value.docCode = res.data.getTextSymbolByDeptId;
  }
});

const doc = ref({
  securityCode: SECURITIES[0].value,
  priorityCode: PRIORITIES[0].value,
  isFromOutsidePaper: !props.docId,
  numberOfCopy: 1,
  numberOfPage: 1
} as DocOutInput);
const v$ = useVuelidate(validateRules, doc);

findByBookIdOnResult((res) => {
  bookNumReserve.value = res.data.getAllNumbReserveByBookId;
});

getDocTypeResult(async (res) => {
  docTypes.value = await res.data.getAllDocType;

  if (!props.docId) {
    doc.value.docTypeId = (
        docTypes.value.length > 0 ? await docTypes.value[0].id : null
    )!;
    doc.value.docTypeName = (
        docTypes.value.length > 0 ? await docTypes.value[0].name : null
    )!;
    doc.value.docTypeCode = (
        docTypes.value.length > 0 ? await docTypes.value[0].code : null
    )!;
  }
});

getAllUserMoreInfoGraphql().onResult(res => {
  users.value = res.data.getAllUserMoreInfo;
  userIds.value = users.value.map((u) => u.id);
});

if (userDeptRole.value.type == OrganizationType.ADMINISTRATIVE) {
  getAllUserServicePublic().onResult((res) => {
    signers.value = res.data.getAllUserServicePublic.filter((u: any) => u.roles?.some((role: any) => role?.includes(RoleType.LANH_DAO)));
  });
} else {
  findUsersByOrganizationTypeAndRole(userDeptRole.value.type, RoleType.LANH_DAO.toString()).onResult((res) => {
    signers.value = res.data.findUsersByOrganizationTypeAndRole;
  });
}

getFieldResult((res) => {
  fields.value = res.data.getAllField;
});

userAdministrativeResult((res) => {
  editors.value = res.data.getUsersByRoleAndByOrganizationId;
});

userOrganizationResult((res) => {
  editors.value = res.data.findByOrganizationId.filter((u: any) => u.role == RoleType.CHUYEN_VIEN);
});

getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut.map((item: OrgOutInterface) => {
    return {
      label: item.orgOutName,
      value: {
        id: item.id,
        orgOutName: item.orgOutName
      }
    };
  });
});

if (userDeptRole.value.type == OrganizationType.ADMINISTRATIVE) {
  getRootGraphql().onResult(async (res) => {
    rootOrganizationCode.value = await res.data?.getRoot[0]?.code;
  });
  getAllOrganizationPublicGraphql().onResult((res) => orgs.value = res.data.allOrganizationPublic.map((o: any) => ({
    label: o.name,
    value: o.id,
    code: o.code
  })));
} else if (userDeptRole.value.type == OrganizationType.PARTY) {
  getRootOrganizationGraphql(OrganizationType.PARTY).onResult(async (res) => {
    rootOrganizationCode.value = await res.data?.getRoot[0]?.code;
  });
  getByTypeGraphql(OrganizationType.PARTY).onResult((res) => orgs.value = res.data.getByType.map((o: any) => ({
    label: o.name,
    value: o.id,
    code: o.code
  })));
} else {
  getRootOrganizationGraphql(OrganizationType.UNION).onResult(async (res) => {
    rootOrganizationCode.value = await res.data?.getRoot[0]?.code;
  });
  getByTypeGraphql(OrganizationType.UNION).onResult((res) => orgs.value = res.data.getByType.map((o: any) => ({
    label: o.name,
    value: o.id,
    code: o.code
  })));
}

getBookResult((res) => {
  books.value = res.data.getBook;
  if (!props.docId || !doc.value.isFromOutsidePaper && !doc.value.bookId) {
    doc.value.bookId = (
        books.value.length > 0
          ? books.value.find((b) => b.isDefault == true)?.id ?? books.value[0].id
          : null
    )!;

    doc.value.bookNumber =
        books.value.find((b) => b.id == doc.value.bookId)
          ?.currentNumber || 0;

    doc.value.bookName = (
        books.value.length > 0 ? books.value[0].bookName : null
    )!;

    findByBookIdLoad(undefined, { bookId: doc.value.bookId }) || findByBookIdRefetch;
  }
});

if (props.docId) {
  findDocOutByIdGraph(userDeptRole.value, props.docId).onResult((res) => {
    doc.value = res.data.findByDocOutById;
    doc.value = {
      ...doc.value,
      subBookNumber: !doc.value.subBookNumber ? undefined : doc.value.subBookNumber,
      deadlineDate: doc.value.deadlineDate ? new Date(doc.value.deadlineDate) : null,
      docDate: doc.value.docDate ? new Date(doc.value.docDate) : null,
      drafterDept: [doc.value.drafterDeptId],
      issuerDept: [doc.value.issuerDeptId]
    };
    if (doc.value.drafterDeptId) {
      changeOrgDrafter(doc.value.drafterDeptId);
    }

    if (doc.value.docTypeId) {
      changeDocType(doc.value.docTypeId);
    }

    changeOrgIssuer(doc.value.issuerDeptId);
    relatedDocuments.value = doc.value.outGoingFilesRelate;
    attachments.value = doc.value.outGoingAttachments;
    filesUploadFromSystem.value = relatedDocuments.value.filter((x: any) => x.typeOfTake == TypeOfTake.REFERENT);
    selectedUser.value = doc.value.receivers.map(userOrg => {
      if (userOrg.objectType == ReceiveObjectType.DON_VI_NGOAI) {
        return {
          'id': userOrg.objectId,
          'orgOutName': userOrg.objectName
        };
      } else if (userOrg.objectType == ReceiveObjectType.DON_VI_NOI_BO) {
        return {
          'deptId': userOrg.objectId,
          'deptName': userOrg.objectName,
          'id': `org_${userOrg.objectId}`
        };
      } else if (userOrg.objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG) {
        return {
          'userId': userOrg.objectId,
          'userName': userOrg.objectName,
          'deptId': userOrg.deptId,
          'deptName': userOrg.deptName,
          'roleId': userOrg.roleId ?? null,
          'roleName': userOrg.roleName ?? null,
          'id': `${userOrg.objectId}_${userOrg.roleId}`
        };
      }
    });

    optionsTree.value = doc.value.receivers.map((re: any) => {
      return {
        label: re.roleId ? `${re.objectName}-${re.roleName}` : re.objectName,
        value: {
          id: re.id,
          receiveStatus: re.receiveStatus,
          receiveType: re.receiveType,
          objectType: re.objectType,
          objectId: re.objectId,
          objectName: re.objectName,
          orderNo: re.orderNo,
          roleId: re.roleId,
          roleName: re.roleName,
          deptId: re.deptId,
          deptName: re.deptName
        }
      };
    });
  });
}

function changeBook(event: any) {
  doc.value.bookName = books.value.find((b) => b.id == (event.value ? event.value : event))?.bookName ?? '';
  doc.value.bookNumber = books.value.find((b) => b.id == (event.value ? event.value : event))?.currentNumber || 0;
  findByBookIdLoad(undefined, { bookId: event.value }) || findByBookIdRefetch();
}

function hideDialogUserOrganization(data: any[]) {
  if (data) {
    optionsTree.value = data.map((res, index) => ({
      label: (res.userName ? res.userName + ' - ' + res.deptName + ' - ' + res.roleName : '') || res.orgOutName || res.deptName,
      value: {
        ...res,
        objectType: res.userName ? ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG : res.deptName
          ? ReceiveObjectType.DON_VI_NOI_BO : res.orgOutName ? ReceiveObjectType.DON_VI_NGOAI : ReceiveObjectType.DON_VI_NGOAI,
        objectId: res.userName ? res.userId : res.deptName
          ? res.deptId : res.orgOutName ? res.id : '',
        objectName: res.userName || res.deptName || res.orgOutName || '',
        orderNo: index + 1,
      }
    }));
  }
  visibleDialogTree.value = false;
}

function changeDrafter(event: any) {
  doc.value.drafterName = editors.value.find((e: any) => e.id == event.value).fullName ?? '';
}

function getBookNumber(number: number) {
  doc.value.bookNumber = number;
}

function hideBookNumber() {
  visibleBookNumber.value = false;
}

function changeArea(id: string) {
  const field: any = fields.value.find((f: any) => f.id == id);
  doc.value.areaName = field ? field.name : '';
}

function changeSigner(event: any) {
  doc.value.signerName = signers.value.find((s) => s.id == event.value)?.fullName ?? '';
}

function changeDocType(event: any) {
  let docTypeStr = '';
  if (typeof event == 'object') {
    docTypeStr = event.value;
  } else if (typeof event == 'string') {
    docTypeStr = event;
  }

  doc.value.docTypeName =
      docTypes.value.find((dt: DocTypeInterface) => dt.id == docTypeStr)?.name
      ?? '';

  doc.value.docTypeCode =
      docTypes.value.find((dt: DocTypeInterface) => dt.id == docTypeStr)?.code
      ?? '';
}

function openDialogTree() {
  visibleDialogTree.value = true;
}

function clearDialogTree() {
  optionsTree.value = [];
  selectedUser.value = [];
}

function deleteReceive(receive: any) {
  optionsTree.value = optionsTree.value.filter((data) => data.value != receive);
}

function changeOrgDrafter(event: any) {
  if (typeof event == 'object') {
    doc.value.drafterDeptId = Object.keys(event)[0];
  } else {
    doc.value.drafterDeptId = event;
  }
  const org = orgs.value.find(o => o.value == doc.value.drafterDeptId);
  doc.value.drafterDeptName = org ? org.label : '';
  doc.value.drafterDeptCode = org ? org.code : '';

  if (userDeptRole.value.type == OrganizationType.ADMINISTRATIVE) {
    userAdministrativeLoad(undefined, {
      organizationId: typeof event == 'object' ? Object.keys(event)[0] : event,
      role: RoleType.CHUYEN_VIEN
    }) || userAdministrativeRefetch;
  } else {
    userOrganizationLoad(undefined, { organizationId: typeof event == 'object' ? Object.keys(event)[0] : event }) || userOrganizationRefetch;
  }
}

function changeOrgIssuer(event: any) {
  if (typeof event == 'object') {
    doc.value.issuerDeptId = Object.keys(event)[0];
    const org = orgs.value.find(o => o.value == doc.value.issuerDeptId);
    doc.value.issuerDeptName = org ? org.label : '';
  }
}

getBookLoad(undefined, {
  structureType: type.value,
  depId: currentOrgId.value,
  bookType: BookType.DOC_OUT,
}) || getBookRefetch();

function saveDoc() {
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
      optionsTree.value.forEach((x: { label: string, value: any }, index: number) => {
        if (x.value.id) {
          formData.append(`receiversModel[${index}].id`, x.value.id?.toString());
        }
        formData.append(`receiversModel[${index}].objectId`, x.value.objectId.toString());
        formData.append(`receiversModel[${index}].objectName`, x.value.objectName.toString());
        formData.append(`receiversModel[${index}].objectType`, x.value.objectType.toString());
        formData.append(`receiversModel[${index}].orderNo`, x.value.orderNo.toString());
        if (x.value.objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG) {
          formData.append(`receiversModel[${index}].roleId`, x.value.roleId?.toString());
          formData.append(`receiversModel[${index}].roleName`, x.value.roleName?.toString());
          formData.append(`receiversModel[${index}].deptId`, x.value.deptId?.toString());
          formData.append(`receiversModel[${index}].deptName`, x.value.deptName?.toString());
        }
      });

      filesUploadFromSystem.value?.forEach((x: any, index: number) => {
        if (x.id) {
          formData.append(`filesFromSystem[${index}].id`, x.attachmentId?.toString());
        }
        formData.append(`filesFromSystem[${index}].objectId`, x.objectId?.toString());
        formData.append(`filesFromSystem[${index}].fullName`, x.fullName?.toString());
        formData.append(`filesFromSystem[${index}].fileName`, x.fileName?.toString());
        formData.append(`filesFromSystem[${index}].fileExtension`, x.fileExtension?.toString());
        formData.append(`filesFromSystem[${index}].filePath`, x.filePath?.toString());
        formData.append(`filesFromSystem[${index}].attachType`, AttachType.FILE_LIENQUAN.toString());
        formData.append(`filesFromSystem[${index}].size`, x.size?.toString());
        formData.append(`filesFromSystem[${index}].typeOfTake`, x.typeOfTake);
      });

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

      attachments.value.filter((a: any) => a.type == 'Template').forEach((attachment: any, index: number) => {
        formData.append(`fileTemplates[${index}].fullName`, attachment.fullName?.toString());
        formData.append(`fileTemplates[${index}].fileName`, attachment.fileName?.toString());
        formData.append(`fileTemplates[${index}].fileExtension`, attachment.fileExtension?.toString());
        formData.append(`fileTemplates[${index}].filePath`, attachment.filePath?.toString());
        formData.append(`fileTemplates[${index}].attachType`, AttachType.FILE_LIENQUAN.toString());
        formData.append(`fileTemplates[${index}].size`, attachment.size?.toString());
      });
      savePromulgateDoc(formData)
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
    }
  }
  );
}

watch([() => doc.value.bookNumber, () => doc.value.docTypeCode,
  () => doc.value.drafterDeptCode], ([newBookNumber, newDocTypeCode, newDrafterDeptCode], [oldBookNumber, oldDocTypeCode, oldDrafterDeptCode]) => {
  // Hàm này sẽ được gọi khi một trong các giá trị thay đổi
  if (!initFrom.value && isHaveTextSymbol.value) {
    doc.value.docCode = symbol.value;

    // Nếu có bookNumber mới, thay thế trong docCode
    if (doc.value.docCode?.includes('docNum')) {
      doc.value.docCode = doc.value.docCode?.replace('docNum', newBookNumber?.toString());
    }

    // Nếu có docTypeCode mới, thay thế trong docCode
    if (doc.value.docCode?.includes('docType')) {
      doc.value.docCode = doc.value.docCode?.replace('docType', newDocTypeCode);
    }

    // Nếu có drafterDeptCode mới, thay thế trong docCode
    if (doc.value.docCode?.includes('deptCode')) {
      doc.value.docCode = doc.value.docCode?.replace('deptCode', newDrafterDeptCode ?? '');
    }

    // Cập nhật các giá trị còn lại
    if (doc.value.docCode?.includes('superiorCode')) {
      doc.value.docCode = doc.value.docCode?.replace('superiorCode', rootOrganizationCode.value);
    }
  }

  initFrom.value = false;
});

function mapReceiveObjectTypeName(objectType: ReceiveObjectType) {
  if (objectType == ReceiveObjectType.DON_VI_NOI_BO) {
    return 'Đơn vị nội bộ';
  } else if (objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG) {
    return 'Người nhận trong hệ thống';
  } else if (objectType == ReceiveObjectType.DON_VI_NGOAI) {
    return 'Đơn vị ngoài';
  }
}
</script>

<script lang='ts'>
export default { name: 'SidebarPromulgate' };
</script>

<style scoped>
:deep(.p-accordion .p-accordion-content) {
  padding: 5px;
}

:deep([class*="col-"]) {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.field-custom {
  display: inline-block;
  width: auto;
  padding-right: 1rem
}

.action-wrapper .btnAction {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.p-datatable tbody tr:hover .action-wrapper .btnAction {
  opacity: 1;
}
:deep(.p-accordion .p-accordion-header .p-accordion-header-link) {
  padding: 9px !important;
}
</style>