<template>
  <div
    class='flex grid-nogutter p-0 pt-7'>
    <div
      class='p-3 pr-0 relative transition-width'
      :class='expandComment ? "col-9" : "col-12"'>
      <div
        class='overflow-auto pr-1'
        style='height: calc(100vh - 7.5rem)'>
        <div
          class='align-items-center flex font-semibold gap-2 mb-3 text-lg'>
          <i class='pi pi-info-circle text-xl'/>
          Thông tin văn bản
        </div>
        <div class='align-items-end flex gap-2 mb-2 pl-3'>
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
        <div class='flex gap-2 mb-2 pl-3 py-2'>
          <label class=''>Trích yếu:</label>
          <div class='font-bold w-10 word-break-break-word'>
            {{ doc.quote ? doc.quote : '-' }}
          </div>
        </div>
        <div class='flex pl-3 w-full'>
          <div class='left-block w-5'>
            <div class='align-items-center flex gap-2 py-2'>
              <label class=''>Số/Ký hiệu: </label>
              <div class='bg-custom-1	 border-1	 border-dashed	 border-red-400	 border-round-3xl	 font-bold	 px-3	 py-2'>
                {{ doc.docCode ? doc.docCode : '-' }}
              </div>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Loại văn bản: </label>
              <label class='font-bold'>{{ doc.docTypeName ? doc.docTypeName : '-' }} </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Ngày văn bản: </label>
              <label class='font-bold'>{{ doc.docDate ? moment(doc.docDate).format('DD/MM/YYYY') : '' }}</label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Cơ quan ban hành:</label>
              <label class='font-bold'>{{ doc.orgOutName ? doc.orgOutName : '-' }}</label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Người ký:</label>
              <label class='font-bold'>{{ doc.signerName ? doc.signerName : '-' }}</label>
            </div>

            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Lĩnh vực:</label>
              <label class='font-bold'>
                {{
                  doc.areaName ? doc.areaName : '-'
                }}
              </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Độ mật:</label>

              <label class='font-bold w-4'>
                {{ doc.securityCode ? getSecurities(doc.securityCode) : '-' }}
              </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Độ khẩn:</label>

              <label class='font-bold w-4'>
                {{ doc.priorityCode ? getPriorities(doc.priorityCode) : '-' }}
              </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Yêu cầu trả lời:</label>
              <label class='font-bold w-2'>
                {{
                  doc.isRequireAnswer ? 'Có' : 'Không'
                }}
              </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Là văn bản quy phạm pháp luật:</label>
              <label class='font-bold w-3'>
                {{ doc.isLawDocument ? 'Có' : 'Không' }}
              </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Chuyển đích danh lãnh đạo:</label>
              <label class='font-bold'>
                {{ doc.isOnlyLeader ? "Có" : "Không" }}
              </label>
            </div>
          </div>
          <div class='right-block w-6'>
            <div
              class='bg-custom-2 border-1 border-dashed border-green-500 border-round-sm flex flex-column gap-2 p-3'
              style='margin: 0px -13px'>
              <div class='align-content-end'>
                <label class=''>Sổ văn bản:</label>
                <label class='font-bold'>{{ doc.bookName ? doc.bookName : '-' }}</label>
              </div>
              <div class='align-content-end'>
                <label class=''>Số vào sổ:</label>
                <label class='font-bold text-blue-600'>{{ doc.bookNumber ? doc.bookNumber : '-' }}</label>
              </div>
              <div class=''>
                <label class=''>Số phụ:</label>
                <label class='font-bold'>{{ doc.subBookNumber ? doc.subBookNumber : "-" }}</label>
              </div>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Ngày nhận:</label>

              <label class='font-bold'>{{
                doc.incomingDate
                  ? moment(doc.incomingDate).format('DD/MM/YYYY')
                  : ''
              }}</label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Phương thức nhận:</label>
              <label class='font-bold'>
                {{ doc.publisherType ? getMethodRecieves(doc.publisherType) : '-' }}
              </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Chuyển cả bì:</label>
              <label class='font-bold'>
                {{ doc.isEnvelope ? 'Có' : 'Không' }}
              </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Yêu cầu trả lời:</label>
              <label class='font-bold'>
                {{
                  doc.isRequireAnswer ? 'Có' : 'Không'
                }}
              </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Hạn xử lý:</label>
              <label class='font-bold'>{{
                doc.deadlineDate
                  ? moment(doc.deadlineDate).format('DD/MM/YYYY')
                  : '-'
              }}</label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Số chuyển phát:</label>
              <label class='font-bold'>
                {{
                  doc.deliveryNumber ? doc.deliveryNumber : '-'
                }}
              </label>
            </div>
            <div class='flex gap-8 mb-2 py-2'>
              <div class='flex gap-2 mb-2 py-2'>
                <label class=''>Số trang:</label>
                <label class='font-bold'>
                  {{
                    doc.numberOfPage
                  }}
                </label>
              </div>
              <div class='flex gap-2 mb-2 py-2'>
                <label class=''>Số bản:</label>

                <label class='font-bold'>
                  {{ doc.numberOfCopy }}
                </label>
              </div>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Số ngày:</label>

              <label class='font-bold'>
                {{
                  doc.deadlineNumber ? doc.deadlineNumber : 0
                }}
              </label>
            </div>

            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>Hồi báo văn bản:</label>
              <label class='font-bold'>
                {{
                  doc.isReply ? 'Có' : 'Không'
                }}
              </label>
            </div>
          </div>
        </div>
        <div class='flex gap-2 mb-2 pl-3 py-2'>
          <label class=''>Ghi chú:</label>
          <label class='font-bold word-break-break-word'>
            {{ doc.note ? doc.note : '-' }}
          </label>
        </div>

        <div class='flex'>
          <div class='col px-0'>
            <!--            <div class='flex'>-->
            <!--              <AppIcon-->
            <!--                class='align-content-center'-->
            <!--                name='attach_file'-->
            <!--                size='1.5'-->
            <!--                text/>-->
            <!--              <label class='font-bold py-2'>Tệp văn bản số hóa</label>-->
            <!--            </div>-->
            <UploadFilesGridWithRadio
              v-model:list-file='attachments'
              header='Tệp văn bản số hóa'
              :is-view='true'
              :max-height="'100rem'"/>
          </div>
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
      <CommentDocIn
        ref='commentDocInRef'
        :disabled='disabled'
        :doc-id='docId'/>
    </div>
  </div>

</template>

<script lang='ts' setup>

import moment from 'moment/moment';
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, onUnmounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findByObjectId } from '@/apps/document/api/graphql/attachment';
import { getAllProcessByDocIdForDrawRealFlow } from '@/apps/document/api/graphql/incoming-process';
import { findByDocIdAndLeaderIdAndAssistantId, savePriorityPrivate } from '@/apps/document/api/graphql/priority-private';
import { findByUserSupport } from '@/apps/document/api/graphql/user-support';
import { findDocById } from '@/apps/document/api/rest/docIn';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import {
  type DocIn,
  type DocInInput, DocPriority,
  getMethodRecieves,
  getPriorities,
  getSecurities,
  PRIORITIES, SECURITIES
} from '@/apps/document/model/doc/doc-in';
import { RoleType } from '@/apps/document/model/permission';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocIn from '@/apps/document/views/doc/component/comment/comment-doc-in/CommentDocIn.vue';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import ButtonActions from '@/apps/document/views/doc/doc-in/action/ButtonActions.vue';
import NextButtonsInForm from '@/apps/document/views/doc/doc-in/component/next-buttons-infom/NextButtonsInForm.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import UploadFilesGridWithRadio from '@/common/components/custom/UploadFilesGridWithRadio.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  docId: {
    type: String,
    required: true
  }
});
const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const attachments = ref<DocumentAttachment[]>([]);
const doc = ref<DocInInput & { status: string, docInBookStatus: string }>
({} as DocInInput & { status: string, docInBookStatus: string });
const reconfirm = ref();
const leaderId = ref();
const assistantId = ref();
const expandComment = ref(true);
const incomingProcess = ref([] as InComingProcess[]);
watch(() => props.docId, value => {
  if (value) {
    findDocById(userDeptRole.value, value).then((res: any) => {
      doc.value = res;
      doc.value = {
        ...doc.value,
        docDate: doc.value.docDate ? new Date(doc.value.docDate) : null,
        incomingDate: doc.value.incomingDate ? new Date(doc.value.incomingDate) : null,
        deadlineDate: doc.value.deadlineDate ? new Date(doc.value.deadlineDate) : null
      };
    });
    const { onResult: getAttachmentResult } = findByObjectId(value, userDeptRole.value);

    getAttachmentResult((res) => {
      attachments.value = res.data.findByObjectId;
    });
    const { onResult: getProcessResult } = getAllProcessByDocIdForDrawRealFlow(value, userDeptRole.value);
    getProcessResult((res) => {
      incomingProcess.value = res.data.getAllProcessByDocIdForDrawRealFlow;
    });
  }

}, { immediate: true });

const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[doc.value.createdBy],
);

if (userDeptRole.value.roleId == RoleType.TRO_LY || userDeptRole.value.roleId == RoleType.LANH_DAO) {
  findByUserSupport(userDeptRole.value).onResult(async (res) => {
    leaderId.value = res.data.findByUserSupport.userId;
    assistantId.value = res.data.findByUserSupport.userSupportId;

    if (leaderId.value && assistantId.value) {
      findByDocIdAndLeaderIdAndAssistantId(props.docId, leaderId.value, assistantId.value).onResult((res) => {
        if (res.data.findByDocIdAndLeaderIdAndAssistantId != null) {
          reconfirm.value = res.data.findByDocIdAndLeaderIdAndAssistantId?.priority;
        } else {
          reconfirm.value = DocPriority.BINH_THUONG;
        }
      });
    }
  });
}

const commentDocInRef = ref<InstanceType<typeof CommentDocIn> | null>(null);
defineExpose({
  doc,
  commentDocInRef
});
const disabled = inject('disableComment', false);

function saveConfirm() {
  let priorityPrivate: any = {};
  priorityPrivate.docId = props.docId;
  priorityPrivate.leaderId = leaderId.value;
  priorityPrivate.assistantId = userDeptRole.value.userId;
  priorityPrivate.priority = reconfirm.value;
  savePriorityPrivate().mutate({ priorityPrivate: priorityPrivate }).then(() => {
    toastSuccess({ message: 'Xác nhận độ mật thành công.' });
  });
}

function expandCommentFn() {
  expandComment.value = !expandComment.value;
}

// function action(actionCode: DocumentAction) {
//   if (actionCode === DocumentAction.ASK_FOR_OPINION) {
//     commentDocInRef.value.loadComments();
//   }
// }

watch(() => props.docId, (value) => {
  // if (value) {
  //   if (userDeptRole.value.roleId == RoleType.TRO_LY || userDeptRole.value.roleId == RoleType.LANH_DAO) {
  //     if (leaderId.value && assistantId.value) {
  //       findByDocIdAndLeaderIdAndAssistantId(props.docId, leaderId.value, assistantId.value).onResult((res) => {
  //         if (res.data.findByDocIdAndLeaderIdAndAssistantId != null) {
  //           reconfirm.value = res.data.findByDocIdAndLeaderIdAndAssistantId?.priority;
  //         } else {
  //           reconfirm.value = DocPriority.BINH_THUONG;
  //         }
  //       });
  //     }
  //   }
  // }
});

onMounted(() => {
  EventBus.on('expand-doc-in-detail', expandCommentFn);
});

onUnmounted(() => {
  EventBus.off('expand-doc-in-detail', expandCommentFn);
});
</script>

<style scoped>
.btnBack {
  background: green;
}

&:hover {
  .btnBack {
    background: red;
  }
}

.field-custom {
  display: inline-block;
  width: auto;
}

.transition-width {
  transition: width 0.3s ease-in-out;
}
.bg-custom-2 {
  background-color: #E6F4E7;
}
.bg-custom-1 {
  background-color: #FDF8E2;
}
</style>