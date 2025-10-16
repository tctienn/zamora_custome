<template>
  <div class='overflow-auto'>
    <div class='flex justify-content-between'>
      <div class='flex gap-2'></div>
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

    <div class='flex py-2'>
      <div class='col-3 py-2'>
        <div class='py-2'>
          {{ t("document.doc.docOut.deptName") }}:
          <b>{{ doc.editorDeptName }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docOut.docTypeId") }}: <b>{{ doc.docTypeName }}</b>
        </div>
      </div>

      <div class='col-3 py-2'>
        <div class='py-2'>
          {{ t("document.doc.docOut.userName") }}: <b>{{ doc.editorName }}</b>
        </div>
        <div class='py-2'>
          {{ t("document.doc.docOut.deadlineDate") }}:
          <b>{{
            doc.deadlineDate
              ? moment(doc.deadlineDate).format("DD/MM/YYYY")
              : ""
          }}</b>
        </div>
      </div>

      <div class='col-3 py-2'>
        <div></div>
        <div class='py-2'>
          Số ngày xử lý: <b>{{ doc.deadlineNumber }}</b>
        </div>
      </div>
      <div
        v-if='doc?.incomingDoc'
        class='col-3 py-2'>
        <div class='py-2'>{{ t("document.doc.docOut.viewFileMain") }}:</div>
        <div style='background: #fffadf'>
          <div class='p-2'>
            <div class='gap-4'>
              <div class='flex gap-2'>
                <label>{{ t("document.doc.docOut.number") }}:</label>
                <p
                  class='font-semibold'
                  style='color: blue'>
                  {{ doc?.incomingDoc?.docCode }}
                </p>
              </div>
              <div class='flex gap-2'>
                <label>{{ t("document.doc.docOut.date") }}:</label>
                <p class='font-semibold'>
                  {{ moment(doc?.incomingDoc?.docDate).format("DD-MM-YYYY") }}
                </p>
              </div>
            </div>
            <div>
              {{ quote }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class='col-12 flex py-2'>
      <label class='align-content-start col-1 field-custom pl-0 pt-0'>{{ t("document.doc.docOut.quote") }}:</label>
      <b class='word-break-break-word'>{{ doc.quote }}</b>
    </div>

    <div class='flex'>
      <div class='col-6 py-2'>
        {{ t("document.doc.docOut.issuerDept") }}:
        <b>{{ doc.issuerDeptName }}</b>
      </div>

      <div class='col-6 py-2'>
        {{ t("document.doc.docOut.areaId") }}: <b>{{ doc.areaName }}</b>
      </div>
    </div>

    <div class='flex py-2'>
      <div class='col-6 py-2'>
        {{ t("document.doc.docOut.securityCode") }}:
        <b>{{ doc.securityCode ? getSecurities(doc.securityCode) : "" }}</b>
      </div>

      <div class='col-6 py-2'>
        {{ t("document.doc.docOut.priorityCode") }}:
        <b>{{ doc.priorityCode ? getPriorities(doc.priorityCode) : "" }}</b>
      </div>
    </div>

    <div class='flex py-2'>
      <div class='col-6 py-2'>
        {{ t("document.doc.docOut.numberOfCopy") }}:
        <b>{{ doc.numberOfCopy }}</b>
      </div>

      <div class='col-6 py-2'>
        {{ t("document.doc.docOut.numberOfPage") }}:
        <b>{{ doc.numberOfPage }}</b>
      </div>
    </div>

    <div class='col-12 flex py-2'>
      <label class='align-content-start col-1 field-custom pl-0 pt-0'>{{ t("document.doc.docOut.advice") }}:</label>
      <b class='word-break-break-word'>{{ doc.advice }}</b>
    </div>

    <div class='flex'>
      <div class='col-6 py-2'>
        {{ t("document.doc.docOut.isReply") }}:
        <b>{{ doc.isReply ? "Có" : "Không" }}</b>
      </div>

      <div class='col-6 py-2'>
        {{ t("document.doc.docOut.isLawDocument") }}:
        <b>{{ doc.isLawDocument ? "Có" : "Không" }}</b>
      </div>
    </div>

    <div class='flex justify-content-between pt-2'>
      <div class='flex gap-2'>
        <AppIcon
          class='align-content-center'
          name='attach_file'
          size='1.5'/>
        <div class='align-content-center font-semibold text-lg'>
          Hồ sơ, tài liệu đính kèm
        </div>
      </div>
    </div>
    <div class='flex flex-column gap-3 pl-2'>
      <UploadFilesGridWithRadio
        v-model:list-file='attachments'
        header='1. Văn bản dự thảo - Ký số ban hành'
        :is-view='true'
        :max-height="'100rem'"/>

      <UploadFilesForDocOut
        v-model:list-file='relatedDocuments'
        :file-attachments-name="'relatedDocuments'"
        header='2. Tài liệu liên quan'
        :is-view='true'
        :max-height="'100rem'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findDocOutByIdGraph } from '@/apps/document/api/graphql/doc-out';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { getPriorities, getSecurities } from '@/apps/document/model/doc/doc-in';
import type { DocOutInput } from '@/apps/document/model/doc/doc-out';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import UploadFilesForDocOut from '@/common/components/custom/UploadFilesForDocOut.vue';
import UploadFilesGridWithRadio from '@/common/components/custom/UploadFilesGridWithRadio.vue';

const props = defineProps({
  docId: {
    type: String,
    required: true,
  },
});
const { t } = useI18n();
const { userDeptRole: userDeptRoleStore } = storeToRefs(
  useDocumentRolesStore(),
);
const attachments = ref<DocumentAttachment[]>([]);
const doc = ref<DocOutInput>({} as DocOutInput);
const relatedDocuments = ref([] as DocumentAttachment[]);
const { onResult, variables } = findDocOutByIdGraph(
  userDeptRoleStore.value,
  props.docId,
);
const quote = computed(() => {
  const quoteText = doc.value?.incomingDoc?.quote;
  return quoteText && quoteText.length > 30
    ? doc.value?.incomingDoc?.quote?.substring(0, 30) + '...'
    : doc.value?.incomingDoc?.quote;
});

onResult((res) => {
  doc.value = res.data.findByDocOutById;
  doc.value = {
    ...doc.value,
    deadlineDate: doc.value.deadlineDate
      ? new Date(doc.value.deadlineDate)
      : null,
  };
  relatedDocuments.value = doc.value.outGoingFilesRelate;
  attachments.value = doc.value.outGoingAttachments;
});
watch(
  () => props.docId,
  (value) => {
    variables.value = {
      userDeptRole: userDeptRoleStore.value,
      id: value,
    };
  },
  { immediate: true },
);
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[doc.value.createdBy],
);
</script>

<style scoped></style>
