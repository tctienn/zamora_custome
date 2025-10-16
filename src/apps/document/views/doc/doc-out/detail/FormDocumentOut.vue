<template>
  <div
    class='card flex flex-column gap-4 overflow-auto pb-8'
    style='height: calc(100vh - 10rem)'>
    <h5 class='m-0 p-0'>{{ t('document.doc.docOut.draftInfo') }}</h5>
    <form
      ref='form'
      @submit.prevent='saveDoc'>
      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label>{{ t('document.doc.docOut.deptName') }}</label>
        </div>
        <div class='col-3'>
          <b>{{ userDeptRole.deptName }}</b>

          <input
            v-model='doc.incomingDocId'
            hidden
            name='outgoingDocModel.incomingDocId'>

          <input
            v-model='userDeptRole.deptId'
            hidden
            name='outgoingDocModel.editorDeptId'>
          <input
            v-model='userDeptRole.deptName'
            hidden
            name='outgoingDocModel.editorDeptName'>

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
            v-model='userDeptRole.userId'
            hidden
            name='outgoingDocModel.drafterId'>

          <input
            v-model='userDeptRole.userName'
            hidden
            name='outgoingDocModel.drafterName'>

          <input
            v-model='userDeptRole.deptId'
            hidden
            name='outgoingDocModel.drafterDeptId'>

          <input
            v-model='userDeptRole.deptName'
            hidden
            name='outgoingDocModel.drafterDeptName'>

          <input
            v-model='userDeptRole.roleId'
            hidden
            name='outgoingDocModel.drafterRoleId'>

          <input
            v-model='userDeptRole.roleName'
            hidden
            name='outgoingDocModel.drafterRoleName'>
        </div>

        <div class='col-1 field-custom flex'>
          <label>{{ t('document.doc.docOut.userName') }}</label>
        </div>
        <div class='col-3'>
          <b>{{ userDeptRole.userName }}</b>
          <input
            v-model='userDeptRole.userId'
            hidden
            name='outgoingDocModel.editorId'>
          <input
            v-model='userDeptRole.userName'
            hidden
            name='outgoingDocModel.editorName'>
        </div>

        <div
          v-if='incomingDocId'
          class='col'>
          <div class='py-2'>
            {{ t('document.doc.docOut.viewFileMain') }}
          </div>
          <div
            class='cursor-pointer'
            style='background: #FFFADF'
            @click='viewFileMain'>
            <div class='p-2'>
              <div class='flex gap-4'>
                <div class='flex gap-2'>
                  <label>{{ t('document.doc.docOut.number') }}</label>
                  <p
                    class='font-semibold'
                    style='color: blue'>{{ doc?.incomingDoc?.docCode }}</p>
                </div>
                <div class='flex gap-2'>
                  <label>{{ t('document.doc.docOut.date') }}</label>
                  <p class='font-semibold'>{{ moment(doc?.incomingDoc?.docDate).format('DD-MM-YYYY') }}</p>
                </div>
              </div>
              <div>
                {{ quote }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label
            v-required
            class='font-semibold'>{{ t('document.doc.docOut.quote') }}
          </label>
        </div>
        <div class='col'>
          <Textarea
            id='categoryDescription'
            v-model='doc.quote'
            v-trim
            class='w-full'
            name='outgoingDocModel.quote'
            rows='2'/>
          <ValidateErrorMessage :errors='v$.quote.$errors'/>
        </div>
      </div>

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label
            v-required
            class='align-content-center'>{{ t('document.doc.docOut.docTypeId') }}</label>
        </div>
        <div class='col-3'>
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

          <ValidateErrorMessage :errors='v$.docTypeId.$errors'/>
        </div>

        <div class='col-1 field-custom flex'>
          <label class='align-content-center'>{{ t('document.doc.docOut.deadlineDate') }}</label>
        </div>
        <div class='col-3'>
          <NamedInputCalendar
            v-model='doc.deadlineDate'
            class='w-full'
            name='outgoingDocModel.deadlineDate'
            :select-other-months='true'
            show-icon
            @blur='changeDeadlineDate'/>
          <ValidateErrorMessage :errors='v$.deadlineDate.$errors'/>
        </div>

        <div class='col-1 field-custom flex'>
          <label class='align-content-center'>{{ t('document.doc.docOut.deadlineNumber') }}</label>
        </div>
        <div class='col'>
          <NamedInputNumber
            v-model='doc.deadlineNumber'
            class='w-full'
            name='outgoingDocModel.deadlineNumber'
            @blur='changeDeadlineNumber'/>
        </div>
      </div>

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label
            class='align-content-center'>{{ t('document.doc.docOut.areaId') }}</label>
        </div>
        <div class='col-3'>
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
        </div>

        <div class='col-1 field-custom flex'>
          <span
            v-required
            class='align-content-center inline-block'>{{ t('document.doc.docOut.issuerDept') }}</span>
        </div>
        <div class='col'>
          <OrganizationTree
            v-model='doc.issuerDept'
            class='p-component w-full'
            :max-width-chip='"50rem"'
            :org-type='userDeptRole.type'
            :selection-mode="'single'"
            @change='changeOrg($event)'>
          </OrganizationTree>

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
            :value='userDeptRole.userId'/>

          <ValidateErrorMessage :errors='v$.issuerDeptId.$errors'/>
        </div>
      </div>

      <div class='flex formgrid gap-2 grid grid-nogutter justify-content-between pb-2'>
        <div class='align-content-center'>
          <label class='font-semibold'>{{ t("document.doc.docOut.receive") }}</label>
        </div>
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

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1'></div>
        <div class='col flex gap-2'>
          <DataTable
            class='border-1 surface-border w-full'
            :value='optionsTree'
            v-bind='DEFAULT_DATATABLE_CONFIG'>
            <template #empty>
              <span class='block font-bold text-600 text-center'>{{
                t("common.emptyRecords", {
                  itemType: toLower("Người/Đơn vị nhận"),
                })
              }}</span>
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
        </div>
      </div>

      <div class='formgrid grid grid-nogutter pb-2'>

        <div class='col-1 flex mr-3'><label
          class='align-content-center'>{{ t('document.doc.docOut.securityCode') }}</label></div>
        <div class='col-2'>
          <NamedDropdown
            v-model='doc.securityCode'
            class='w-full'
            name='outgoingDocModel.securityCode'
            option-label='label'
            option-value='value'
            :options='SECURITIES'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label class='align-content-center'>{{ t('document.doc.docOut.priorityCode') }}</label>
        </div>
        <div class='col-2'>
          <NamedDropdown
            v-model='doc.priorityCode'
            class='w-full'
            name='outgoingDocModel.priorityCode'
            option-label='label'
            option-value='value'
            :options='PRIORITIES'/>
        </div>

        <div class='col-1 field-custom flex pl-3'><label
          class='align-content-center'>{{ t('document.doc.docOut.numberOfCopy') }}</label></div>
        <div class='col-2'>
          <NamedInputNumber
            v-model='doc.numberOfCopy'
            class='w-full'
            name='outgoingDocModel.numberOfCopy'/>
        </div>

        <div class='col-1 field-custom flex pl-3'>
          <label class='align-content-center'>{{ t('document.doc.docOut.numberOfPage') }}</label>
        </div>
        <div class='col'>
          <NamedInputNumber
            v-model='doc.numberOfPage'
            class='w-full'
            name='outgoingDocModel.numberOfPage'/>
        </div>
      </div>

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label class='align-content-center font-semibold'>{{
            t('document.doc.docInDetail.flow')
          }}</label>

        </div>
        <div class='col flex flex-column gap-1'>
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
              name='outgoingDocModel.isTemporaryFlow'>
          </div>
          <div class='flex mt-2 w-full'>
            <SelectFlowExisted
              v-if='!doc.isTemporaryFlow'
              v-model='doc.flowId'
              :disable-flow='doc.isProcessing'
              :options='flows'/>
          </div>
          <DocOutFlowDefine
            v-if='doc.isTemporaryFlow'
            v-model:edges='edges'
            v-model:nodes='nodes'
            :disable-flow='doc.isProcessing'
            :flow-id='doc.flowId'
            :is-temporary-flow='originIsTempFlow||false'/>
          <input
            v-model='doc.flowId'
            hidden
            name='outgoingDocModel.flowId'>
        </div>
      </div>

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label class='align-content-center'>{{ t('document.doc.docOut.advice') }}</label>
        </div>
        <div class='col flex'>
          <Textarea
            v-model='doc.advice'
            v-trim
            class='w-full'
            name='outgoingDocModel.advice'
            rows='2'/>
        </div>
      </div>

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1 flex'>
          <label>{{ t('document.doc.docOut.isReply') }}</label>
        </div>
        <div class='col-3 flex'>
          <Checkbox
            v-model='doc.isReply'
            :binary='true'
            input-id='ingredient1'
            name='outgoingDocModel.isReply'/>
        </div>

        <div class='col-3 flex gap-2'>
          <div class='inline-block w-auto'>
            <label class='align-content-center'>{{ t('document.doc.docOut.isLawDocument') }}</label>
          </div>

          <Checkbox
            v-model='doc.isLawDocument'
            :binary='true'
            input-id='ingredient1'
            name='outgoingDocModel.isLawDocument'/>
        </div>

        <div class='col'>

        </div>
      </div>

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1 font-semibold'>{{ t('document.doc.docOut.listFileDelete') }}</div>
        <div class='col'>
          <UploadFilesGridWithRadio
            v-model:files-deleted='listFileDelete'
            v-model:list-file='attachments'
            :can-edit='true'
            :doc-type='DocTypeEnum.VB_DI'
            :file-attachments-name="'attachmentModel'"
            :header="'Văn bản dự thảo - Ký số ban hành'"/>
          <input
            hidden
            name='listFileToDelete'
            :value='listFileDelete'/>
          <ValidateErrorMessage :errors='v$.attachments.$errors'/>
        </div>
      </div>

      <div class='formgrid gap-3 grid grid-nogutter pb-2'>
        <div class='col-1'></div>
        <div class='col'>
          <UploadFilesForDocOut
            v-model:file-type-upload-name='fileTypeUploadName'
            v-model:file-upload-from-ecm='filesUploadFromEcm'
            v-model:file-upload-from-system='filesUploadFromSystem'
            v-model:files-deleted='listFileRelatedDelete'
            v-model:list-file='relatedDocuments'
            :can-edit='true'
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
    </form>

    <div class='bottom-0 fixed flex gap-2 justify-content-center pb-5 w-full'>
      <div>
        <Button
          icon='pi pi-times'
          :label='t("Quay lại")'
          severity='danger'
          @click='router.back()'/>
      </div>

      <div>
        <Button
          icon='pi pi-save'
          :label='t("Lưu và đóng lại")'
          @click='saveDoc'/>
      </div>

      <!--      <div>-->
      <!--        <Button-->
      <!--          icon='pi pi-save'-->
      <!--          :label='t("Lưu và thêm mới")'/>-->
      <!--      </div>-->
      <OutNextButtonsInForm
        v-if='!doc.isTemporaryFlow'
        :disabled='disabledNext'
        :doc='doc as unknown as DocOut'
        :flow-id='doc?.flowId'/>
      <OutTempFlowButtons
        v-else
        :disabled='disabledNext'
        :edges='edges as EdgeInputInterface[]'
        :nodes='nodes as NodeInputInterface[]'>
      </OutTempFlowButtons>
    </div>
    <UserOrganizationDialog
      v-if='visibleDialogTree'
      :user-dept='optionsTree'
      :visible='visibleDialogTree'
      @hide-dialog='hideDialogUserOrganization'/>
  </div>

</template>

<script lang='ts' setup>

import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { pick, toLower } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import DataTable from 'primevue/datatable';
import { computed, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { findByObjectId } from '@/apps/document/api/graphql/attachment';
import { findDocOutByIdGraph } from '@/apps/document/api/graphql/doc-out';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { saveDocumentTempConfig } from '@/apps/document/api/graphql/document-flow';
import { getAllField } from '@/apps/document/api/graphql/field';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import { getAllReceivingMethod } from '@/apps/document/api/graphql/receiving-method';
import { getNumberDay } from '@/apps/document/api/graphql/rest-day';
import { findDocById } from '@/apps/document/api/rest/docIn';
import { saveDocOut } from '@/apps/document/api/rest/docOut';
import { AttachType, type DocumentAttachment } from '@/apps/document/model/attachment';
import { PRIORITIES, SECURITIES } from '@/apps/document/model/doc/doc-in';
import { type DocOut, type DocOutInput, OutgoingDocStatus } from '@/apps/document/model/doc/doc-out';
import { DocTypeEnum } from '@/apps/document/model/docInBook';
import type { DocTypeInterface } from '@/apps/document/model/docType';
import { DOC_OUT_FLOW_TYPE } from '@/apps/document/model/flow';
import { OrganizationType } from '@/apps/document/model/organization';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { ReceiveObjectType } from '@/apps/document/model/outgoingDocReceivers';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocOutFlowDefine from '@/apps/document/views/doc/doc-out/component/flow/DocOutFlowDefine.vue';
import SelectFlowExisted from '@/apps/document/views/doc/doc-out/component/flow/SelectFlowExisted.vue';
import OutNextButtonsInForm
  from '@/apps/document/views/doc/doc-out/component/next-buttons-infom/OutNextButtonsInForm.vue';
import OutTempFlowButtons from '@/apps/document/views/doc/doc-out/component/temp-flow-buttons/OutTempFlowButtons.vue';
import UserOrganizationDialog from '@/apps/document/views/doc/UserOrganizationDialog.vue';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import { findByOrgTypeAndOrgIdsContainingAndType, } from '@/apps/work-flow/api/graphql/flow-api';
import {
  type EdgeInputInterface,
  type FlowInterface,
  type NodeInputInterface,
  NodeType
} from '@/apps/work-flow/model/flow';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedInputNumber from '@/common/components/custom/NamedInputNumber.vue';
import UploadFilesForDocOut from '@/common/components/custom/UploadFilesForDocOut.vue';
import UploadFilesGridWithRadio from '@/common/components/custom/UploadFilesGridWithRadio.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';
import { TypeOfTake } from '@/common/model/attachment';
import router from '@/common/router';

const fileTypeUploadName = ref<string[]>([]);
const users = ref([] as UserMoreInfo[]);
const userIds = ref([] as string[]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const visibleDialogTree = ref(false);
const attachments = ref([] as DocumentAttachment[]);
const relatedDocuments = ref([] as DocumentAttachment[]);

const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const fields = ref([]);
const flows = ref<FlowInterface[]>([]);
const methodRecieves = ref([]);
const docTypes = ref([] as DocTypeInterface[]);
const form = ref<HTMLFormElement>();
const optionsTree = ref<{ label: string, value: any }[]>([]);
const listFileDelete = ref();
const listFileRelatedDelete = ref();
const filesUploadFromSystem = ref();
const orgs = ref<{ label: string, value: string }[]>([]);
const { t } = useI18n();
const route = useRoute();
const { id } = route.params;
const { incomingDocId } = route.query;
const filesUploadFromEcm = ref();
const filePathAttachmentOfDocIn = ref();
const quote = computed(() => {
  const quoteText = doc.value?.incomingDoc?.quote;
  return quoteText && quoteText.length > 30 ? doc.value?.incomingDoc?.quote?.substring(0, 30) + '...' : doc.value?.incomingDoc?.quote;
});
const doc = ref({
  securityCode: SECURITIES[0].value,
  priorityCode: PRIORITIES[0].value,
  incomingDocId: incomingDocId,
  numberOfPage: 1,
  numberOfCopy: 1,
  isTemporaryFlow: false,
} as DocOutInput);

if (incomingDocId) {
  findDocById(userDeptRole.value, incomingDocId.toString()).then((res: any) => {
    doc.value.incomingDoc = res;
  });

  const { onResult: getAttachmentResult } = findByObjectId(incomingDocId.toString());

  getAttachmentResult((res) => {
    filePathAttachmentOfDocIn.value = res.data.findByObjectId.find((a: DocumentAttachment) => a.attachType == AttachType.FILE_CHINH);
  });
}
const originIsTempFlow = ref<boolean>();
if (id) {
  findDocOutByIdGraph(userDeptRole.value, id.toString()).onResult((res) => {
    doc.value = res.data.findByDocOutById;
    doc.value = {
      ...doc.value,
      deadlineDate: doc.value.deadlineDate ? new Date(doc.value.deadlineDate) : null,
      issuerDept: [doc.value.issuerDeptId]
    };
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

    originIsTempFlow.value = doc.value.isTemporaryFlow;
  });
}

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

getAllUserMoreInfoGraphql().onResult(res => {
  users.value = res.data.getAllUserMoreInfo;
  userIds.value = users.value.map((u) => u.id);
});

const {
  currentOrgId,
  type
} = storeToRefs(useDocumentRolesStore());
const classNameDocOut = DOC_OUT_FLOW_TYPE;
const {
  onResult: getFlowResult,
  refetch: getFlowRefetch,
  load: getFlowLoad,
} = findByOrgTypeAndOrgIdsContainingAndType(type.value, currentOrgId.value, classNameDocOut);

getFlowResult((res) => {
  flows.value = res.data.findByOrgTypeAndOrgIdsContainingAndType;
});

getFlowLoad(undefined, {
  orgType: type.value,
  orgIds: currentOrgId.value,
  type: classNameDocOut
}) || getFlowRefetch();

const selectedUser = ref<any>();
// const selectedUser = ref<({ id: string, orgOutName: string })[]>([]);
const { onResult: getOrgResult } = getOrgOut();
const { onResult: getFieldResult } = getAllField();
const { onResult: getMethodResult } = getAllReceivingMethod();
const { onResult: getDocTypeResult } = getAllDocType();
const isLoading = ref(false);
const { load: getNumberDayLoad, onResult: getNumberOnResult } = getNumberDay();
const isUpdating = ref(false);
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
  const today = new Date();
  return !(doc.value.deadlineDate && doc.value.deadlineDate < new Date(today.getFullYear(), today.getMonth(), today.getDate()));
};

const validateRules = {
  deadlineDate: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.deadlineDateNotNull'),
      validateDeadlineDate,
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
  issuerDeptId: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.issuerDeptIdNotNull'),
      required,
    ),
  },
  attachments: {
    required: helpers.withMessage(
      t('document.doc.docOut.validate.attachmentsNotNull'),
      validateAttachment,
    ),
  },
};

const v$ = useVuelidate(validateRules, doc, { $scope: false });

getNumberOnResult((res) => {
  doc.value.deadlineNumber = res.data.getNumberDay;
});

getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;
});
getFlowResult((res) => {
  flows.value = res.data.findFlowByOrganizationIds;
});
getMethodResult((res) => {
  methodRecieves.value = res.data.getAllReceivingMethod;
});
getFieldResult((res) => {
  fields.value = res.data.getAllField;
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

function changeOrg(event: any) {
  doc.value.issuerDeptId = Object.keys(event)[0];
  const org = orgs.value.find(o => o.value == doc.value.issuerDeptId);
  doc.value.issuerDeptName = org ? org.label : '';
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

function viewFileMain() {
  const extension = filePathAttachmentOfDocIn.value.fileExtension;
  if (extension && EDITABLE_FILE_TYPES.includes(extension)) {
    window.open(generatePreviewFileUrl(filePathAttachmentOfDocIn.value?.filePath?.replace('/main/', '/preview/')
      .replace(`.${extension}`, '.pdf') || ''), '_blank');
  }
}

function saveDoc() {
  if (doc.value.isTemporaryFlow) {
    v$.value.$validate().then((isValid) => {
      if (isValid) {
        saveTempFlowPromise()
          .then((res) => {
            saveDocPromise()
              .then(() => router.back());
          });
      }
    });
  } else {
    saveDocPromise()
      .then(() => router.back());
  }
}

function changeDocType(event: any) {
  let docType = docTypes.value.find((dt: DocTypeInterface) => dt.id == event.value);
  doc.value.docTypeName = docType ? docType?.name : '';
}

function changeArea(id: string) {
  const field: any = fields.value.find((f: any) => f.id == id);
  doc.value.areaName = field ? field.name : '';
}

function openDialogTree() {
  visibleDialogTree.value = true;
}

function clearDialogTree() {
  optionsTree.value = [];
  selectedUser.value = [];
}

function saveDocPromise() {
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
        saveDocOut(formData)
          .then((value) => {
            toastSuccess({ message: t('Lưu thành công.') });
            isLoading.value = false;
            resolve(value);
          })
          .catch((err) => {
            toastError({ message: t(`document.doc.error.${err.code}`) });
            isLoading.value = false;
            reject(err);
          });
      } else {
        reject('form not validate');
      }
    }
    );
  });
}

watch(optionsTree, (value: any) => {
  // selectedUser.value = value.map((userOrg: any) => {
  //   if (userOrg.value.objectType == ReceiveObjectType.DON_VI_NGOAI) {
  //     return {
  //       'id': userOrg.value.objectId,
  //       'orgOutName': userOrg.value.objectName
  //     };
  //   } else if (userOrg.value.objectType == ReceiveObjectType.DON_VI_NOI_BO) {
  //     return {
  //       'deptId': userOrg.value.objectId,
  //       'deptName': userOrg.value.objectName,
  //       'id': `org_${userOrg.value.objectId}`
  //     };
  //   } else if (userOrg.value.objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG) {
  //     return {
  //       'userId': userOrg.value.objectId,
  //       'userName': userOrg.value.objectName,
  //       'deptId': userOrg.value.deptId,
  //       'deptName': userOrg.value.deptName,
  //       'roleId': userOrg.value.roleId,
  //       'roleName': userOrg.value.roleName,
  //       'id': `${userOrg.value.objectId}_${userOrg.value.roleId}`
  //     };
  //   }
  // });
});

provide('saveDocPromise', saveDocPromise);
provide('saveTempFlowPromise', saveTempFlowPromise);
const disabledNext = computed<boolean>(() => {
  return v$.value.$invalid;
});
provide('afterAction', () => router.back());
provide('doc', doc);
provide('hideButtonsName', ['REJECT']);

//Temp flow
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

    const nodesData = nodes.value.map((n, index) => {
      //Change the before last
      if (beforeLastNodeIds.includes(n.id)) {
        const newN = pick(n, ['id', 'data', 'position', 'dimensions', 'handleBounds', 'type']) as NodeInputInterface;
        newN.data =
            {
              ...newN.data,
              status: OutgoingDocStatus.CHO_BAN_HANH
            };
        return newN;
      }
      return pick(n, ['id', 'data', 'position', 'dimensions', 'handleBounds', 'type']);
    });
    const edgesData = edges.value.map(e => pick(e, ['id', 'source', 'target', 'data', 'sourceX', 'targetX', 'sourceY', 'targetY', 'targetHandle', 'sourceHandle']));
    saveTempFlowMutate({
      config: {
        nodes: nodesData,
        edges: edgesData,
        type: DOC_OUT_FLOW_TYPE,
        orgType: userDeptRole.value.type,
        orgIds: [userDeptRole.value.deptId]
      }
    }).then((res) => {
      const data = res?.data?.saveDocumentTempConfig as FlowInterface;
      doc.value.flowId = data.id;
      return resolve(data);
    }).catch((error) => {
      return reject(error);
    });
  });
}

// watch(() => doc.value.deadlineNumber, (value) => {
//   if (isUpdating.value == false && value != null) {
//     isUpdating.value = true;
//     if (!doc.value.deadlineDate) {
//       doc.value.deadlineDate = new Date;
//     } else {
//       doc.value.deadlineDate = addDays(doc.value.deadlineDate, 1);
//     }
//     isUpdating.value = false;
//   }
// });

// watch(() => doc.value.deadlineDate, (value) => {
//   if (isUpdating.value == false) {
//     isUpdating.value = true;
//     if (value) {
//       const fromDate = moment(new Date).format('YYYY-MM-DD');
//       const toDate = moment(value).format('YYYY-MM-DD');s
//       if (fromDate > toDate) {
//         doc.value.deadlineNumber = undefined;
//       } else {
//         getNumberDayLoad(undefined, {
//           dateA: fromDate,
//           dateB: toDate
//         });
//       }
//     } else {
//       doc.value.deadlineNumber = undefined;
//     }
//     isUpdating.value = false;
//   }
// });

function changeDeadlineNumber() {
  if (isUpdating.value == false && doc.value.deadlineNumber != null) {
    isUpdating.value = true;
    if (!doc.value.deadlineDate) {
      doc.value.deadlineDate = new Date;
    } else {
      doc.value.deadlineDate = addDays(new Date, doc.value.deadlineNumber);
    }
    isUpdating.value = false;
  }
}

function changeDeadlineDate() {
  if (isUpdating.value == false) {
    isUpdating.value = true;
    if (doc.value.deadlineDate) {
      const fromDate = moment(new Date).format('YYYY-MM-DD');
      const toDate = moment(doc.value.deadlineDate).format('YYYY-MM-DD');
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
    isUpdating.value = false;
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function mapReceiveObjectTypeName(objectType: ReceiveObjectType) {
  if (objectType == ReceiveObjectType.DON_VI_NOI_BO) {
    return 'Đơn vị nội bộ';
  } else if (objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG) {
    return 'Người nhận trong hệ thống';
  } else if (objectType == ReceiveObjectType.DON_VI_NGOAI) {
    return 'Đơn vị ngoài';
  }
}

function deleteReceive(receive: any) {
  optionsTree.value = optionsTree.value.filter((data) => data.value != receive);
}
</script>

<script lang='ts'>
export default { name: 'FormDocumentOut' };
</script>

<style scoped>
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
</style>