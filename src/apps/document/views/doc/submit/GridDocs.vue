<template>
  <div class='formgrid gap-3 grid grid-nogutter py-0'>
    <div class='col-2 flex w-auto'>
      <label
        v-required
        class='align-content-end font-semibold'>Tờ trình đính kèm - Không ban hành</label>
    </div>
    <div
      v-if='docType == TypeOfPresentation.TRINH_VA_BAN_HANH_VAN_BAN'
      class='col flex justify-content-between'>
      <label class='align-content-end font-semibold'>
        <!--        Dự thảo văn bản - Ban hành<i style='color:red'> *</i>-->
      </label>
      <div class='flex gap-1'>
        <ButtonIcon
          v-if='!isView'
          icon='note_add'
          :label="t('Thêm mới dự thảo văn bản')"
          size='small'
          style='width: auto'
          @click='visibleFormDocOut = true'/>
        <ButtonIcon
          v-if='!isView'
          icon='sell'
          :label="t('Chọn trong hệ thống')"
          size='small'
          style='width: auto'
          @click='visibleChooseDocInSystem = true'/>
      </div>
    </div>
  </div>
  <div class='formgrid gap-3 grid grid-nogutter py-2'>
    <div
      class='col-2 file-present flex flex-column hover:surface-hover justify-content-center'>
      <div class='flex justify-content-center'>
        <div class='custom-file-upload'>
          <ButtonIcon
            v-if='!isExistPresentation'
            v-tooltip.right="'Tải tệp lên'"
            class='ml-2'
            icon='upload'
            size='10'
            @click='addPresentation'></ButtonIcon>

          <input
            ref='presentation'
            hidden
            :name='props.name'
            type='file'
            @change='changePresentation'>
          <div
            v-if='isExistPresentation'
            class='flex justify-content-center'>
            <img
              alt=''
              class='file-extension-icon flex h-5rem pt-2 w-5rem'
              draggable='false'
              :src='getFileIcon((viewPresentation?.fullName ?? viewPresentation?.name)?.split(".")
                [(viewPresentation?.fullName ?? viewPresentation?.name)?.split(".").length - 1])'
              @error='handleFileImageError'/>
          </div>
          <div
            v-if='isExistPresentation'
            class='flex justify-content-center pl-2 py-1 word-break-break-word'>
            {{ viewPresentation?.fullName ?? viewPresentation?.name }}
          </div>
          <div
            v-if='isExistPresentation'
            class='flex justify-content-center pb-2'>{{
              viewPresentation?.size ? convertFileSize(viewPresentation?.size) : ''
            }}
          </div>

        </div>
        <input
          v-model='filePresentationDelete'
          hidden
          name='filePresentationDelete'>
        <div>
          <div
            v-if='isExistPresentation'
            class='btn-file-presentation flex flex-column pl-3'>
            <Button
              v-if='!isView'
              class='border-none'
              :outlined='true'
              @click='deleteViewPresentation'>
              <AppIcon
                v-tooltip.top="'Xóa'"
                class='ml-2'
                name='delete'
                size='1.5'
                text></AppIcon>
            </Button>

            <Button
              class='border-none'
              :outlined='true'>
              <AppIcon
                v-if='props.docId'
                v-tooltip.top="'Xem'"
                class='ml-2'
                name='visibility'
                size='1.5'
                text
                @click="viewDetail(viewPresentation.filePath || '', viewPresentation.fileExtension)"></AppIcon>
            </Button>
          </div>
        </div>
      </div>
      <div
        v-if='userDeptRole.roleId == RoleType.LANH_DAO && isExistPresentation'
        :class='`flex gap-1 justify-content-center`'>
        <div class='flex'>
          <div
            v-if='currNodeInj?.data?.optionActions?.some(action => action.name == "SIGN_CA")'
            class='w-5rem'>
            <ButtonIcon
              v-if='!viewPresentation.isCaSign'
              v-tooltip.top='"Chờ ký số"'
              icon='stylus_note'
              @click='prepareSignCa(viewPresentation, ObjectTypeEnum.PHIEU_TRINH, props.docId!!)'/>
            <div
              v-else
              class='flex gap-1'>
              <AppIcon
                name='check'
                size='1.7'/>
              <p style='color: #94C748'>Đã ký số</p>
            </div>
          </div>

          <div
            v-if='currNodeInj?.data?.optionActions?.some(action => action.name == "SIGN_APPROVE")'
            class='w-5rem'>
            <ButtonIcon
              v-if='!viewPresentation.isDigitalSign'
              v-tooltip.top='"Chờ ký điện tử"'
              icon='edit_document'
              @click='digitalSignFilePresent(viewPresentation, true)'/>

            <div
              v-else
              class='flex gap-1'>
              <AppIcon
                name='check'
                size='1.7'/>
              <p style='color: #94C748'>Đã ký điện tử</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class='col'>
      <DataTable
        v-if='docType == TypeOfPresentation.TRINH_VA_BAN_HANH_VAN_BAN'
        class='h-full overflow-auto'
        :row-class="() =>'file-row'"
        table-class='surface-border border-left-1 border-right-1 border-top-1'
        :value='docOuts'
        v-bind='DEFAULT_DATATABLE_CONFIG'>
        <template #empty>
          <span class='block font-bold text-600 text-center'>{{
            t("common.emptyRecords", {
              itemType: toLower(t("văn bản")),
            })
          }}</span>
        </template>

        <Column
          class='text-center'
          header='STT'>
          <template #body='slotProps'>
            {{ slotProps.index + 1 }}
          </template>
        </Column>

        <Column
          class='text-center'
          :header="t('Trích yếu ')"
          style='width:40rem'>
          <template #body='{data: {quote}}'>
            {{ quote }}
          </template>
        </Column>

        <Column
          :header="t('Tên tệp đính kèm')"
          style='width:20rem'>
          <template #body='{ data: { attachmentOfOutGoingDoc, fileMain, outGoingAttachments } }'>
            <div v-if='outGoingAttachments'>
              <div
                v-for='attachment in outGoingAttachments'
                :key='attachment.id'>
                <div
                  v-if='attachment.attachType == AttachType.FILE_CHINH'
                  class='flex gap-2 word-break-break-word'>
                  <img
                    v-if='outGoingAttachments'
                    :alt='attachment?.fullName'
                    class='file-extension-icon h-2rem w-2rem'
                    draggable='false'
                    :src='getFileIcon(attachment?.fullName.split(".")[attachment?.fullName.split(".").length - 1])'/>
                  <div class='align-content-center'>
                    {{ attachment?.fullName + ' (' + convertFileSize(attachment?.size) + ')' }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if='attachmentOfOutGoingDoc'>
              <div
                v-for='attachment in attachmentOfOutGoingDoc'
                :key='attachment.id'>
                <div
                  v-if='attachment.attachType == AttachType.FILE_CHINH'
                  class='word-break-break-word'>
                  <img
                    v-if='attachmentOfOutGoingDoc'
                    :alt='attachment?.fullName'
                    class='file-extension-icon h-2rem w-2rem'
                    draggable='false'
                    :src='getFileIcon(attachment?.fullName.split(".")[attachment?.fullName.split(".").length - 1])'/>
                  {{ attachment?.fullName + ' (' + convertFileSize(attachment?.size) + ')' }}
                </div>
              </div>
            </div>

            <div v-if="typeof fileMain != 'undefined'">
              <div class='word-break-break-word'>
                <img
                  v-if='typeof fileMain != "undefined" '
                  :alt='fileMain?.fullName '
                  class='file-extension-icon h-2rem w-2rem'
                  draggable='false'
                  :src='getFileIcon(fileMain?.fullName.split(".")[fileMain?.fullName.split(".").length - 1])'/>
                {{ fileMain?.fullName + ' (' + convertFileSize(fileMain?.size) + ')' }}
              </div>
            </div>
          </template>
        </Column>

        <Column
          :header="t('common.action')">
          <template #body='{ data: {attachmentOfOutGoingDoc, id, fileMain, outGoingAttachments } }'>
            <div class='flex justify-content-center'>
              <div v-if='outGoingAttachments'>
                <div
                  v-for='attachment in outGoingAttachments'
                  :key='attachment.id'>
                  <div
                    v-if='attachment.attachType == AttachType.FILE_CHINH'
                    class='flex'>
                    <ButtonIcon
                      v-if='!isView'
                      v-tooltip.left='"Chỉnh sửa"'
                      class='btnAction'
                      icon='edit_square'
                      icon-size='1.5'
                      rounded
                      text
                      @click='visibleSidebarEdit(id)'/>

                    <ButtonIcon
                      v-if='!isView'
                      v-tooltip.left='"Xóa"'
                      class='btnAction'
                      icon='delete'
                      icon-size='1.5'
                      rounded
                      text
                      @click='deleteDoc(id)'/>

                    <ButtonIcon
                      v-if='isView'
                      v-tooltip.left='"Tải xuống"'
                      class='btnAction'
                      icon='download'
                      rounded
                      text
                      @click='downloadAttachment(attachment?.id)'/>
                    <ButtonIcon
                      v-if='isView'
                      v-tooltip.left='"Xem"'
                      class='btnAction'
                      icon='visibility'
                      icon-size='1.5'
                      rounded
                      text
                      @click='viewDetail(attachment?.filePath, attachment?.fileExtension)'/>
                  </div>
                </div>
              </div>

              <div v-else-if='attachmentOfOutGoingDoc'>
                <div
                  v-for='attachment in attachmentOfOutGoingDoc'
                  :key='attachment.id'>
                  <div
                    v-if='attachment.attachType == AttachType.FILE_CHINH'
                    class='flex'>
                    <ButtonIcon
                      v-if='!isView'
                      v-tooltip.left='"Chỉnh sửa"'
                      class='btnAction'
                      icon='edit_square'
                      icon-size='1.5'
                      rounded
                      text
                      @click='visibleSidebarEdit(id)'/>

                    <ButtonIcon
                      v-if='!isView'
                      v-tooltip.left='"Xóa"'
                      class='btnAction'
                      icon='delete'
                      icon-size='1.5'
                      rounded
                      text
                      @click='deleteDoc(id)'/>

                    <ButtonIcon
                      v-if='isView'
                      v-tooltip.left='"Tải xuống"'
                      class='btnAction'
                      icon='download'
                      rounded
                      text
                      @click='downloadAttachment(attachment?.id)'/>
                    <ButtonIcon
                      v-if='isView'
                      v-tooltip.left='"Xem"'
                      class='btnAction'
                      icon='visibility'
                      icon-size='1.5'
                      rounded
                      text
                      @click='viewDetail(attachment?.filePath, attachment?.fileExtension)'/>
                  </div>
                </div>
              </div>

              <div v-if="typeof fileMain != 'undefined'">
                <div
                  class='flex'>
                  <ButtonIcon
                    v-if='!isView'
                    v-tooltip.left='"Chỉnh sửa"'
                    class='btnAction'
                    icon='edit_square'
                    icon-size='1.5'
                    rounded
                    text
                    @click='visibleSidebarEdit(id)'/>

                  <ButtonIcon
                    v-if='!isView'
                    v-tooltip.left='"Xóa"'
                    class='btnAction'
                    icon='delete'
                    icon-size='1.5'
                    rounded
                    text
                    @click='deleteDoc(id)'/>
                </div>
              </div>

            </div>
          </template>
        </Column>

        <Column
          v-if='userDeptRole.roleId == RoleType.LANH_DAO && currNodeInj?.data?.optionActions?.some(action => action.name == "SIGN_CA")'
          :header="t('Ký số')"
          header-class='w-10rem'>
          <template #body='{ data: {attachmentOfOutGoingDoc, id } }'>
            <div
              v-for='attachment in attachmentOfOutGoingDoc'
              :key='attachment.id'>
              <div v-if='attachment.attachType == AttachType.FILE_CHINH'>
                <div class='flex justify-content-center'>
                  <ButtonIcon
                    v-if='!attachment.isCaSign'
                    v-tooltip.top='"Chờ ký"'
                    icon='stylus_note'
                    @click='prepareSignCa(attachment, ObjectTypeEnum.VB_DI, id)'/>
                </div>
                <div
                  v-if='attachment.isCaSign'
                  class='flex gap-2'>
                  <AppIcon
                    name='check'
                    size='1.7'/>
                  <p
                    class='align-content-center'
                    style='color: #94C748'>Đã ký</p>
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column
          v-if='userDeptRole.roleId == RoleType.LANH_DAO && currNodeInj?.data?.optionActions?.some(action => action.name == "SIGN_APPROVE")'
          :header="t('Ký điện tử')"
          header-class='w-10rem'>
          <template #body='{ data: {attachmentOfOutGoingDoc, id } }'>
            <div
              v-for='attachment in attachmentOfOutGoingDoc'
              :key='attachment.id'>
              <div v-if='attachment.attachType == AttachType.FILE_CHINH'>
                <div class='flex justify-content-center'>
                  <ButtonIcon
                    v-if='!attachment.isDigitalSign'
                    v-tooltip.top='"Chờ ký"'
                    icon='edit_document'
                    @click='digitalSign(id, attachment, false)'/>
                </div>
                <div
                  v-if='attachment.isDigitalSign'
                  class='flex gap-2'>
                  <AppIcon
                    name='check'
                    size='1.7'/>
                  <p
                    class='align-content-center'
                    style='color: #94C748'>Đã ký</p>
                </div>
              </div>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <DialogDraftDocs
    v-if='visibleChooseDocInSystem'
    :visible-dialog='visibleChooseDocInSystem'
    @choose-docs='getDocsFromSystem'
    @hide-dialog='hideDialog'/>

  <SidebarFormDocumentOut
    v-if='visibleFormDocOut'
    :id='idDoc'
    :visible-sidebar='visibleFormDocOut'
    @hide-dialog='hideSidebar'/>
  <PdfSign
    v-if='visibleDialogDigitalSign'
    v-model:visible='visibleDialogDigitalSign'
    :header='"signApprove"'
    :sign-urls='signatures'
    :url='pathPdf'
    @put-signed-file='signFunction'/>
  <PdfSign
    v-if='signCaVisible'
    v-model:visible='signCaVisible'
    :header='"signCa"'
    :is-signing='isSigningCa'
    sign-ca
    :sign-urls='signatureCaUrls'
    :url='signFileUrl'
    @sign-ca='signCa'
    @update:visible='closeSignCa'/>
</template>

<script setup lang="ts">

import { cloneDeep, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { computed, inject, type PropType, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getSignConfig } from '@/apps/admin/api/rest/sign-config';
import { getSignProvideConfig } from '@/apps/admin/api/rest/sign-provide-config';
import { getVtSignConfig } from '@/apps/admin/api/rest/vt-sign-config';
import type { ISignConfig } from '@/apps/admin/model/sign-config';
import { downloadById } from '@/apps/document/api/rest/attachment';
import { signApprove, signCaProvide, signPresent } from '@/apps/document/api/rest/sign';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { ObjectTypeEnum } from '@/apps/document/model/comment';
import { TypeOfPresentation } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocSubmitInput } from '@/apps/document/model/doc/doc-submit-input';
import { RoleType } from '@/apps/document/model/permission';
import type { SignatureConfig } from '@/apps/document/model/sign';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { useSignaturesStore } from '@/apps/document/store/sgin';
import PdfSign from '@/apps/document/views/doc/doc-out/component/sign/PdfSign.vue';
import SidebarFormDocumentOut from '@/apps/document/views/doc/doc-out/detail/SidebarFormDocumentOut.vue';
import DialogDraftDocs from '@/apps/document/views/doc/submit/DialogDraftDocs.vue';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import { GATEWAY_URL } from '@/common/api/configService';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import {
  convertFileSize,
  downloadFile,
  generateDownloadUrl,
  generatePreviewFileUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import { AttachType } from '@/common/model/attachment';

const props = defineProps({
  doc: {
    type: Object as PropType<DocSubmitInput>,
    default: {} as DocSubmitInput
  },
  docId: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: 'filePresentation'
  },
  filePresentation: {
    type: Object as PropType<DocumentAttachment>,
    default: {} as DocumentAttachment
  },
  docOuts: {
    type: Array as PropType<DocOut[]>,
    default: [] as DocOut[]
  },
  isView: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['update:filePresentation', 'update:docOuts']);
const signConfig = ref<ISignConfig>();
const signatureCaUrls = computed((): string[] | undefined => signConfig.value?.signature
  ? [generateDownloadUrl(signConfig.value?.signature) || ''] : undefined);
const docType = defineModel<string>('docType', { default: 'TRINH_VA_BAN_HANH_VAN_BAN' });
const { signatures } = storeToRefs(useSignaturesStore());
const { t } = useI18n();
const documentId = ref();
const isSigningCa = ref(false);
const presentation = ref();
const isExistPresentation = ref<boolean>(false);
const viewPresentation = ref();
const visibleChooseDocInSystem = ref(false);
const visibleFormDocOut = ref(false);
const visibleDialogDigitalSign = ref(false);
const idDoc = ref<string>('');
const filePresentationDelete = ref('');
const pathPdf = ref<string>();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const documentAttachment = ref<DocumentAttachment>({} as DocumentAttachment);
const currNodeInj = inject('currentNode', toRef({} as NodeInputInterface));
const docOutId = ref<string>();
const isSignFilePresent = ref(false);
const fileToSign = ref<DocumentAttachment>({} as DocumentAttachment);
const signFileUrl = ref<string | undefined>('');
let timeoutCheckStatus: NodeJS.Timeout | undefined;
const signCaVisible = ref(false);
const objectType = ref<ObjectTypeEnum>(ObjectTypeEnum.PHIEU_TRINH);

function addPresentation() {
  presentation.value.click();
}

function changePresentation(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  viewPresentation.value = files == null ? null : files[0];
  emits('update:filePresentation', viewPresentation.value);
  isExistPresentation.value = true;
}

function hideDialog() {
  idDoc.value = '';
  visibleChooseDocInSystem.value = false;
}

function digitalSign(id: string, attachment: DocumentAttachment, signeFilePresent: boolean) {
  isSignFilePresent.value = signeFilePresent;
  visibleDialogDigitalSign.value = true;
  documentAttachment.value = attachment;
  pathPdf.value = GATEWAY_URL + '/files/preview/' + convertPathToPdf(attachment);
  docOutId.value = id;
}

function digitalSignFilePresent(attachment: any, signeFilePresent: boolean) {
  isSignFilePresent.value = signeFilePresent;
  visibleDialogDigitalSign.value = true;
  documentAttachment.value = attachment;
  pathPdf.value = GATEWAY_URL + '/files/preview/' + convertPathToPdf(attachment);
}

function hideSidebar(data: DocOut) {
  if (data) {
    if (idDoc.value) {
      emits('update:docOuts', [...props.docOuts.filter((doc: DocOut) => doc.id != idDoc.value), data]);
    } else {
      emits('update:docOuts', [...props.docOuts, data]);
    }
  }
  idDoc.value = '';
  visibleFormDocOut.value = false;
}

function getDocsFromSystem(docOuts: DocOut[]) {
  emits('update:docOuts', [...props.docOuts, ...docOuts]);
}

function visibleSidebarEdit(id: string) {
  idDoc.value = id;
  visibleFormDocOut.value = true;
}

function deleteDoc(id: string) {
  emits('update:docOuts', [...props.docOuts.filter((item: DocOut) => item.id != id)]);
}

function deleteViewPresentation() {
  filePresentationDelete.value = viewPresentation.value.id;
  isExistPresentation.value = false;
}

function viewDetail(filePath: string | undefined, extension: string) {
  if (filePath) {
    if (EDITABLE_FILE_TYPES.includes(extension)) {
      window.open(GATEWAY_URL + '/files/preview/' + changeFileExtension(filePath.replace('main', 'preview'), 'pdf'));
    } else {
      window.open(GATEWAY_URL + '/files/preview/' + filePath);
    }
  }
}

function downloadAttachment(id: string) {
  downloadById(id).then((res) => {
    if (res) {
      downloadFile(res.data, res.headers['content-disposition'] ? decodeURI(res.headers['content-disposition']
        .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)[1]
        .replaceAll('"', '')) : 'unknown');
    }
  });
}

function changeFileExtension(filename: string, newExtension: string): string {
  return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}

watch(() => props.filePresentation, (value) => {
  if (value) {
    viewPresentation.value = props.filePresentation;
    isExistPresentation.value = viewPresentation.value.name != null || viewPresentation.value.fullName != null;
  }
});

function convertPathToPdf(attachment: DocumentAttachment) {
  const extension = attachment.fileExtension;
  if (extension && EDITABLE_FILE_TYPES.includes(extension)) {
    return attachment.filePath?.replace('/main/', '/preview/')
      .replace(`.${extension}`, '.pdf');
  }
  return attachment.filePath;
}

function signFunction(data: Uint8Array) {
  const blob = new Blob([data], { type: 'application/pdf' });
  const form = new FormData();
  form.append('file', blob, documentAttachment.value.fullName.replace(`.${documentAttachment.value.fileExtension}`, '.pdf'));
  form.append('userDeptRoleModel.userId', userDeptRole.value.userId);
  form.append('userDeptRoleModel.userName', userDeptRole.value.userName);
  form.append('userDeptRoleModel.deptId', userDeptRole.value.deptId);
  form.append('userDeptRoleModel.deptName', userDeptRole.value.deptName);
  form.append('userDeptRoleModel.roleId', userDeptRole.value.roleId);
  form.append('userDeptRoleModel.roleName', userDeptRole.value.roleName);
  form.append('userDeptRoleModel.type', userDeptRole.value.type);
  if (isSignFilePresent.value) {
    signPresent(documentAttachment.value.objectId || '', form).then(() => {
      visibleDialogDigitalSign.value = false;
      toastSuccess();
      window.location.reload();
    });
  } else {
    signApprove(docOutId.value || '', form).then(() => {
      visibleDialogDigitalSign.value = false;
      toastSuccess();
      window.location.reload();
    });
  }
}

function signCa(data: Uint8Array, config: SignatureConfig) {
  isSigningCa.value = true;
  if (fileToSign.value) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const form = new FormData();
    form.append('docId', documentId.value);
    form.append('file', blob, fileToSign.value.fullName.replace(`.${fileToSign.value.fileExtension}`, '.pdf'));
    form.append('objectType', objectType.value);
    form.append('signatureConfig.page', config.page.toString());
    form.append('signatureConfig.x', config.x.toString());
    form.append('signatureConfig.y', config.y.toString());
    form.append('signatureConfig.width', config.width.toString());
    form.append('signatureConfig.height', config.height.toString());
    form.append('userDeptRole.userId', userDeptRole.value.userId);
    form.append('userDeptRole.userName', userDeptRole.value.userName);
    form.append('userDeptRole.deptId', userDeptRole.value.deptId);
    form.append('userDeptRole.deptName', userDeptRole.value.deptName);
    form.append('userDeptRole.roleId', userDeptRole.value.roleId);
    form.append('userDeptRole.roleName', userDeptRole.value.roleName);
    form.append('userDeptRole.type', userDeptRole.value.type);
    signCaProvide(form).then(() => {
      toastSuccess();
      toastSuccess();
      window.location.reload();
      EventBus.emit('reload-preview');
    })
      .catch(() => {
        toastError();
      })
      .finally(() => {
        isSigningCa.value = false;
        signCaVisible.value = false;
      });
  }
}

function prepareSignCa(attachment: DocumentAttachment, type: ObjectTypeEnum, id: string) {
  objectType.value = type;
  fileToSign.value = attachment;
  documentId.value = id;
  signFileUrl.value = attachment ? previewUrl(attachment) : '';
  getSignProvideConfig().then((res) => {
    if (res) {
      getSignConfigFuncByProvider(res)?.().then((config) => {
        if (config) {
          signConfig.value = config;
          signCaVisible.value = true;
        }
      });
    }
  });
}

function getSignConfigFuncByProvider(provider: string) {
  let func;
  switch (provider) {
  case 'E_SIGN':
    func = getSignConfig;
    break;
  case 'VIETTEL_CA':
    func = getVtSignConfig;
    break;
  }
  return func;
}

function closeSignCa(value: boolean) {
  if (!value) {
    isSigningCa.value = false;
    if (timeoutCheckStatus) {
      clearTimeout(timeoutCheckStatus);
    }
  }
}

function previewUrl(attachment: DocumentAttachment) {
  const extension = attachment.fileExtension;
  let previewUrl = attachment.filePath;
  if (extension && EDITABLE_FILE_TYPES.includes(extension)) {
    previewUrl = attachment.filePath?.replace('/main/', '/preview/')
      .replace(`.${extension}`, '.pdf');
  }

  return generatePreviewFileUrl(previewUrl);
}

watch([currNodeInj, () => props.doc], ([newCurrNode, newDoc]) => {
  if (userDeptRole.value.roleId == RoleType.LANH_DAO
      && newCurrNode?.data.optionActions?.some((action: any) => action.name == 'SIGN_APPROVE' || action.name == 'SIGN_CA')) {
    if (newDoc.id) {
      setTimeout(() => {
        EventBus.emit('validate-sign-process', !checkSignStatus(cloneDeep(newDoc), newDoc.docType as TypeOfPresentation));
      }, 1000);
    }
  }
});

function checkSignStatus(data: any, docType: TypeOfPresentation): boolean {
  const signCa = currNodeInj.value?.data.optionActions?.some((option) => option.name === 'SIGN_CA');
  const signApprove = currNodeInj.value?.data.optionActions?.some((option) => option.name === 'SIGN_APPROVE');
  if (!signCa && !signApprove) {
    return true;
  }

  if (signCa && signApprove) {
    if (data.filePresentation?.isCaSign && data.filePresentation?.isDigitalSign) {
      if (docType == TypeOfPresentation.TRINH_VA_BAN_HANH_VAN_BAN) {
        if (data.docOuts?.every((docOut: DocOut) =>
          docOut.outGoingAttachments?.every((attachment) => attachment.isCaSign && attachment.isDigitalSign)
        )) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  if (signCa) {
    if (data.filePresentation?.isCaSign) {
      if (docType == TypeOfPresentation.TRINH_VA_BAN_HANH_VAN_BAN) {
        if (data.docOuts?.every((docOut: DocOut) => docOut.outGoingAttachments?.every((attachment) => attachment.isCaSign))) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  if (signApprove) {
    if (data.filePresentation?.isDigitalSign) {
      if (docType == TypeOfPresentation.TRINH_VA_BAN_HANH_VAN_BAN) {
        if (data.docOuts?.every((docOut: DocOut) =>
          docOut.outGoingAttachments?.every((attachment) => attachment.isDigitalSign)
        )) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  return false;
}
</script>

<style scoped>

.file-present {
  .btn-file-presentation .p-button {
    opacity: 0;
  }

  &:hover {
    .p-button {
      opacity: 1;
    }
  }
}

</style>

<script lang="ts">
export default { name: 'GridDocs' };
</script>