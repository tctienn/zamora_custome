<template>
  <Sidebar
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :dismissable='false'
    position='right'
    style='width: 80vw'
    @hide='emits("hide-dialog")'>

    <div
      class='border-bottom-1 border-gray-500 fixed left-0 px-2 py-1 surface-0 top-0 w-full'
      style='z-index: 1000'>
      <div class='flex justify-content-between p-2'>
        <div class='flex gap-1'>
          <ButtonIcon
            class='border-round-sm'
            icon='arrow_back'
            severity='danger'
            size='small'
            @click='emits("hide-dialog")'/>
          <div class='align-content-center font-semibold text-2xl'>OCR nhận diện văn bản đến</div>
        </div>
      </div>
    </div>

    <div
      class='mt-2'
      style='height: calc(100vh - 7rem)'>
      <!--      <div class='flex justify-content-between'>-->
      <!--        <h3>OCR nhận diện văn bản đến</h3>-->
      <!--        <div class='flex flex-row gap-1 justify-content-center py-1'>-->
      <!--          <Button-->
      <!--            icon='pi pi-times'-->
      <!--            :label="t('common.close')"-->
      <!--            severity='danger'-->
      <!--            style='height: 4vh'-->
      <!--            @click='emits("hide-dialog")'/>-->
      <!--          <Button-->
      <!--            icon='pi pi-check'-->
      <!--            :label="t('common.save')"-->
      <!--            style='height: 4vh'-->
      <!--            @click='saveDoc'/>-->
      <!--        </div>-->
      <!--      </div>-->
      <div class='flex'>
        <div class='col-9 h-full p-0'>

          <div class='flex gap-1 mb-2'>
            <form
              ref='form'
              @submit.prevent='process'>
              <input
                ref='file'
                class='align-content-center'
                hidden
                name='file'
                type='file'
                @change='onChangeFiles'>
              <div class='flex gap-2'>

                <ButtonIcon
                  class='border-round-sm'
                  icon='upload'
                  :label="t('ecm.storage.uploadFile')"
                  size='small'
                  @click='addFile()'/>
              </div>

            </form>
            <ButtonIcon
              class='border-round-sm'
              :disabled='disableUpload'
              icon='lens_blur'
              label='Thực hiện'
              size='small'
              @click='process'>
            </ButtonIcon>
            <div class='align-content-center'>
              <ValidateErrorMessage :errors='v$.attachments.$errors'/>
            </div>
          </div>
          <div class='mt-2'>
            <p class='align-content-center font-semibold'>Nội dung văn bản</p>
          </div>
          <div>
            <div
              v-if='!loading'
              class='border-2 border-round-sm overflow-auto p-4 surface-border'
              style='height: calc(100vh - 14rem); white-space: pre-line'>
              {{ content }}
            </div>

            <div class='flex'>
              <ProgressSpinner
                v-if='loading'
                class='justify-content-center w-5rem'
                stroke-width='3'
                style='height: calc(100vh - 15rem)'/>
            </div>
            <div class='flex gap-2 mt-2'>
              <label class='align-content-center font-normal'>Tên tệp</label>
              <div
                v-if='fileUpload'
                class='flex gap-2'>
                <!--                <img-->
                <!--                  v-if='fileUpload[0]'-->
                <!--                  alt=''-->
                <!--                  class='file-extension-icon w-2rem'-->
                <!--                  draggable='false'-->
                <!--                  :src="-->
                <!--                    getFileIcon(-->
                <!--                      fileUpload[0].fullName.split('.')[fileUpload[0].fullName.split('.').length - 1],-->
                <!--                    )-->
                <!--                  "-->
                <!--                  @error='handleFileImageError'/>-->

                <div class='align-content-center font-semibold'>
                  : {{ fileUpload[0].fullName }}
                </div>

                <div class='align-content-center'>
                  {{ convertFileSize(fileUpload[0].size) }}
                </div>
              </div>
            </div>
            <!--            <Textarea-->
            <!--              v-model='content'-->
            <!--              class='w-full'/>-->
          </div>
        </div>

        <div
          class='col overflow-auto py-0'
          style='height: calc(100vh - 15rem); margin-top: 4rem; margin-bottom: 2rem;'>
          <form
            ref='formDoc'
            @submit.prevent='saveDoc'>
            <div class='sticky-header'>
              <label class='font-semibold'>1. Thông tin gợi ý sổ</label>
            </div>

            <input
              ref='fileCopy'
              class='align-content-center'
              hidden
              name='fileMain'
              type='file'>

            <input
              v-model='userDeptRole.userId'
              hidden
              name='userDeptRoleModel.userId'/>
            <input
              v-model='userDeptRole.userName'
              hidden
              name='userDeptRoleModel.userName'/>
            <input
              v-model='userDeptRole.deptId'
              hidden
              name='userDeptRoleModel.deptId'/>
            <input
              v-model='userDeptRole.deptName'
              hidden
              name='userDeptRoleModel.deptName'/>
            <input
              v-model='userDeptRole.roleId'
              hidden
              name='userDeptRoleModel.roleId'/>
            <input
              v-model='userDeptRole.roleName'
              hidden
              name='userDeptRoleModel.roleName'/>
            <input
              v-model='userDeptRole.type'
              hidden
              name='userDeptRoleModel.type'/>

            <div class='field flex flex-column'>
              <label v-required>Sổ văn bản đến</label>
              <NamedDropdown
                v-model='doc.bookId'
                class='w-full'
                filter
                name='bookId'
                option-label='bookName'
                option-value='id'
                :options='books'
                @change='changeBook($event)'/>
              <ValidateErrorMessage :errors='v$.bookId.$errors'/>
            </div>

            <div class='field flex flex-column'>
              <label v-required>Số vào sổ</label>
              <NamedInputNumber
                v-model='doc.bookNumber'
                class='w-full'
                input-class='w-full'
                name='bookNumber'/>

              <ValidateErrorMessage :errors='v$.bookNumber.$errors'/>
            </div>

            <div class='field flex flex-column'>
              <label v-required>Cơ quan ban hành</label>

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

            <div class='field flex flex-column'>
              <label>Người ký</label>

              <NamedDropdown
                v-model='doc.signerName'
                class='w-full'
                filter
                is-editable
                name='signerName'
                :options='signers'/>
            </div>

            <div class='field flex flex-column'>
              <label v-required>Ngày nhận</label>
              <NamedInputCalendar
                id='processingDeadline'
                v-model='doc.incomingDate'
                class='w-full'
                name='incomingDate'
                :select-other-months='true'
                show-icon/>
              <ValidateErrorMessage :errors='v$.incomingDate.$errors'/>
            </div>

            <div class='field flex flex-column'>
              <label v-required>Loại văn bản</label>
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
              <ValidateErrorMessage :errors='v$.docTypeId.$errors'/>
            </div>

            <div>
              <label class='font-semibold'>2. Thông tin nhận dạng</label>
            </div>

            <div class='field flex flex-column'>
              <label v-required>Số/Ký hiệu</label>
              <InputText
                v-model='doc.docCode'
                name='docCode'
                style='background: #FFFADF'/>
              <ValidateErrorMessage :errors='v$.docCode.$errors'/>
            </div>

            <div class='field flex flex-column'>
              <label v-required>Ngày văn bản</label>
              <NamedInputCalendar
                id='processingDeadline'
                v-model='doc.docDate'
                class='docDate'
                name='docDate'
                :select-other-months='true'
                show-icon/>
              <ValidateErrorMessage :errors='v$.docDate.$errors'/>
            </div>

            <div class='field flex flex-column'>
              <label v-required>Trích yếu</label>
              <Textarea
                v-model='doc.quote'
                name='quote'
                rows='5'
                style='background: #FFFADF'/>
              <ValidateErrorMessage :errors='v$.quote.$errors'/>
            </div>

            <div class='field flex flex-column'>
              <label>Số trang</label>

              <NamedInputNumber
                v-model='doc.numberOfPage'
                class='number-page w-full'
                input-class='w-full'
                name='numberOfPage'/>
            </div>
            
          </form>
          
          <!-- Sticky Save button -->
          <div class='sticky-save-button'>
            <ButtonIcon
              class='border-round-sm'
              icon='save'
              :label='t("common.save")'
              size='small'
              @click='saveDoc'/>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getBook } from '@/apps/document/api/graphql/book';
import { getSigner } from '@/apps/document/api/graphql/doc-in';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import { putInBookUsingOcr, saveDocInWithOCR } from '@/apps/document/api/rest/docIn';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { type BookInterface, BookType } from '@/apps/document/model/book';
import type { DocIn, DocInInput } from '@/apps/document/model/doc/doc-in';
import type { DocTypeInterface } from '@/apps/document/model/docType';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import NextButtonsInForm from '@/apps/document/views/doc/doc-in/component/next-buttons-infom/NextButtonsInForm.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedInputNumber from '@/common/components/custom/NamedInputNumber.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  visibleSidebar: {
    type: Boolean,
    required: false
  },
});

const emits = defineEmits(['hide-dialog']);
const {
  currentOrgId,
  type
} = storeToRefs(
  useDocumentRolesStore(),
);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const form = ref();
const formDoc = ref();
const file = ref();
const fileCopy = ref();
const fileUpload = ref();
const disableUpload = ref(true);
const docTypes = ref<DocTypeInterface[]>([] as DocTypeInterface[]);
const content = ref<string>('');
const attachment = ref();
const doc = ref<DocInInput>({} as DocInInput);
const { onResult: getDocTypeResult } = getAllDocType();
const books = ref<BookInterface[]>([] as BookInterface[]);
const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const { onResult: getOrgResult } = getOrgOut();
const signers = ref<string[]>();
const { t } = useI18n();
const inputFiles = ref();
const loading = ref(false);
let fileList: FileList | undefined = undefined;
const {
  onResult: getBookResult,
  load: getBookLoad,
  refetch: getBookRefetch,
} = getBook();

const visible = ref(props.visibleSidebar);

function addFile() {
  file.value?.click();
}

getBookResult((res) => {
  books.value = res.data.getBook;
});

getSigner().onResult((res) => {
  signers.value = res.data.getSigner;
});

getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;

  doc.value.docTypeId = (
      docTypes.value.length > 0 ? docTypes.value[0].id : null
  )!;
  doc.value.docTypeName = (
      docTypes.value.length > 0 ? docTypes.value[0].name : null
  )!;

});

getBookLoad(undefined, {
  structureType: type.value,
  depId: currentOrgId.value,
  bookType: BookType.DOC_IN,
}) || getBookRefetch();

getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut;
});

function process() {
  disableUpload.value = true;
  loading.value = true;
  const formData = new FormData(form.value);
  saveDocInWithOCR(formData).then((res: any) => {
    content.value = res.content;
    doc.value = res;
    doc.value = {
      ...doc.value,
      docDate: doc.value.docDate ? new Date(doc.value.docDate) : null,
      numberOfPage: res.numberOfPage != 'null' ? res.numberOfPage : 0
    };
    toastSuccess({ message: 'Xử lý hoàn thành.' });
    loading.value = false;
  });
  if (form.value) {
    form.value.reset();
  }
}

function changeBook(event: any) {
  doc.value.bookNumber =
      books.value.find((b) => b.id === (event.value ? event.value : event))
        ?.currentNumber || 0;
}

const validateAttachment = () => {
  return attachment.value != null;
};

const validateRules = {
  bookId: {
    required: helpers.withMessage(
      t('document.doc.docIn.validate.bookIdNotNull'),
      required,
    ),
  },
  bookNumber: { required: helpers.withMessage('Số vào sổ không được để trống.', required), },
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
  docTypeId: {
    required: helpers.withMessage(
      'Loại văn bản không được để trống',
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

function saveDoc() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      const formData = new FormData(formDoc.value);
      putInBookUsingOcr(formData).then(() => {
        toastSuccess({ message: t('document.doc.docIn.saveSuccess') });
        emits('hide-dialog');
      }).catch((err) => {
        toastError({ message: t(`document.doc.error.${err.code}`) });
      });
    }
  });
}

function changePublisher(event: any) {
  doc.value.publisherName =
      orgOuts.value.find((dt: any) => dt.id == event.value)?.orgOutName ?? '';
}

function changeDocType(event: any) {
  doc.value.docTypeName =
      docTypes.value.find((dt: DocTypeInterface) => dt.id == event.value)?.name
      ?? '';
}

function onChangeFiles(e: Event) {
  disableUpload.value = false;
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
    fileUpload.value = temp;
  }

  if (file.value && file.value.files && file.value.files.length > 0) {
    const fileTemp = file.value.files[0];
    attachment.value = fileTemp;
    // Tạo một đối tượng FileList mới chứa file đã chọn
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(fileTemp);

    // Gán lại vào input "filecopy"
    if (fileCopy.value) {
      fileCopy.value.files = dataTransfer.files;
    }
  }
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

function addNewFiles(files: FileList) {
  const dataTransfer = getCurrentFiles();
  for (const file of files) {
    dataTransfer.items.add(file);
  }
  fileList = dataTransfer.files;
  file.value.files = fileList;
}
</script>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({ name: 'DocumentInOCR' });
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  background-color: #ffffff;
  padding: 0.5rem 0;
  margin: 0 0 0.5rem 0;
  border-bottom: 1px solid var(--surface-border);
  z-index: 100;
  width: 100%;
}

.sticky-save-button {
  position: fixed;
  bottom: 0;
  right: 25px;
  background-color: #ffffff;
  padding: 1rem;
  border-top: 1px solid var(--surface-border);
  z-index: 150;
  width: calc(20vw - 2rem);
  display: flex;
  justify-content: flex-end;
}

:deep(.number-page .p-inputnumber-input) {
  background-color: #FFFADF
}

:deep(.docDate .p-inputtext) {
  background-color: #FFFADF
}
</style>
