<template>
  <div
    class='flex grid-nogutter p-0'>
    <div
      class='p-3 pr-0 relative transition-width'
      :class='expandComment ? "col-9" : "col-12"'>
      <div
        class='overflow-auto pr-1'
        style='height: calc(100vh - 7.5rem)'>
        <div class=''>
          <div
            class='align-items-center flex font-semibold gap-2 mb-3 text-lg'>
            <i
              class='pi pi-info-circle text-xl'
              style='margin-top: 1px'/>
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
        </div>
        <div class='flex gap-2 mb-2 pl-3 py-2'>
          <label class=''>Trích yếu:</label>
          <div class='font-bold w-10 word-break-break-word'>
            {{ doc.quote ? doc.quote : '-' }}
          </div>
        </div>
        <div class='flex gap-5 pl-3 w-full'>
          <div class='left-block w-6'>
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
              <label class=''>{{ t('document.doc.docOut.issuerDept') }}: </label>
              <label class='font-bold w-10'>{{ doc.issuerDeptName ? doc.issuerDeptName : '-' }} </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>{{ t('document.doc.docOut.deptName') }}: </label>
              <label class='font-bold'>{{ doc.editorDeptName ? doc.editorDeptName : '-' }} </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>{{ t('document.doc.docOut.userName') }}: </label>
              <label class='font-bold'>{{ doc.editorName ? doc.editorName : '-' }} </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>{{ t('document.doc.docOut.areaId') }}: </label>
              <label class='font-bold'>{{ doc.areaName ? doc.areaName : '-' }} </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>{{ t('document.doc.docOut.securityCode') }}: </label>
              <label class='font-bold'>{{ doc.securityCode ? getSecurities(doc.securityCode) : '-' }} </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>{{ t('document.doc.docOut.priorityCode') }}: </label>
              <label class='font-bold'>{{ doc.priorityCode ? getPriorities(doc.priorityCode) : '-' }} </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>{{ t('document.doc.docOut.isReply') }}: </label>
              <label class='font-bold'>{{ doc.isReply ? 'Có' : 'Không' }} </label>
            </div>
            <div class='flex gap-2 mb-2 py-2'>
              <label class=''>{{ t('document.doc.docOut.isLawDocument') }}: </label>
              <label class='font-bold'>{{ doc.isLawDocument ? 'Có' : 'Không' }} </label>
            </div>
          </div>
          <div class='right-block w-5'>
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
              <label class=''>Số ngày xử lý:</label>
              <label class='font-bold'>
                {{
                  doc.deadlineNumber ? doc.deadlineNumber : '-'
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

          <div
            v-if='doc?.incomingDoc'
            class='col-3 py-2'>
            <div class='py-2'>
              {{ t('document.doc.docOut.viewFileMain') }}:
            </div>
            <div style='background: #FFFADF'>
              <div class='p-2'>
                <div class='gap-4'>
                  <div class='flex gap-2'>
                    <label>{{ t('document.doc.docOut.number') }}:</label>
                    <p
                      class='font-semibold'
                      style='color: blue'>{{ doc?.incomingDoc?.docCode }}</p>
                  </div>
                  <div class='flex gap-2'>
                    <label>{{ t('document.doc.docOut.date') }}:</label>
                    <p class='font-semibold'>{{ moment(doc?.incomingDoc?.docDate).format('DD-MM-YYYY') }}</p>
                  </div>
                </div>
                <div>
                  {{ doc.quote }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class='col-12 flex py-2'>
          <label class='align-content-start col-1 field-custom pl-0 pt-0'>{{ t('document.doc.docOut.advice') }}:</label>
          <b class='word-break-break-word'>{{ doc.advice }}</b>
        </div>

        <div class='flex justify-content-between mb-2 pt-2'>
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
        <div class='flex flex-column gap-2 pl-2'>
          <div class='mb-2'>
            <UploadFilesGridWithRadio
              v-model:list-file='attachmentCloneFromProp'
              header='1. Văn bản dự thảo - Ký số ban hành'
              :is-view='true'
              :max-height="'100rem'"/>
          </div>

          <div>
            <UploadFilesForDocOut
              v-model:list-file='relatedDocumentsCloneFromProp'
              :file-attachments-name="'relatedDocuments'"
              header='2. Tài liệu liên quan'
              :is-view='true'
              :max-height="'100rem'"/>
          </div>
        </div>
      </div>

    </div>
    <Divider
      v-if='expandComment'
      layout='vertical'/>

    <div
      v-if='expandComment'
      class='col flex flex-column p-3 w-0'>
      <CommentDocOut
        :disabled='disabled'
        :doc-id='docId'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, onUnmounted, type PropType, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getAllOrganizationPublicGraphql, } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getAllField } from '@/apps/document/api/graphql/field';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { getMethodRecieves, getPriorities, getSecurities } from '@/apps/document/model/doc/doc-in';
import { type DocOutInput } from '@/apps/document/model/doc/doc-out';
import type { DocTypeInterface } from '@/apps/document/model/docType';
import type { FieldInterface } from '@/apps/document/model/field';
import { OrganizationType } from '@/apps/document/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocOut from '@/apps/document/views/doc/component/comment/comment-doc-out/CommentDocOut.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import UploadFilesForDocOut from '@/common/components/custom/UploadFilesForDocOut.vue';
import UploadFilesGridWithRadio from '@/common/components/custom/UploadFilesGridWithRadio.vue';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  doc: {
    type: Object as PropType<DocOutInput>,
    default: {} as DocOutInput
  },
  disable: {
    type: Boolean,
    default: false
  },
  relatedDocuments: {
    type: Array as PropType<DocumentAttachment[]>,
    default: [] as DocumentAttachment[]
  },
  attachments: {
    type: Array as PropType<DocumentAttachment[]>,
    default: [] as DocumentAttachment[]
  },
  optionsTree: {
    type: Array as PropType<{ label: string, value: any }[]>,
    default: [] as { label: string, value: any }[]
  },
  docId: {
    type: String,
    default: null
  }
});
const route = useRoute();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const orgs = ref<{ label: string, value: string }[]>([]);
const docTypes = ref<DocTypeInterface[]>([] as DocTypeInterface[]);
const fields = ref<FieldInterface[]>([] as FieldInterface[]);
const { t } = useI18n();
const { moment } = useMoment();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[props.doc.lastModifiedBy],
);
const attachmentCloneFromProp = ref();
const relatedDocumentsCloneFromProp = ref();
const optionsTreeDocumentsCloneFromProp = ref();
const receives = ref();
const disabled = inject('disableComment', false);

const { onResult: getDocTypeResult } = getAllDocType();
const { onResult: getFieldResult } = getAllField();

getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;
});

getFieldResult((res) => {
  fields.value = res.data.getAllField;
});

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

watchEffect(() => {
  relatedDocumentsCloneFromProp.value = props.relatedDocuments;
});

watchEffect(() => {
  attachmentCloneFromProp.value = props.attachments;
});

watchEffect(() => {
  optionsTreeDocumentsCloneFromProp.value = props.optionsTree.map(e => e.label).join(', ');
});

const expandComment = ref(true);
function expandCommentFn() {
  expandComment.value = !expandComment.value;
}

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

<script lang='ts'>
export default { name: 'PromulgateMoreDetail' };
</script>