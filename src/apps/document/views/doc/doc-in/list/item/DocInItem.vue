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
            v-if='model?.process?.processType === ProcessType.PHOI_HOP'
            v-tooltip='t("document.doc.coordinatedProcessing")'
            class='pi pi-users'></i>
        </div>
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
          <span class='publisher-name'>{{ model?.publisherName }}</span>
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
          <i
            v-if='model?.deadlineDate'
            v-tooltip='t("document.doc.hasDeadline")'
            class='pi pi-flag'></i></div>
      </div>
      <div class='flex gap-1'>
        <div
          class='flex flex-column flex-grow-1 gap-1'>
          <div
            class='font-semibold quote-title word-break-break-word'
            :class='classForQuote(model)'>
            {{ quote }}
          </div>
          <div class='flex justify-content-between text-sm'>
            <span>{{ t('document.doc.code') }}: <b>{{ model?.docCode }}</b> |
              {{ t('document.doc.publishDate') }}:
              <b>{{ model?.docDate ? moment(model?.docDate).format('DD/MM/YYYY') : '' }}</b>
            </span>
            <div class='flex gap-2'>
              <i
                v-if='model?.hasPrivateComment'
                v-tooltip='t("document.doc.hasPrivateComment")'
                class='pi pi-comments'></i>
              <AppIcon
                v-if='model?.hasTaskCreated'
                v-tooltip='t("Có công việc được khởi tạo")'
                name='work'
                size='1.1'
                @click='showTask($event)'/>
            </div>
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

    <Menu
      ref='taskMenuRef'
      :model='listTask'
      popup>
      <template #start>
        <span class='font-semibold m-3'>
          Danh sách công việc
        </span>
        <Divider class='my-2'/>
      </template>
      <template #item='{item}'>
        <MenuItem :label='item.label'>

        </MenuItem>
      </template>
    </Menu>
  </div>

</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import type Menu from 'primevue/menu';
import type { MenuItem as MenuItemType } from 'primevue/menuitem';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { type DocIn, DocPriority, DocSecurity, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { StatusEnum } from '@/apps/document/model/docInBook';
import { ProcessType } from '@/apps/document/model/process/incoming';
import { getTasksCreatedByOriginObject } from '@/apps/work/api/graphql/task-api';
import { OriginModule, type Task, type TaskOriginObject } from '@/apps/work/model/task';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  model: {
    type: Object as PropType<DocIn>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
const { moment } = useMoment();
const router = useRouter();

function processUseDeptRole(doc: DocIn | undefined) {
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

const quote = computed(() => {
  return props.model?.quote ? props.model.quote.length > 100 ? props.model?.quote?.substring(0, 100) + '...' : props.model.quote : '';
});

const isReadDoc = inject('isReadDoc', (docIn: DocIn | undefined): boolean | undefined => undefined);

const listTask = ref<MenuItemType[]>();
const taskMenuRef = ref<InstanceType<typeof Menu> | null>(null);

function showTask(event: Event) {
  taskMenuRef.value?.toggle(event);

  const variables: TaskOriginObject = {
    originCreatedId: props.model?.id,
    originCreatedType: OriginModule.DOCUMENT
  };
  getTasksCreatedByOriginObject(variables)
    .onResult(res => {
      listTask.value = res.data.getTasksCreatedByOriginObject?.map((e: Task): MenuItemType => ({
        key: e.id,
        label: e.name,
        command: () => {
          router.push({ name: 'TaskManager' });
          // const routeData = router.resolve({ name: 'TaskManager' });
          // window.open(routeData.href);
        }
      }));
    });
}

function classForQuote(doc: DocIn | undefined) {
  return {
    'text-blue-500': isReadDoc(doc) === false,
    'text-red-500': doc?.deadlineDate && doc?.status !== StatusEnum.DA_XL && moment(doc.deadlineDate).isBefore(moment(), 'day')
  };
}

function classForPriority(doc: DocIn | undefined) {
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

function classForSecurity(doc: DocIn | undefined) {
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
