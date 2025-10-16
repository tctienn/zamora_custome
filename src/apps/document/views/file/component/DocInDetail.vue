<template>
  <div class='overflow-auto'>
    <div class='flex justify-content-between'>
      <div></div>
      <div class='flex gap-2'>
        <AppUser
          avatar-size='2'
          :user-id='doc.createdBy'/>
        <div>
          <div class='text-sm'>
            {{
              t("document.doc.docInDetail.createBy")
            }}<b>{{ user?.fullName }}</b>
          </div>
          <div class='text-sm'>
            {{ t("document.doc.docInDetail.time") }}
            {{
              doc.createdTime
                ? moment(doc.createdTime).format("HH:mm DD/MM/YYYY")
                : ""
            }}
          </div>
        </div>
      </div>
    </div>

    <div class='flex'>
      <div class='col-4'>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.book") }}<b>{{ doc.bookName }}</b>
        </div>
        <div class='py-2'>
          {{
            t("document.doc.docInDetail.orgOutName")
          }}<b>{{ doc.orgOutName }}</b>
        </div>
        <div class='pt-2'>
          {{ t("document.doc.docInDetail.docCode") }}<b>{{ doc.docCode }}</b>
        </div>
      </div>

      <div class='col-4'>
        <div class='py-2'>
          {{
            t("document.doc.docInDetail.bookNumber")
          }}<b>{{ doc.bookNumber }}</b>
        </div>
        <div class='py-2'>
          {{
            t("document.doc.docInDetail.subBookNumber")
          }}<b>{{ doc.subBookNumber }}</b>
        </div>
        <div class='pt-2'>
          {{ t("document.doc.docInDetail.receiveDate") }}
          <b>{{
            doc.incomingDate
              ? moment(doc.incomingDate).format("DD/MM/YYYY")
              : ""
          }}</b>
        </div>
      </div>

      <div class='col-4'>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.docType") }}
          <b>{{ doc.docTypeName }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.dayDoc") }}
          <b>{{
            doc.docDate ? moment(doc.docDate).format("DD/MM/YYYY") : ""
          }}</b>
        </div>
      </div>
    </div>

    <div class='col-12 flex gap-2 py-0'>
      <label class='align-content-start col-1 field-custom pl-0 pt-0'>{{
        t("document.doc.docInDetail.quote")
      }}</label>
      <b class='word-break-break-word'>{{ doc.quote }}</b>
    </div>

    <div class='flex'>
      <div class='col-4 gap-2'>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.signer") }}
          <b>{{ doc.signerName }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.deadlineDate") }}
          <b>{{
            doc.deadlineDate
              ? moment(doc.deadlineDate).format("DD/MM/YYYY")
              : ""
          }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.requireAnswer") }}
          <b>{{ doc.isRequireAnswer ? "Có" : "Không" }}</b>
        </div>

        <div class='py-2'>
          {{ t("document.doc.docInDetail.numberOfCopy") }}
          <b>{{ doc.numberOfCopy }}</b>
        </div>

        <div class='py-2'>
          {{ t("document.doc.docInDetail.deliveryNumber") }}
          <b>{{ doc.deliveryNumber }}</b>
        </div>
      </div>

      <div class='col-4'>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.securityCode") }}
          <b>{{ doc.securityCode ? getSecurities(doc.securityCode) : "" }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.deadlineNumber") }}
          <b>{{ doc.deadlineNumber }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.isLawDocument") }}
          <b>{{ doc.isLawDocument ? "Có" : "Không" }}</b>
        </div>

        <div class='py-2'>
          {{ t("document.doc.docInDetail.numberOfPage") }}
          <b>{{ doc.numberOfPage }}</b>
        </div>

        <div class='py-2'>
          {{ t("document.doc.docInDetail.isReply") }}
          <b>{{ doc.isReply ? "Có" : "Không" }}</b>
        </div>
      </div>

      <div class='col-4'>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.priorityCode") }}
          <b>{{ getPriorities(doc.priorityCode) }}</b>
        </div>
        <div></div>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.publisherType") }}
          <b>{{
            doc.publisherType ? getMethodRecieves(doc.publisherType) : ""
          }}</b>
        </div>

        <div class='py-2'>
          {{ t("document.doc.docInDetail.isEnvelope") }}
          <b>{{ doc.isEnvelope ? "Có" : "Không" }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.fieldName") }}
          <b>{{ doc.fieldName }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docInDetail.isOnlyLeader") }}
          <b>{{ doc.isOnlyLeader ? "Có" : "Không" }}</b>
        </div>
      </div>
    </div>

    <div
      v-if='
        userDeptRole.roleId == RoleType.TRO_LY ||
          userDeptRole.roleId == RoleType.LANH_DAO
      '
      class='col-12 flex pb-3 pt-0'>
      <label
        class='align-content-center col-2 p-0'
        style='width: auto; display: inline-block'>Xác nhận lại độ mật:
      </label>

      <b
        v-if='userDeptRole.roleId == RoleType.LANH_DAO'
        class='align-content-center ml-2'
        style='
          background: lightgoldenrodyellow;
          width: 9rem;
          height: 2rem;
          text-align: center;
          color: deepskyblue;
          border: 2px solid orange;
        '>{{ getSecurities(reconfirm) }}</b>
    </div>

    <div class='col-12 flex py-0'>
      <label class='align-content-start col-1 field-custom pl-0 pt-0'>{{
        t("document.doc.docInDetail.note")
      }}</label>
      <div class='font-semibold word-break-break-word'>{{ doc.note }}</div>
    </div>

    <div class='flex justify-content-between pt-2'>
      <div class='flex gap-2'>
        <AppIcon
          class='align-content-center'
          name='attach_file'
          size='1.5'/>
        <div class='align-content-center font-semibold text-lg'>
          {{ t("document.doc.docInDetail.attachmentContainContent") }}
        </div>
      </div>
    </div>
    <div>
      <UploadFilesGridWithRadio
        v-model:list-file='attachments'
        :is-view='true'
        :max-height="'100rem'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment/moment';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findByObjectId } from '@/apps/document/api/graphql/attachment';
import { getAllProcessByDocIdForDrawRealFlow } from '@/apps/document/api/graphql/incoming-process';
import { findByDocIdAndLeaderIdAndAssistantId } from '@/apps/document/api/graphql/priority-private';
import { findByUserSupport } from '@/apps/document/api/graphql/user-support';
import { findDocById } from '@/apps/document/api/rest/docIn';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import {
  type DocInInput,
  DocPriority,
  getMethodRecieves,
  getPriorities,
  getSecurities,
} from '@/apps/document/model/doc/doc-in';
import { RoleType } from '@/apps/document/model/permission';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import UploadFilesGridWithRadio from '@/common/components/custom/UploadFilesGridWithRadio.vue';

const props = defineProps({
  docId: {
    type: String,
    default: null,
  },
});

const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const attachments = ref<DocumentAttachment[]>([]);
const doc = ref<DocInInput & { status: string; docInBookStatus: string }>(
    {} as DocInInput & { status: string; docInBookStatus: string },
);
const reconfirm = ref();
const leaderId = ref();
const assistantId = ref();
const incomingProcess = ref([] as InComingProcess[]);
watch(
  () => props.docId,
  (value) => {
    if (value) {
      findDocById(userDeptRole.value, value).then((res: any) => {
        doc.value = res;
        doc.value = {
          ...doc.value,
          docDate: doc.value.docDate ? new Date(doc.value.docDate) : null,
          incomingDate: doc.value.incomingDate
            ? new Date(doc.value.incomingDate)
            : null,
          deadlineDate: doc.value.deadlineDate
            ? new Date(doc.value.deadlineDate)
            : null,
        };
      });
      const { onResult: getAttachmentResult } = findByObjectId(
        value,
        userDeptRole.value,
      );

      getAttachmentResult((res) => {
        attachments.value = res.data.findByObjectId;
      });
      const { onResult: getProcessResult } =
            getAllProcessByDocIdForDrawRealFlow(value, userDeptRole.value);
      getProcessResult((res) => {
        incomingProcess.value = res.data.getAllProcessByDocIdForDrawRealFlow;
      });
    }
  },
  { immediate: true },
);

const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[doc.value.createdBy],
);

if (
  userDeptRole.value.roleId == RoleType.TRO_LY
    || userDeptRole.value.roleId == RoleType.LANH_DAO
) {
  findByUserSupport(userDeptRole.value).onResult(async (res) => {
    leaderId.value = res.data.findByUserSupport.userId;
    assistantId.value = res.data.findByUserSupport.userSupportId;

    if (leaderId.value && assistantId.value) {
      findByDocIdAndLeaderIdAndAssistantId(
        props.docId,
        leaderId.value,
        assistantId.value,
      ).onResult((res) => {
        if (res.data.findByDocIdAndLeaderIdAndAssistantId != null) {
          reconfirm.value =
              res.data.findByDocIdAndLeaderIdAndAssistantId?.priority;
        } else {
          reconfirm.value = DocPriority.BINH_THUONG;
        }
      });
    }
  });
}
</script>

<style scoped></style>
