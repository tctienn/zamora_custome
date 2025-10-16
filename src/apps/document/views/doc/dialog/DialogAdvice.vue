<template>
  <Dialog
    v-model:visible='visible'
    class='h-full'
    header='Xin ý kiến'
    :pt="{
      content: {
        class: 'pt-2 overflow-hidden'
      }
    }"
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 80vw; height: 80vh'>
    <form
      ref='form'
      @submit.prevent='submit'>
      <!-- Button Row -->
      <div class='align-items-center flex gap-2 justify-content-between mb-3'>
        <!-- Radio buttons for selection mode -->
        <div class='align-items-center col-6 flex gap-5 justify-content-between p-0'>
          <div class='flex gap-5'>
            <label class='flex gap-1'>
              <RadioButton
                v-model='option'
                name='source'
                value='all'>
              </RadioButton>
              <p class='font-semibold'>Tất cả</p>
            </label>

            <label class='flex gap-1'>
              <RadioButton
                v-model='option'
                name='source'
                value='user'>
              </RadioButton>
              <p class='font-semibold'>Người dùng</p>
            </label>

            <label class='flex gap-1'>
              <RadioButton
                v-model='option'
                name='source'
                value='group'>
              </RadioButton>
              <p class='font-semibold'>Nhóm</p>
            </label>
          </div>
          <InputText
            v-model='searchKeyword'
            class='w-20rem'
            :placeholder="t('common.search')"/>
        </div>
        
        <!-- Action buttons -->
        <div class='align-items-center col-6 flex gap-2 justify-content-end p-0'>
          <Button
            v-tooltip.top="t('common.deleteAll')"
            class='border-1 border-red-500 border-round-sm'
            icon='pi pi-trash'
            severity='danger'
            text
            @click='deleteAll'>
          </Button>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div
        class='flex gap-2'
        style='height: calc(55vh - 60px)'>
        <div class='border-1 col-8 surface-border'>
          <UserOrganization
            v-model='selectedUser'
            v-model:select-group='selectedGroup'
            :hide-controls='true'
            :option='option'
            :search-keyword='searchKeyword'
            style='height: calc(55vh - 80px)'/>
        </div>
        <div class='border-1 col surface-border'>
          <ReceiveListUser
            v-model='selectedUser'
            class='overflow-y-auto w-full'
            :hide-delete-all='true'
            style='height: calc(55vh - 80px)'/>
        </div>
      </div>
      
      <!-- Content and Attachment Section -->
      <div
        class='mt-2'
        style='height: calc(40vh - 60px)'>
        <TabView style='height: 100%'>
          <TabPanel
            header='Nhập ý kiến'
            style='height: 100%'>
            <Textarea
              id='description'
              v-model='content'
              auto-resize
              class='w-full'
              rows='6'
              style='height: calc(40vh - 120px)'/>
          </TabPanel>
          <TabPanel
            header='Tệp đính kèm'
            style='height: 100%'>
            <div class='align-items-center flex justify-content-between pb-1 show-header'>
              <slot name='header'>
                <div class='align-items-center flex'>
                </div>
                <ButtonIcon
                  icon='upload'
                  :label="t('Tải tệp lên')"
                  size='small'
                  @click='addFile()'/>
              </slot>
            </div>
            <input
              ref='inputFiles'
              accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptz,.png, .gif, .jpg, .zip, .rar'
              hidden
              multiple
              name='contentComment.lstAttachmentModel'
              type='file'
              @change='onChangeFiles'/>
            <div
              class='flex flex-column overflow-auto'
              style='height: calc(40vh - 160px)'>
              <div v-if='filterListFile.length > 0'>
                <div
                  v-for='file of filterListFile'
                  :key='file.id'
                  class='align-items-center file-row flex hover:surface-hover p-2'>
                  <div class='align-items-center flex flex-1 gap-2'>
                    <img
                      v-if='file.fullName'
                      alt=''
                      class='file-extension-icon h-2rem w-2rem'
                      draggable='false'
                      :src='getFileIcon(file.fullName.split(".")[file.fullName.split(".").length - 1])'
                      @error='handleFileImageError'/>
                    {{ file.fullName }}
                  </div>
                  <div
                    v-if='file.size'
                    class='w-6rem'>
                    {{ convertFileSize(file?.size) }}
                  </div>
                  <div
                    class='align-items-center flex gap-2 justify-content-end w-5rem'>
                    <ButtonIcon
                      v-tooltip.left='"Xóa"'
                      class='btnAction'
                      icon='delete'
                      icon-size='1.5'
                      rounded
                      text
                      @click='deleteFileAttach(file)'/>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </form>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          class='border-round-sm'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='visible=false'/>
        <Button
          class='border-round-sm'
          :disabled='selectedUser.length == 0'
          icon='pi pi-send'
          label='Gửi'
          @click='submit'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { sendDocToGetComments } from '@/apps/document/api/rest/comment';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { CommentSendType, ObjectTypeEnum } from '@/apps/document/model/comment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import UserOrganization from '@/apps/document/views/doc/UserOrganization.vue';
import ReceiveListUser from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUser.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  docId: {
    type: String,
    default: ''
  },
  docType: {
    type: String as PropType<ObjectTypeEnum>,
    default: ObjectTypeEnum.VB_DEN
  }
});
const emits = defineEmits(['hide-dialog']);
const visible = defineModel<boolean>('visible', { default: false });
const form = ref();
const filterListFile = computed<DocumentAttachment[]>(() => attachments.value.filter(x => !x.isDeleted));
const selectedUser = ref<Array<UserDeptRoleInput & { id: string }>>([]);
const selectedGroup = ref();
const userInGroupTemp = ref<any[]>([]);
const option = ref<string>('all');
const searchKeyword = ref<string>();
const { t } = useI18n();
const {
  type,
  userDeptRole
} = storeToRefs(useDocumentRolesStore());
const content = ref<string>('');
const inputFiles = ref();
let fileList: FileList | undefined = undefined;
const attachments = ref<DocumentAttachment[]>([]);

function submit() {
  const formData = new FormData(form.value);
  formData.append('docType', props.docType);
  selectedUser.value.forEach((item, index) => {
    formData.append(`receivers[${index}].toUserId`, item.userId);
    formData.append(`receivers[${index}].toDeptId`, item.deptId);
    formData.append(`receivers[${index}].toRoleId`, item.roleId);
    formData.append(`receivers[${index}].sendTime`, moment(new Date).format('YYYY-MM-DD'));
    formData.append(`receivers[${index}].sendType`, CommentSendType.XIN_Y_KIEN);
    formData.append(`receivers[${index}].objectId`, props.docId);
    formData.append(`receivers[${index}].replyForId`, '');
    formData.append(`receivers[${index}].hasAttachment`, 'false');
    formData.append(`receivers[${index}].toUserName`, item.userName);
    formData.append(`receivers[${index}].toDeptName`, item.deptName);
    formData.append(`receivers[${index}].toRoleName`, item.roleName);
  });
  formData.append('userDeptRole.userId', userDeptRole.value.userId);
  formData.append('userDeptRole.userName', userDeptRole.value.userName);
  formData.append('userDeptRole.deptId', userDeptRole.value.deptId);
  formData.append('userDeptRole.deptName', userDeptRole.value.deptName);
  formData.append('userDeptRole.roleId', userDeptRole.value.roleId);
  formData.append('userDeptRole.roleName', userDeptRole.value.roleName);
  formData.append('userDeptRole.type', (type.value)!.toString());
  sendDocToGetComments(formData).then(() => {
    toastSuccess({ message: 'Đã xin ý kiến thành công.' });
    emits('hide-dialog');
    visible.value = false;
  });

  formData.append('contentComment.content', content.value);
}

function onChangeFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    const temp: DocumentAttachment[] = [];
    for (const [index, file] of Array.from(files).entries()) {
      let fileAttachment: DocumentAttachment = {
        fullName: file.name,
        fileExtension: file.type,
        size: file.size,
        isDeleted: false,
      };
      temp.push(fileAttachment);
    }
    addNewFiles(files);

    attachments.value = [...filterListFile.value || [], ...temp];
  }
}

function addNewFiles(files: FileList) {
  const dataTransfer = getCurrentFiles();
  for (const file of files) {
    dataTransfer.items.add(file);
  }
  fileList = dataTransfer.files;
  inputFiles.value.files = fileList;
}

function addFile() {
  inputFiles.value?.click();
}

function getCurrentFiles(): DataTransfer {
  const dataTransfer = new DataTransfer();
  if (fileList) {
    for (const file of fileList) {
      dataTransfer.items.add(file);
    }
  }
  return dataTransfer;
}

function deleteAll() {
  selectedUser.value = [];
}

function deleteFileAttach(file: any) {
  attachments.value = attachments.value.filter((f) => f.fullName != file.fullName);
  if (file.fullName && file.size) {
    const dataTransfer = getCurrentFiles();
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const f = dataTransfer.files[i];
      if (f.name === file.fullName && f.size === file.size) {
        dataTransfer.items.remove(i);
      }
    }
    fileList = dataTransfer.files;
    inputFiles.value.files = fileList;

  }
}

watch(selectedGroup, (value) => {
  userInGroupTemp.value = [...userInGroupTemp.value, ...value?.flatMap((group: any) => group.users).map((user: any) => ({ id: user.id })) || []];
  selectedUser.value = selectedUser.value.filter((su: any) => !userInGroupTemp.value.some((uigt: any) => uigt.id == su.id));
  selectedUser.value = [...selectedUser.value, ...value?.flatMap((group: any) => group.users).filter((v: any) => v.deptId).map((user: any) => ({
    userId: user.userId,
    roleName: user.roleName,
    userName: user.userName,
    deptName: user.deptName,
    deptId: user.deptId,
    roleId: user.roleId,
    type: 'ADMINISTRATIVE',
    id: user.id
  })) || []];
});
</script>

<script lang='ts'>
export default { name: 'DialogAdvice' };

</script>

<style scoped>

</style>