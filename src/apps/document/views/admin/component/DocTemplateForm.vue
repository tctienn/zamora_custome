<template>
  <Sidebar
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='p-fluid'>
        <div class='formgrid grid'>
          <div class='col-12 field'>
            <label>Đơn vị áp dụng</label>
            <TreeSelect
              v-model='deptId'
              class='mt-1 w-full'
              disabled
              :empty-message="t('common.selectEmpty')"
              :filter='true'
              input-id='organizationParent'
              :options='organizations'>
              <template
                #value='{ value }: { value: TreeNode[]; placeholder: String }'>
                <div class='flex justify-content-between'>
                  <span>{{
                    value.length > 0
                      ? value[0].label
                      : t("admin.user.chooseOrganization")
                  }}</span>
                </div>
              </template>
            </TreeSelect>
          </div>
          <div class='col-6 field'>
            <label v-required>{{ t("document.docTemplate.signal") }}</label>
            <InputText
              v-model='docTemplate.signal'
              v-trim
              name='signal'/>
            <small
              v-if='submitForm && !docTemplate.signal'
              class='p-error'>{{
                t("document.docTemplate.errors.signalEmpty")
              }}</small>
          </div>
          <div class='col-6 field'>
            <label v-required>{{
              t("document.docTemplate.docTemplateName")
            }}</label>
            <InputText
              v-model='docTemplate.docTemplateName'
              v-trim
              name='docTemplateName'/>
            <small
              v-if='submitForm && !docTemplate.docTemplateName'
              class='p-error'>{{ t("document.docTemplate.errors.nameEmpty") }}</small>
          </div>
          <div class='col-6 field'>
            <label>{{ t("document.docTemplate.docTemplateType") }}</label>
            <NamedDropdown
              v-model='docTemplate.docTemplateType'
              name='docTemplateType'
              option-label='label'
              option-value='value'
              :options='docTemplateTypes'/>
          </div>
          <div class='col-6 field'>
            <label>{{ t("common.status") }}</label>
            <NamedDropdown
              v-model='docTemplate.status'
              name='status'
              option-label='label'
              option-value='value'
              :options='statuses'/>
          </div>
          <div class='col-12 field'>
            <label>{{ t("document.docTemplate.description") }}</label>
            <Textarea
              id='positionDescription'
              v-model='docTemplate.description'
              v-trim
              name='description'
              rows='3'/>
          </div>
          <div class='col-12 field'>
            <div class='align-items-center flex justify-content-between'>
              <label v-required>{{ t("document.docTemplate.docTemp") }}</label>
              <ButtonIcon
                class='w-2'
                icon='upload'
                :label="t('Tải tệp lên')"
                size='small'
                @click='addFile()'/>
              <input
                ref='inputFiles'
                accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptz,.png, .gif, .jpg'
                hidden
                type='file'
                @change='onChangeFiles'/>
            </div>
            <div
              v-if='docTemp'
              class='file-item hover:surface-ground ml-8 overflow-hidden'
              @click='downloadAttachment(docTemp.fullName!!, docTemp.filePath)'>
              <div class='file-icon'>
                <img
                  alt='File icon'
                  :src="
                    getFileIcon(
                      docTemp.fullName?.split('.')[
                        docTemp.fullName?.split('.')?.length - 1
                      ],
                    )
                  "/>
              </div>
              <div class='mt-2'>{{ docTemp.fullName }}</div>
              <button
                v-tooltip.top="t('common.delete')"
                class='file-delete-btn'
                @click='
                  () => {
                    docTemp = undefined;
                    file = null;
                  }
                '>
                <i class='pi pi-trash'></i>
              </button>
            </div>
            <div v-else>
              <div
                v-if='submitForm && !docTemp'
                class='p-error text-sm'>
                {{ t("document.docTemplate.errors.nameEmpty") }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class='bottom-0 fixed flex gap-2 justify-content-center p-1 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          :loading='isProcessing'
          @click='submit'/>
      </div>
    </form>
  </Sidebar>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { findByObjectId } from '@/apps/document/api/graphql/attachment';
import { getDocTemplateById } from '@/apps/document/api/graphql/doc-template';
import { saveDocTemplate } from '@/apps/document/api/rest/docTemplate';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { type DocTemplateInterface, DocTemplateType, } from '@/apps/document/model/docTemplate';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { toastError, toastSuccess, } from '@/common/helpers/custom-toast-service';
import { downloadFileUrl, generateChatAttachmentDownloadUrl, getFileIcon, } from '@/common/helpers/file-utils';
import { listToTree } from '@/common/helpers/utils';
import { AttachType } from '@/common/model/attachment';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
  docTemplate: {
    type: Object as PropType<DocTemplateInterface>,
    default: {} as DocTemplateInterface,
  },
});
const emits = defineEmits(['hide-dialog', 'reload']);
const docTemplate = ref<DocTemplateInterface>(props.docTemplate);
const { t } = useI18n();
const form = ref();
const isProcessing = ref(false);
const headerDialog = props.id
  ? t('document.docTemplate.updateDocTemplate')
  : t('document.docTemplate.createDocTemplate');
const visible = ref(props.visibleDialog);

if (!props.id) {
  docTemplate.value = {} as DocTemplateInterface;
  docTemplate.value.docTemplateType = DocTemplateType.DOC;
  docTemplate.value.status = true;
} else {
  const { onResult } = getDocTemplateById(props.id);
  onResult((res) => {
    docTemplate.value = { ...res.data.findDocTemplateById };
    deptId.value = { [docTemplate.value.deptId]: true };
  });
  const { onResult: getAttachmentResult } = findByObjectId(props.id);

  getAttachmentResult((res) => {
    docTemp.value = res.data.findByObjectId[0];
  });
}
const isChangeFile = ref(false);
const deptId = ref();
const organizations = ref([]);
const orgs = ref<any[]>([]);
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
getAllOrganizationResult((response) => {
  const data = get(response, 'data.allOrganizationPublic', []);
  orgs.value = data;
  organizations.value = listToTree(
    data.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'data',
      parentId: 'parentId',
      children: 'children',
    },
  );
  if (!props.id) {
    const org = findLargestOrg(
      orgs.value.find((org) => org.id === userDeptRole.value.deptId).parentCode,
    );
    deptId.value = { [org.id]: true };
  }
});
const inputFiles = ref();

function addFile() {
  inputFiles.value?.click();
}

const submitForm = ref(false);
const docTemp = ref<DocumentAttachment>();

function submit() {
  submitForm.value = true;
  if (
    !docTemplate.value.signal
      || !docTemplate.value.docTemplateName
      || !docTemp.value
  ) {
    return;
  }
  const formData = new FormData(form.value);
  if (props.id) {
    formData.set('id', props.id);
  }
  formData.append('deptId', Object.keys(deptId.value)[0]);
  isChangeFile.value && formData.append('docTemp', file.value);
  isProcessing.value = true;
  saveDocTemplate(formData)
    .then(() => {
      toastSuccess({ message: t('Lưu thành công.') });
      submitForm.value = false;
      isProcessing.value = false;
      emits('hide-dialog');
    })
    .catch((err) => {
      toastError({ message: err.code });
      submitForm.value = false;
      isProcessing.value = false;
    });
}

function findLargestOrg(code: string): any {
  const org = orgs.value?.find((org: any) => org.code === code);

  if (!org) {
    return null;
  }

  if (org.parentCode === null || org.parentCode === '') {
    return org;
  }

  return findLargestOrg(org.parentCode);
}

let file = ref();

function onChangeFiles(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (files) {
    file.value = files[0];
    isChangeFile.value = true;
    docTemp.value = {
      fullName: files[0].name,
      fileExtension: files[0].type,
      size: files[0].size,
      isDeleted: false,
      attachType: AttachType.FILE_CHINH,
    };
  }
  input.value = '';
}

function downloadAttachment(fullName: string, path?: string) {
  if (!path) {
    return;
  }
  const fileUrl = generateChatAttachmentDownloadUrl(path);
  if (fileUrl) {
    downloadFileUrl(fileUrl, fullName);
  }
}

const docTemplateTypes = [
  {
    label: t('document.docTemplate.doc'),
    value: 'DOC',
  },
  {
    label: t('document.docTemplate.contract'),
    value: 'CONTRACT',
  },
];

const statuses = ref([
  {
    value: true,
    label: t('common.statuses.active'),
  },
  {
    value: false,
    label: t('common.statuses.deactivate'),
  },
]);
</script>

<style scoped>
.file-item {
  position: relative;
  display: inline-block;
  width: 120px;
  padding: 1rem 10px;
  text-align: center;
  border-radius: 8px;
}

.file-item:hover {
  .file-delete-btn {
    visibility: visible;
  }
}

.file-icon img {
  width: 40px;
  height: auto;
}

.file-delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  visibility: hidden;
}

.file-delete-btn:hover {
  color: #d9534f;
}
</style>
