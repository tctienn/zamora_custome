<template>
  <div class='flex grid-nogutter p-0'>
    <div
      class='p-3 pr-0 relative transition-width'
      :class='expandComment ? "col-9" : "col-12"'>
      <div
        class='overflow-auto pr-1'
        style='height: calc(100vh - 13rem)'>
        <div
          class='align-items-center flex font-semibold gap-2 mb-3 text-lg'>
          <i class='pi pi-info-circle text-xl'/>
          Thông tin văn bản
        </div>
        <div
          class='align-items-end flex gap-2 mb-2 pl-3'>
          <AppUser
            avatar-size='3'
            :user-id='doc.createdBy'/>
          <div>
            <div class='text-sm'>
              {{
                t('document.doc.docInDetail.createBy')
              }}<b>{{ user?.fullName }}</b>
            </div>
            <div class='text-sm'>
              {{ t('document.doc.docInDetail.time') }}
              {{
                doc.createdTime
                  ? moment(doc.createdTime).format('HH:mm DD/MM/YYYY')
                  : ''
              }}
            </div>
          </div>
        </div>
        <div class='pl-3 py-2'>
          <h3 class='font-bold text-center'>
            {{
              doc.docType === TypeOfPresentation.TRINH_XIN_Y_KIEN ? 'TRÌNH XIN Ý KIẾN' :
              doc.docType === TypeOfPresentation.TRINH_VA_BAN_HANH_VAN_BAN ? 'TRÌNH VÀ BAN HÀNH VĂN BẢN' :
              doc.docType === TypeOfPresentation.PHIEU_LAY_Y_KIEN ? 'PHIẾU LẤY Ý KIẾN' :
              'THÔNG TIN VĂN BẢN'
            }}
          </h3>
        </div>
        <div class='flex flex-wrap w-full'>
          <div class='col-12 flex gap-2 mb-2 px-0 py-2'>
            <label class=''>Kính gửi:</label>
            <label class='font-bold word-break-break-word'>{{ doc.submitToNames ? doc.submitToNames : '-' }}</label>
          </div>
          <div class='left-block w-6'>
            <div class='align-items-center flex gap-2 py-2'>
              <label class=''>Số/Ký hiệu: </label>
              <div class='bg-custom-1 border-1 border-dashed border-red-400 border-round-3xl font-bold px-3 py-2'>
                {{ doc.number }}/{{ doc.symbol }}
              </div>
            </div>
            
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Đơn vị trình:</label>
              <label class='font-bold'>{{ doc.fromDeptPresentName ? doc.fromDeptPresentName : '-' }}</label>
            </div>
            
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Ngày văn bản: </label>
              <label class='font-bold'>{{ doc.docDate ? moment(doc.docDate).format('DD/MM/YYYY') : '-' }}</label>
            </div>
            
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Độ mật:</label>
              <label class='font-bold w-4'>
                {{ doc.securityCode ? getSecurities(doc.securityCode) : '-' }}
              </label>
            </div>
            
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Số lần trình:</label>
              <label class='font-bold'>{{ doc.numberSubmissions ? getNumberSubmission(doc.numberSubmissions) : '-' }}</label>
            </div>
            
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Loại phiếu trình:</label>
              <label class='font-bold'>{{ doc.docType ? getTypeOfPresentation(doc.docType) : '-' }}</label>
            </div>
          </div>
          
          <div
            class='right-block w-6'
            style='margin-top: 0.75rem;'>
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Năm:</label>
              <label class='font-bold'>{{ doc.year ? doc.year : '-' }}</label>
            </div>
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Cơ quan trình:</label>
              <label class='font-bold'>{{ doc.toDeptPresentName ? doc.toDeptPresentName : '-' }}</label>
            </div>
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Vấn đề trình:</label>
              <label class='font-bold word-break-break-word'>{{ doc.about ? doc.about : '-' }}</label>
            </div>
            
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Tóm tắt nội dung công việc:</label>
              <label class='font-bold word-break-break-word'>{{ doc.workSummary ? doc.workSummary : '-' }}</label>
            </div>
            <div class='flex gap-2 mb-1 py-2'>
              <label class=''>Vị trí lưu:</label>
              <label class='font-bold'>{{ doc.docLocation ? doc.docLocation : '-' }}</label>
            </div>

          </div>
        </div>
        
        <div
          v-if='doc.docType == TypeOfPresentation.TRINH_XIN_Y_KIEN'
          class='mt-3'>
          <div class='font-semibold mb-2'>
            Nội dung và ý kiến của các cơ quan có liên quan:
          </div>
              
          <div class='flex gap-2 mb-2 py-2'>
            <label class=''>Ý kiến 1:</label>
            <label class='font-bold word-break-break-word'>{{ doc.opinion1 ? doc.opinion1 : '-' }}</label>
          </div>
              
          <div class='flex gap-2 mb-2 py-2'>
            <label class=''>Ý kiến 2:</label>
            <label class='font-bold word-break-break-word'>{{ doc.opinion2 ? doc.opinion2 : '-' }}</label>
          </div>
              
          <div class='flex gap-2 mb-2 py-2'>
            <label class=''>Ý kiến 3:</label>
            <label class='font-bold word-break-break-word'>{{ doc.opinion3 ? doc.opinion3 : '-' }}</label>
          </div>
              
          <div class='flex gap-2 mb-2 py-2'>
            <label class=''>Ý kiến 4:</label>
            <label class='font-bold word-break-break-word'>{{ doc.opinion4 ? doc.opinion4 : '-' }}</label>
          </div>
              
          <div class='flex gap-2 mb-2 py-2'>
            <label class=''>Ý kiến 5:</label>
            <label class='font-bold word-break-break-word'>{{ doc.opinion5 ? doc.opinion5 : '-' }}</label>
          </div>
              
          <div class='flex gap-2 mb-2 py-2'>
            <label class=''>Ý kiến 6:</label>
            <label class='font-bold word-break-break-word'>{{ doc.opinion6 ? doc.opinion6 : '-' }}</label>
          </div>
              
          <div class='flex gap-2 mb-2 py-2'>
            <label class=''>Ý kiến giải quyết của lãnh đạo:</label>
            <label class='font-bold word-break-break-word'>{{ doc.leaderOpinion ? doc.leaderOpinion : '-' }}</label>
          </div>
        </div>
      </div>
      <div class='flex'>
        <div class='col px-0'>
          <GridDocs
            v-model:doc-outs='doc.docOuts'
            v-model:doc-type='doc.docType'
            v-model:file-presentation='doc.filePresentation'
            :doc='doc'
            :doc-id='doc.id'
            :is-view='true'/>
        </div>
      </div>

      <div class='flex'>
        <div class='col px-0'>
          <UploadFilesForDocOut
            v-model:list-file='doc.relatedDocuments'
            class='upload-for-doc-out'
            :file-attachments-name="'relatedDocuments'"
            header='Tài liệu liên quan - Không ban hành'
            :is-view='true'/>
        </div>
      </div>

      <div
        v-if='doc.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN'
        class='flex'>
        <div class='col px-0'>
          <FormQuestion
            v-model:question-model='questions'
            :is-create='false'
            :is-owner='isOwner'/>
        </div>
      </div>
    </div>

    <Divider
      v-if='expandComment'
      class='mx-2 my-0 py-0'
      layout='vertical'/>

    <div
      v-if='expandComment'
      class='col flex flex-column p-3 w-0'>
      <CommentDocSubmit
        v-if='doc.id'
        :disabled='false'
        :doc-id='doc.id'/>
    </div>
  </div>
    
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findByIdIn } from '@/apps/document/api/graphql/doc-out';
import { findDocSubmitById } from '@/apps/document/api/graphql/doc-submit';
import { getAnswersQuestionByDocId } from '@/apps/document/api/graphql/question';
import {
  getNumberSubmission,
  getSecurities,
  getTypeOfPresentation,
  TypeOfPresentation
} from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocSubmitInput } from '@/apps/document/model/doc/doc-submit-input';
import { type Question } from '@/apps/document/model/doc/doc-submit-input';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocSubmit from '@/apps/document/views/doc/component/comment/comment-doc-submit/CommentDocSubmit.vue';
import FormQuestion from '@/apps/document/views/doc/submit/FormQuestion.vue';
import GridDocs from '@/apps/document/views/doc/submit/GridDocs.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import UploadFilesForDocOut from '@/common/components/custom/UploadFilesForDocOut.vue';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  id: {
    type: String,
    default: null
  }
});

const questions = ref([] as Question[]);
const router = useRouter();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const doc = ref({} as DocSubmitInput & { docOuts: DocOut[] });
const { moment } = useMoment();
const isOwner = computed(() => {
  return userDeptRole.value.userId == doc.value.editorId
    && userDeptRole.value.roleId == doc.value.editorRoleId
    && userDeptRole.value.deptId == doc.value.editorDeptId;
});
const flowInstanceId = ref<string>();
const processId = ref<string>();
const { t } = useI18n();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[doc.value.createdBy],
);

const expandComment = ref(true);

findDocSubmitById(props.id, userDeptRole.value).onResult((res) => {
  doc.value = res.data.findDocSubmitById;
  doc.value = {
    ...doc.value,
    fromDeptPresent: [doc.value.fromDeptPresentId],
    toDeptPresent: [doc.value.toDeptPresentId],
    docDate: doc.value.docDate ? new Date(doc.value.docDate) : null,
    dateInput: doc.value.dateInput ? new Date(doc.value.dateInput) : null,
    filePresentation: doc.value.filePresentation ? doc.value.filePresentation : null,
  };

  findByIdIn(userDeptRole.value, doc.value.docOutIds).onResult((response) => {
    doc.value.docOuts = response.data.findByIdIn;
  });

  // questions.value = res.data.findDocSubmitById.questions;
  if (doc.value.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN) {
    getAnswersQuestionByDocId(doc.value.id, userDeptRole.value).onResult((res) => {
      questions.value = res.data.getAnswersQuestionByDocId;
    });
  }
  flowInstanceId.value = res.data.findDocSubmitById?.process?.flowInstanceId;
  processId.value = res.data.findDocSubmitById?.process?.id;
});

function expandCommentFn() {
  expandComment.value = !expandComment.value;
}

onMounted(() => {
  EventBus.on('expand-doc-submit-detail', expandCommentFn);
});

onUnmounted(() => {
  EventBus.off('expand-doc-submit-detail', expandCommentFn);
});

provide('afterAction', () => router.back());
defineExpose({ doc });

</script>

<style scoped>
.field-custom {
  display: inline-block;
  width: auto;
}

.transition-width {
  transition: width 0.3s ease-in-out;
}

.bg-custom-1 {
  background-color: #FDF8E2;
}
:deep(.formgrid .file-present .flex) {
  justify-content: flex-start !important;
}
:deep(.formgrid .file-present) {
  width: 100%;
}
:deep(.formgrid ) {
  flex-direction: column;
}
:deep(.custom-file-upload) {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
}
:deep(.custom-file-upload .file-extension-icon) {
  width: 2.5rem !important;
  height: 2.5rem !important;
}
:deep(.btn-file-presentation .p-button .custom-icon) {
  margin-left: 0 !important;
}
:deep(.btn-file-presentation .p-button) {
  opacity: 1 !important;
  margin-top: 1rem;
  margin-right: 1rem !important;
}
</style>