<template>
  <div class='overflow-auto'>
    <div class='flex justify-content-end pb-3'>
      <div class='flex gap-2'></div>
    </div>
    <div class='flex justify-content-between'>
      <h4>NGÂN HÀNG TMCP NGOẠI THƯƠNG VIỆT NAM</h4>
      <div class='font-semibold'>
        {{ doc.docLocation }}, ngày
        {{ doc.docDate ? moment(doc.docDate).format('DD/MM/YYYY HH:mm') : '' }}
      </div>
    </div>

    <div class='flex justify-content-between'>
      <div class='flex gap-2'>
        <div class='font-semibold'>Đơn vị:</div>
        <div>
          {{ doc.fromDeptPresentName }}
        </div>
      </div>
      <div class='flex gap-2'>
        <div class='font-semibold'>Độ mật:</div>
        <div>
          {{ getSecurities(doc.securityCode) }}
        </div>
      </div>
    </div>

    <div class='flex gap-5 py-3'>
      <div class='flex gap-2'>
        <div class='font-semibold'>Số:</div>
        <div>
          {{ doc.number }}
        </div>
      </div>
      <div class='flex gap-2'>
        <div class='font-semibold'>Ký hiệu:</div>
        <div>
          {{ doc.symbol }}
        </div>
      </div>
      <div class='flex gap-2'>
        <div class='font-semibold'>Năm:</div>
        <div>
          {{ doc.year }}
        </div>
      </div>
    </div>

    <div class='flex justify-content-center'>
      <h3>PHIẾU TRÌNH GIẢI QUYẾT CÔNG VIỆC</h3>
    </div>

    <div class='flex justify-content-center'>
      <div class='flex gap-2'>
        <div class='font-semibold'>Số lần trình:</div>
        <div>
          {{ getNumberSubmission(doc.numberSubmissions) }}
        </div>
      </div>
    </div>

    <div class='flex justify-content-center'>
      <div class='flex gap-2'>
        <div class='font-semibold'>Loại phiếu trình:</div>
        <div>
          {{ getTypeOfPresentation(doc.docType) }}
        </div>
      </div>
    </div>

    <div class='flex gap-2 py-2'>
      <div class='font-semibold'>Kính gửi:</div>
      <div>{{ doc.submitToNames }}</div>
    </div>

    <div class='flex gap-2 py-2'>
      <div class='font-semibold inline-block w-auto'>Vấn đề trình:</div>
      <div class='w-auto word-break-break-word'>
        {{ doc.about }}
      </div>
    </div>

    <div class='flex gap-2 py-2'>
      <div class='col-1 field-custom font-semibold p-0'>
        Tóm tắt nội dung công việc:
      </div>
      <div class='w-auto word-break-break-word'>
        {{ doc.workSummary }}
      </div>
    </div>

    <div class='flex gap-2 py-2'>
      <div class='font-semibold'>Cơ quan trình:</div>
      <div>
        {{ doc.toDeptPresentName }}
      </div>
    </div>

    <div>
      <GridDocs
        v-model:doc-outs='doc.docOuts'
        v-model:doc-type='doc.docType'
        v-model:file-presentation='doc.filePresentation'
        :doc='doc'
        :doc-id='doc.id'
        :is-view='true'/>
    </div>
    <div class='py-3'>
      <UploadFilesForDocOut
        v-model:list-file='doc.relatedDocuments'
        class='upload-for-doc-out'
        :file-attachments-name="'relatedDocuments'"
        header='Tài liệu liên quan - Không ban hành'
        :is-view='true'/>
    </div>

    <div
      v-if='doc.docType == TypeOfPresentation.TRINH_XIN_Y_KIEN'
      class='flex'>
      <div class='col-6'>
        <div class='font-semibold'>
          Nội dung và ý kiến của các cơ quan có liên quan:
        </div>
        <div class='pl-3 py-2'>
          {{ doc.opinion1 }}
        </div>
        <div class='font-semibold'>Ý kiến 2:</div>
        <div class='pl-3 py-2'>
          {{ doc.opinion2 }}
        </div>
        <div class='font-semibold'>Ý kiến 3:</div>
        <div class='pl-3 py-2'>
          {{ doc.opinion3 }}
        </div>
        <div class='font-semibold'>Ý kiến 4:</div>
        <div class='pl-3 py-2'>
          {{ doc.opinion4 }}
        </div>
        <div class='font-semibold'>Ý kiến 5:</div>
        <div class='pl-3 py-2'>
          {{ doc.opinion5 }}
        </div>
        <div class='font-semibold'>Ý kiến 6:</div>
        <div class='pl-3 py-2'>
          {{ doc.opinion6 }}
        </div>
      </div>
      <div class='col-6'>
        <div class='font-semibold'>Ý kiến giải quyết của lãnh đạo:</div>
        <div class='pl-3 py-2'>
          {{ doc.leaderOpinion }}
        </div>
      </div>
    </div>
    <div v-if='doc.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN'>
      <FormQuestion
        v-model:question-model='questions'
        :is-create='false'
        :is-owner='isOwner'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findByIdIn } from '@/apps/document/api/graphql/doc-out';
import { findDocSubmitById } from '@/apps/document/api/graphql/doc-submit';
import { getAnswersQuestionByDocId } from '@/apps/document/api/graphql/question';
import {
  getNumberSubmission,
  getSecurities,
  getTypeOfPresentation,
  TypeOfPresentation,
} from '@/apps/document/model/doc/doc-in';
import type { DocSubmitInput, Question, } from '@/apps/document/model/doc/doc-submit-input';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import FormQuestion from '@/apps/document/views/doc/submit/FormQuestion.vue';
import GridDocs from '@/apps/document/views/doc/submit/GridDocs.vue';
import UploadFilesForDocOut from '@/common/components/custom/UploadFilesForDocOut.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  docId: {
    type: String,
    default: null,
  },
});

const questions = ref([] as Question[]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const doc = ref({} as DocSubmitInput);
const { moment } = useMoment();
const isOwner = computed(() => {
  return (
    userDeptRole.value.userId == doc.value.editorId
    && userDeptRole.value.roleId == doc.value.editorRoleId
    && userDeptRole.value.deptId == doc.value.editorDeptId
  );
});
const flowInstanceId = ref<string>();
const processId = ref<string>();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[doc.value.createdBy],
);

findDocSubmitById(props.docId, userDeptRole.value).onResult((res) => {
  doc.value = res.data.findDocSubmitById;
  doc.value = {
    ...doc.value,
    fromDeptPresent: [doc.value.fromDeptPresentId],
    toDeptPresent: [doc.value.toDeptPresentId],
    docDate: doc.value.docDate ? new Date(doc.value.docDate) : null,
    dateInput: doc.value.dateInput ? new Date(doc.value.dateInput) : null,
    filePresentation: doc.value.filePresentation
      ? doc.value.filePresentation
      : null,
  };

  findByIdIn(userDeptRole.value, doc.value.docOutIds).onResult((response) => {
    doc.value.docOuts = response.data.findByIdIn;
  });

  // questions.value = res.data.findDocSubmitById.questions;
  if (doc.value.docType == TypeOfPresentation.PHIEU_LAY_Y_KIEN) {
    getAnswersQuestionByDocId(doc.value.id, userDeptRole.value).onResult(
      (res) => {
        questions.value = res.data.getAnswersQuestionByDocId;
      },
    );
  }
  flowInstanceId.value = res.data.findDocSubmitById?.process?.flowInstanceId;
  processId.value = res.data.findDocSubmitById?.process?.id;
});
</script>

<style scoped></style>
