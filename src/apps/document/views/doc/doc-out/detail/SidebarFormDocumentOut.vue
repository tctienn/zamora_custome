<template>
  <Sidebar
    v-model:visible='visible'
    position='right'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :style='{width: "80%"}'
    @hide="emits('hide-dialog')">

    <div
      class='flex flex-column gap-4 overflow-auto pb-8'
      style='height: calc(100vh - 10rem)'>
      <h5 class='m-0 p-0'>Thông tin dự thảo</h5>
      <form
        ref='form'
        @submit.prevent='saveDoc'>
        <div class='formgrid gap-3 grid grid-nogutter pb-2'>
          <div class='col-1 flex'>
            <label>Đơn vị dự thảo</label>
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
          </div>

          <div class='col-1 flex'>
            <label>Người soạn thảo</label>
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
        </div>

        <div class='formgrid gap-3 grid grid-nogutter pb-2'>
          <div class='col-1 flex'>
            <label
              class='font-semibold'>Trích yếu <span
              style='color:red'>*</span>
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
              class='align-content-center'>Loại văn bản <i style='color:red'>*</i></label>
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

          <div class='col-1 flex'>
            <label class='align-content-center'>Hạn xử lý</label>
          </div>
          <div class='col-3'>
            <NamedInputCalendar
              v-model='doc.deadlineDate'
              class='w-full'
              name='outgoingDocModel.deadlineDate'
              :select-other-months='true'
              show-icon/>
          </div>

          <div class='col-1 flex'>
            <label class='align-content-center'>Số ngày</label>
          </div>
          <div class='col'>
            <NamedInputNumber
              v-model='doc.deadlineNumber'
              class='w-full'
              name='outgoingDocModel.deadlineNumber'/>
          </div>
        </div>

        <div class='formgrid gap-3 grid grid-nogutter pb-2'>
          <div class='col-1 flex'>
            <label
              class='align-content-center'>Lĩnh vực</label>
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

          <div class='col-1 flex'>
            <span class='align-content-center inline-block'>Đơn vị ban hành <span style='color:red'>*</span></span>
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
            class='align-content-center'>Độ mật</label></div>
          <div class='col-2'>
            <NamedDropdown
              v-model='doc.securityCode'
              class='w-full'
              name='outgoingDocModel.securityCode'
              option-label='label'
              option-value='value'
              :options='SECURITIES'/>
          </div>

          <div class='col-1 flex pl-3'>
            <label class='align-content-center'>Độ khẩn</label>
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

          <div class='col-1 flex pl-3'><label class='align-content-center'>Số bản</label></div>
          <div class='col-2'>
            <NamedInputNumber
              v-model='doc.numberOfCopy'
              class='w-full'
              name='outgoingDocModel.numberOfCopy'/>
          </div>

        </div>

        <div class='formgrid gap-3 grid grid-nogutter pb-2'>
          <div class='col-1 flex'>
            <label class='align-content-center'>Ý kiến/Đề xuất</label>
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
          <div class='align-content-center flex gap-6 pt-2'>
            <label>Là văn bản trả lời</label>
            <Checkbox
              v-model='doc.isReply'
              :binary='true'
              input-id='ingredient1'
              name='outgoingDocModel.isReply'/>
          </div>

          <div
            class='col flex gap-6'
            style='padding-left: 12vw'>
            <div class='align-content-center flex gap-6 pt-2'>
              <label>Văn bản quy phạm pháp luật</label>

              <Checkbox
                v-model='doc.isLawDocument'
                :binary='true'
                input-id='ingredient1'
                name='outgoingDocModel.isLawDocument'/>
            </div>
          </div>

          <div class='col-1 flex pl-3'><label class='align-content-center'>Số trang</label></div>
          <div class='col'>
            <NamedInputNumber
              v-model='doc.numberOfPage'
              class='w-full'
              name='outgoingDocModel.numberOfPage'/>
          </div>
        </div>

        <div class='formgrid gap-3 grid grid-nogutter pb-2'>
          <div class='col-1 font-semibold'>Hồ sơ tài liệu đính kèm</div>
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
            @click='emits("hide-dialog")'/>
        </div>

        <div>
          <Button
            icon='pi pi-save'
            :label='t("Lưu và đóng lại")'
            @click='saveDoc'/>
        </div>
      </div>
      <!--      <Dialog-->
      <!--        v-if='visibleDialogTree'-->
      <!--        v-model:visible='visibleDialogTree'-->
      <!--        class='h-full'-->
      <!--        :header='"Chọn người dùng"'-->
      <!--        v-bind='DEFAULT_DIALOG_CONFIG'-->
      <!--        @hide='visibleDialogTree = false'>-->
      <!--        <TabView>-->
      <!--          <TabPanel header='Đơn vị nội bộ'>-->
      <!--            <div class='flex h-full'>-->
      <!--              <div class='h-full w-full'>-->
      <!--                <UserSelectMoreDetail-->
      <!--                  v-model='selectedUser'-->
      <!--                  class='w-full'-->
      <!--                  display-mode='tree'-->
      <!--                  :org-type='type!!'-->
      <!--                  :remove-empty-dep='false'-->
      <!--                  selection-mode='multiple'-->
      <!--                  style='height: 70vh'-->
      <!--                  :users='users'/>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </TabPanel>-->
      <!--          <TabPanel-->
      <!--            header='Đơn vị ngoài'-->
      <!--            style='height: 60vh'>-->
      <!--            <Listbox-->
      <!--              v-model='selectedUser'-->
      <!--              class='w-full'-->
      <!--              multiple-->
      <!--              option-label='label'-->
      <!--              option-value='value'-->
      <!--              :options='orgOuts'-->
      <!--              style='height: 62vh'>-->
      <!--              <template #option='{option}'>-->
      <!--                <div class='align-items-center flex gap-2'>-->
      <!--                  <Checkbox-->
      <!--                    binary-->
      <!--                    :model-value='selectedUser?.some((u: any)=> u.id === option.value?.id)'/>-->
      <!--                  {{ option.label }}-->
      <!--                </div>-->
      <!--              </template>-->
      <!--            </Listbox>-->

      <!--          </TabPanel>-->
      <!--        </TabView>-->
      <!--        <template #footer>-->
      <!--          <div class='flex flex-row gap-2 justify-content-center py-1'>-->
      <!--            <Button-->
      <!--              icon='pi pi-times'-->
      <!--              :label="t('common.close')"-->
      <!--              severity='danger'-->
      <!--              @click='emits("hide-dialog")'/>-->
      <!--            <Button-->
      <!--              icon='pi pi-check'-->
      <!--              :label="t('common.save')"-->
      <!--              @click='saveOptions'/>-->
      <!--          </div>-->
      <!--        </template>-->
      <!--      </Dialog>-->
    </div>
  </Sidebar>

  <UserOrganizationDialog
    v-if='visibleDialogTree'
    :user-dept='optionsTree'
    :visible='visibleDialogTree'
    @hide-dialog='hideDialogUserOrganization'/>
</template>

<script setup lang="ts">

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import DataTable from 'primevue/datatable';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { findDocOutByIdGraph } from '@/apps/document/api/graphql/doc-out';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getAllField } from '@/apps/document/api/graphql/field';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import { getAllReceivingMethod } from '@/apps/document/api/graphql/receiving-method';
import { saveDocOut } from '@/apps/document/api/rest/docOut';
import { AttachType, type DocumentAttachment } from '@/apps/document/model/attachment';
import { PRIORITIES, SECURITIES } from '@/apps/document/model/doc/doc-in';
import type { DocOutInput } from '@/apps/document/model/doc/doc-out';
import { DocTypeEnum } from '@/apps/document/model/docInBook';
import type { DocTypeInterface } from '@/apps/document/model/docType';
import { OrganizationType } from '@/apps/document/model/organization';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { type OutgoingDocReceivers, ReceiveObjectType } from '@/apps/document/model/outgoingDocReceivers';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import UserOrganizationDialog from '@/apps/document/views/doc/UserOrganizationDialog.vue';
import OrganizationTree from '@/apps/work-flow/views/components/OrganizationTree/OrganizationTree.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedInputNumber from '@/common/components/custom/NamedInputNumber.vue';
import UploadFilesForDocOut from '@/common/components/custom/UploadFilesForDocOut.vue';
import UploadFilesGridWithRadio from '@/common/components/custom/UploadFilesGridWithRadio.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { TypeOfTake } from '@/common/model/attachment';

const props = defineProps({
  visibleSidebar: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: null
  }
});

const emits = defineEmits(['hide-dialog']);

const fileTypeUploadName = ref<string[]>([]);
const users = ref([] as UserMoreInfo[]);
const userIds = ref([] as string[]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const visibleDialogTree = ref(false);
const attachments = ref([] as DocumentAttachment[]);
const relatedDocuments = ref([] as DocumentAttachment[]);

const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const fields = ref([]);
const methodRecieves = ref([]);
const docTypes = ref([] as DocTypeInterface[]);
const form = ref<HTMLFormElement>();
const optionsTree = ref<{ label: string, value: any }[]>([]);
const listFileDelete = ref();
const listFileRelatedDelete = ref();
const filesUploadFromSystem = ref();
const orgs = ref<{ label: string, value: string }[]>([]);
const { t } = useI18n();
const visible = ref(props.visibleSidebar);
const doc = ref({
  securityCode: SECURITIES[0].value,
  priorityCode: PRIORITIES[0].value,
  numberOfPage: 1,
  numberOfCopy: 1
} as DocOutInput);

if (props.id) {
  findDocOutByIdGraph(userDeptRole.value, props.id.toString()).onResult((res) => {
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

const { type } = storeToRefs(useDocumentRolesStore());

const selectedUser = ref<any>();
const { onResult: getOrgResult } = getOrgOut();
const { onResult: getFieldResult } = getAllField();
const { onResult: getMethodResult } = getAllReceivingMethod();
const { onResult: getDocTypeResult } = getAllDocType();
const isLoading = ref(false);

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

const validateRules = {
  quote: {
    required: helpers.withMessage(
      t('Trích yếu không được để trống.'),
      required,
    ),
  },
  docTypeId: {
    required: helpers.withMessage(
      t('Loại văn bản không được để trống.'),
      required,
    ),
  },
  issuerDeptId: {
    required: helpers.withMessage(
      t('Đơn vị phát hành không được để trống.'),
      required,
    ),
  },
  attachments: {
    required: helpers.withMessage(
      t('Văn bản dự thảo - Ký số ban hành phải có file chính.'),
      validateAttachment,
    ),
  },
};

const v$ = useVuelidate(validateRules, doc, { $scope: false });

getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;
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

function saveDoc() {
  saveDocPromise();
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

function saveOptions() {
  optionsTree.value = selectedUser.value.map((x: any, index: number) => {
    const findUserOrg = optionsTree.value.find(userOrg => userOrg.label == (x.userName ? `${x.userName}-${x.roleName}`
      : x.orgOutName ? x.orgOutName : x.deptName ? x.deptName : ''));
    return {
      label: x.userName ? `${x.userName}-${x.roleName}` : x.orgOutName ? x.orgOutName : x.deptName ? x.deptName : '',
      value: {
        id: findUserOrg ? findUserOrg.value.id : null,
        objectId: x.userName ? x.userId : x.deptName
          ? x.deptId : x.orgOutName ? x.id : '',
        objectName: x.userName || x.deptName || x.orgOutName || '',
        orderNo: index + 1,
        objectType: x.userName ? ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG : x.deptName
          ? ReceiveObjectType.DON_VI_NOI_BO : x.orgOutName ? ReceiveObjectType.DON_VI_NGOAI : '',
        roleId: x.roleId ?? null,
        roleName: x.roleName ?? null,
        deptId: x.deptId ?? null,
        deptName: x.deptName ?? null
      } as OutgoingDocReceivers
    };
  });
  visibleDialogTree.value = false;
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
        // formData.append('outgoingDocModel.isPresenting', 'true');
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
            emits('hide-dialog', value);
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

function deleteReceive(receive: any) {
  optionsTree.value = optionsTree.value.filter((data) => data.value != receive);
}
</script>

<script lang="ts">
export default { name: 'SidebarFormDocumentOut' };
</script>

<style scoped>
.action-wrapper .btnAction {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.p-datatable tbody tr:hover .action-wrapper .btnAction {
  opacity: 1;
}
</style>