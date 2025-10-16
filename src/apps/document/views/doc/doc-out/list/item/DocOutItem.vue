<template>
  <div
    v-ripple
    class='align-items-start cursor-pointer document flex gap-2 hover:bg-black-alpha-10 p-2 p-ripple'
    :class='{"doc-selected": selected}'>
    <div class='align-items-center flex flex-column gap-2'>
      <slot
        :doc='model'
        name='sender'>
      </slot>
    </div>
    <div class='flex flex-column flex-grow-1 gap-2'>
      <div class='flex justify-content-between'>
        <div class='align-items-center flex'>
          <AppIcon
            v-if='model?.securityCode'
            v-tooltip='t("document.doc.security." + camelCase(model?.securityCode))'
            :class='classForSecurity(model)'
            name='label_important'
            size='1.5'/>
          <AppIcon
            v-if='model?.priorityCode'
            v-tooltip='t("document.doc.priority." + camelCase(model?.priorityCode))'
            class='mr-1'
            :class='classForPriority(model)'
            name='error'
            size='1.5'/>
          {{ model?.editorDeptName }}
        </div>
        <div class='flex gap-2'>
          <slot
            :doc='model'
            name='date'>
            <div
              v-if='model?.createdTime'
              class='text-sm'>{{ moment(model?.createdTime).format('DD/MM/YYYY') }}
            </div>
          </slot>
          <i
            v-if='model?.deadlineDate'
            v-tooltip='t("document.doc.hasDeadline")'
            class='pi pi-flag'></i></div>
      </div>
      <div class='flex gap-1'>
        <div
          class='flex flex-column flex-grow-1 gap-1'>
          <div
            class='font-semibold word-break-break-word'
            :class='classForQuote(model)'>
            {{ quote }}
          </div>
          <div class='flex justify-content-between text-sm'>
            <span>{{ t('document.doc.code') }}: <b>{{ model?.docCode }}</b> |
              {{ t('document.doc.publishDate') }}:
              <b>{{ model?.docDate ? moment(model?.docDate).format('DD/MM/YYYY') : '' }}</b>
            </span>
            <i
              v-if='model?.hasPrivateComment'
              v-tooltip='t("document.doc.hasPrivateComment")'
              class='pi pi-comments'></i>
          </div>
        </div>
        <div class='actions flex flex-column gap-2 transition-duration-400'>
          <slot
            :doc='model'
            name='action'>

          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { computed, inject, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { DocPriority, DocSecurity } from '@/apps/document/model/doc/doc-in';
import { type DocOut, OutgoingDocStatus, RevokeType } from '@/apps/document/model/doc/doc-out';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  model: {
    type: Object as PropType<DocOut>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
const { moment } = useMoment();
const isReadDoc = inject('isReadDoc', (docIn: DocOut | undefined): boolean | undefined => undefined);
const hasBook = inject('hasBook', (docIn: DocOut | undefined): boolean | undefined => undefined);
const quote = computed(() => {
  return props.model?.quote ? props.model.quote.length > 100 ? props.model?.quote?.substring(0, 100) + '...' : props.model.quote : '';
});

function classForQuote(doc: DocOut | undefined) {
  return {
    'text-blue-500': isReadDoc(doc) === false,
    'text-orange-500': hasBook(doc) === false,
    'text-red-500': doc?.deadlineDate && doc?.status !== OutgoingDocStatus.DA_BAN_HANH && moment(doc.deadlineDate).isBefore(moment(), 'day'),
    'text-red-500 line-through': doc?.status === OutgoingDocStatus.DA_BAN_HANH && doc?.revokeType === RevokeType.CANCEL
  };
}

function classForPriority(doc: DocOut | undefined) {
  switch (doc?.priorityCode) {
  case DocPriority.HOA_TOC:
    return 'text-yellow-500';
  case DocPriority.KHAN:
    return 'text-orange-500';
  case DocPriority.THUONG_KHAN:
    return 'text-red-500';
  default:
    return 'hidden';
  }
}

function classForSecurity(doc: DocOut | undefined) {
  switch (doc?.securityCode) {
  case DocSecurity.MAT:
    return 'text-yellow-500';
  case DocSecurity.TOI_MAT:
    return 'text-orange-500';
  case DocSecurity.TUYET_MAT:
    return 'text-red-500';
  default:
    return 'hidden';
  }
}

</script>

<style scoped>
.doc-selected {
  background-color: var(--table-body-row-hover-bg);

  .publisher-name {
    font-weight: bold;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background-color: var(--primary-color);
  }
}

.document {
  .actions {
    opacity: 0
  }

  &:hover {
    .actions {
      opacity: 1;
    }
  }
}
</style>
