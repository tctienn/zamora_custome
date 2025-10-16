<template>
  <div
    v-ripple
    class='align-items-start cursor-pointer document flex gap-2 hover:bg-black-alpha-10 p-2 p-ripple'
    :class='{"doc-selected": selected}'>

    <div class='align-items-center flex flex-column gap-2'>
      <slot
        :doc='model'
        name='sender'>
        <AppUserDeptRole
          v-if='model?.process'
          avatar-size='2.5'
          overlay-visible
          :user-dept-role='processUseDeptRole(model)'/>
        <div class='flex'>
          <i
            v-if='model?.process?.processType === DocOutProcessType.PHOI_HOP'
            v-tooltip='t("document.doc.coordinatedProcessing")'
            class='pi pi-users'></i>
        </div>
      </slot>
    </div>

    <div class='flex flex-column flex-grow-1 gap-2'>
      <div class='flex justify-content-between'>
        <div class='align-items-center flex'>
          <!--          <AppIcon-->
          <!--            v-tooltip='t("document.doc.security." + camelCase(model?.securityCode))'-->
          <!--            :class='classForSecurity(model)'-->
          <!--            name='label_important'-->
          <!--            size='1.5'/>-->
          <!--          <AppIcon-->
          <!--            v-tooltip='t("document.doc.priority." + camelCase(model?.priorityCode))'-->
          <!--            class='mr-1'-->
          <!--            :class='classForPriority(model)'-->
          <!--            name='error'-->
          <!--            size='1.5'/>-->
          {{ model?.editorDeptName }}
        </div>
        <div class='flex gap-2'>
          <slot
            :doc='model'
            name='date'>
            <div
              v-if='model?.process?.sendTime'
              class='text-sm'>{{ moment(model?.process?.sendTime).format('DD/MM/YYYY HH:mm') }}
            </div>
          </slot>
          <!--          <i-->
          <!--            v-if='model?.deadlineDate'-->
          <!--            v-tooltip='t("document.doc.hasDeadline")'-->
          <!--                      class='pi pi-flag'></i>-->
        </div>
      </div>
      <div class='flex gap-1'>
        <div
          class='flex flex-column flex-grow-1 gap-1'>
          <div
            class='font-semibold word-break-break-word'
            :class='classForQuote(model)'>
            {{ model?.about }}
          </div>
          <div class='text-sm'>{{ t('document.doc.number') }}: <b>{{ model?.number }}</b> |
            {{ t('document.doc.createdDate') }}:
            <b>{{ model?.dateInput ? moment(model?.dateInput).format('DD/MM/YYYY') : '' }}</b>
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

import { inject, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { DocOutProcessType } from '@/apps/document/model/process/outgoing';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  model: {
    type: Object as PropType<DocSubmit>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const { moment } = useMoment();

function processUseDeptRole(doc: DocSubmit | undefined) {
  if (doc?.process) {
    return {
      userId: doc.process.senderId,
      deptId: doc.process.senderDeptId,
      roleId: doc.process.senderRoleId,
      userName: doc.process.senderName,
      deptName: doc.process.senderDeptName,
      roleName: doc.process.senderRoleName
    } as UserDeptRoleInput;
  }
}

const isReadDoc = inject('isReadDoc', (doc: DocSubmit | undefined): boolean | undefined => undefined);

function classForQuote(doc: DocSubmit | undefined) {
  return {
    'text-blue-500': isReadDoc(doc) === false,
    // 'text-red-500': doc?.deadlineDate && doc?.status !== StatusEnum.DA_XL && moment(doc.deadlineDate).isBefore(moment(), 'day')
  };
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