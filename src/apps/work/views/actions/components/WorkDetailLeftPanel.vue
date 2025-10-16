<template>
  <div class='flex flex-column row-gap-2 w-30rem'>
    <div class='flex flex-column left-information-panel overflow-y-auto row-gap-2'>
      <div class='p-fluid'>
        <div class='field'>
          <label class='font-bold'>
            {{ t('work.task.deliver') }}
          </label>
          <Dropdown
            v-model='task.assignerId'
            :disabled='!permission.isUpdateInfo'
            input-class='py-2'
            input-id='assigner'
            option-value='id'
            :options='users'
            show-clear>
            <template #option='{ option }'>
              <AppUser
                :infos='["email"]'
                :overlay-visible='false'
                :user='option'/>
            </template>
            <template #value='{ value }'>
              <AppUser
                v-if='value'
                avatar-size='1.5'
                class='w-fit'
                :info-visible='false'
                :user='users.find(u=>u.id === value)'/>
            </template>
          </Dropdown>
        </div>

        <div class='field'>
          <label class='font-bold'>
            {{ t('work.task.implementer') }}
          </label>
          <MultiSelect
            v-model='task.implementer'
            class='text-sm'
            data-key='id'
            :disabled='!permission.isUpdateImplementer'
            display='chip'
            filter
            :options='users'
            show-clear>

            <template #option='{ option }'>
              <AppUser
                :infos='["email"]'
                :overlay-visible='false'
                :user='option'/>
            </template>
            <template #chip='{ value }'>
              <AppUser
                avatar-size='1'
                :user='value'/>
            </template>
          </MultiSelect>
        </div>
        <div
          v-if='taskFields.includes("cooperator")'
          class='field'>
          <label class='font-bold'>
            {{ t('work.task.coordinator') }}
          </label>
          <MultiSelect
            v-model='task.cooperator'
            class='text-sm'
            data-key='id'
            :disabled='!permission.isUpdateCooperator'
            display='chip'
            filter
            :options='users'
            show-clear>
            <template #option='{ option }'>
              <AppUser
                :infos='["email"]'
                :overlay-visible='false'
                :user='option'/>
            </template>
            <template #chip='{ value }'>
              <AppUser
                avatar-size='1'
                :user='value'/>
            </template>
          </MultiSelect>
        </div>
        <div
          v-if='taskFields.includes("supervisor")'
          class='field font-bold'>
          <label>
            {{ t('work.task.supervisor') }}
          </label>
          <MultiSelect
            v-model='task.supervisor'
            class='text-sm'
            data-key='id'
            :disabled='!permission.isUpdateSupervisor'
            display='chip'
            filter
            :options='users'
            show-clear>
            <template #option='{ option }'>
              <AppUser
                :infos='["email"]'
                :overlay-visible='false'
                :user='option'/>
            </template>
            <template #chip='{ value }'>
              <AppUser
                avatar-size='1'
                :user='value'/>
            </template>
          </MultiSelect>
        </div>

        <div
          v-if='taskFields.includes("assessorId")'
          class='field'>
          <label class='font-bold'>
            {{ t('work.assessorId') }}
          </label>
          <Dropdown
            v-model='task.assessorId'
            :disabled='!permission.isUpdateAssessor'
            input-class='py-2'
            input-id='assessor'
            option-value='id'
            :options='users'
            show-clear>
            <template #option='{ option }'>
              <AppUser
                :infos='["email"]'
                :overlay-visible='false'
                :user='option'/>
            </template>
            <template #value='{ value }'>
              <AppUser
                v-if='value'
                avatar-size='1.5'
                class='w-fit'
                :info-visible='false'
                :user='users.find(u=>u.id === value)'/>
            </template>
          </Dropdown>
        </div>

        <div class='field'>
          <label class='font-bold'>
            {{ t('work.task.dateOfAssignment') }}
          </label>
          <div class='pl-2'>{{ moment(task.createdTime).format('DD/MM/YYYY') }}</div>
        </div>

        <!--        <div class='field'>-->
        <!--          <label class='font-bold'>-->
        <!--            {{ t('work.task.implementationObject') }}-->
        <!--          </label>-->
        <!--          <Dropdown-->
        <!--            v-model='task.type'-->
        <!--            :empty-message='t("common.selectEmpty")'-->
        <!--            :filter='true'-->
        <!--            option-label='name'-->
        <!--            option-value='value'-->
        <!--            :options='getImplementObject()'-->
        <!--            :placeholder='t("work.task.implementationObject")'-->
        <!--          />-->
        <!--        </div>-->

        <div
          v-if='taskFields.includes("isImportant")'
          class='field-checkbox font-bold'>
          <Checkbox
            v-model='task.isImportant'
            :binary='true'
            input-id='isImportant'/>
          <label
            class='ml-2'
            for='isImportant'> {{ t('work.task.importantMatter') }} </label>
        </div>

        <div
          v-if='taskFields.includes("remind")'
          class='field-checkbox font-bold'>
          <Checkbox
            v-model='task.remind'
            :binary='true'
            input-id='remind'/>
          <label
            class='ml-2'
            for='remind'> {{ t('work.task.completionReminder') }} </label>
        </div>

        <div
          v-if='taskFields.includes("needEvaluate")'
          class='field-checkbox font-bold'>
          <Checkbox
            v-model='task.needEvaluate'
            :binary='true'
            input-id='needEvaluate'/>
          <label
            class='ml-2'
            for='needEvaluate'> {{ t('work.task.thingsToEvaluate') }} </label>
        </div>

        <div
          v-if='taskFields.includes("type")'
          class='field font-bold'>
          <label>
            {{ t('work.task.originOfWork') }}
          </label>

          <Dropdown
            v-model='task.type'
            disabled
            :empty-message='t("common.selectEmpty")'
            :filter='true'
            input-class='py-2'
            input-id='categoryStatus'
            option-label='name'
            option-value='value'
            :options='getTaskSource()'/>

          <!--          <InputText class='mt-2 py-2'/>-->
        </div>

        <div
          v-if='taskFields.includes("parentId")'
          class='field font-bold'>
          <TaskParentComponent
            v-if='task.parent'
            :parent='task.parent'
            @update-parent='updateParent'/>
        </div>

        <div
          v-if='taskFields.includes("isRepeat")'
          class='field font-bold'>
          <TaskRepeatComponent
            v-if='task.repeatConfig'
            v-model:repeat-config='task.repeatConfig'
            :editable='permission.isUpdateInfo'
            :is-repeat='task?.isRepeat ?? false'
            small/>
          <template v-else>
            <Checkbox
              v-model='task.isRepeat'
              :binary='true'
              input-id='remind'/>
            <label class='ml-2'> {{ t('work.task.iteration') }} </label>
          </template>

        </div>
        <div
          v-if='taskFields.includes("taskCustomers")'
          class='field'>
          <label
            class='field font-bold'
            for='customer'>
            {{ t('work.task.customer') }}
          </label>
          <MultiSelect
            v-model='taskCustomers'
            filter
            input-id='client'
            option-label='clientName'
            :options='clients'
            show-clear>
          </MultiSelect>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllClientGraphql } from '@/apps/work/api/graphql/client-tenant-graphql-api';
import type { ClientInterface } from '@/apps/work/model/client';
import type { PermissionTask } from '@/apps/work/model/permission';
import { SourceType, type Task, type TaskRepeatConfig } from '@/apps/work/model/task';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import TaskParentComponent from '@/apps/work/views/actions/components/task/TaskParentComponent.vue';
import TaskRepeatComponent from '@/apps/work/views/actions/components/task/TaskRepeatComponent.vue';
import { User } from '@/common/model/User';

defineProps({
  taskFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  permission: {
    type: Object as PropType<PermissionTask>,
    default: {} as PermissionTask
  },
});

const { task } = storeToRefs(useTaskDetailStore());

task.value = {
  ...task.value,
  repeatConfig: task.value.repeatConfig ? task.value.repeatConfig : {} as TaskRepeatConfig
};
const users = inject('all-active-user', ref<User[]>([]));
watch(() => users.value, () => {
  task.value.implementer = task.value.participants?.filter(user => user.type == 'IMPLEMENTER').map(user1 => {
    const user2 = users.value.find(user2 => user2.id == user1.participantId);
    return {
      id: user1.participantId,
      fullName: user1.participantName,
      email: user1.participantEmail,
      avatar: user1.participantAvatar,
      username: user2?.username
    };
  });

  task.value.cooperator = task.value.participants?.filter(user => user.type == 'COOPERATOR').map(user1 => {
    const user2 = users.value.find(user2 => user2.id == user1.participantId);
    return {
      id: user1.participantId,
      fullName: user1.participantName,
      email: user1.participantEmail,
      avatar: user1.participantAvatar,
      username: user2?.username
    };
  });

  task.value.supervisor = task.value.participants?.filter(user => user.type == 'SUPERVISOR').map(user1 => {
    const user2 = users.value.find(user2 => user2.id == user1.participantId);
    return {
      id: user1.participantId,
      fullName: user1.participantName,
      email: user1.participantEmail,
      avatar: user1.participantAvatar,
      username: user2?.username
    };
  });

  // task.value.supervisor = users.value.filter(user => user.id == task.value.assignerId).map(user1 => {
  //   return {
  //     id: user1.id,
  //     fullName: user1.fullName,
  //     email: user1.email,
  //     avatar: user1.avatar,
  //     username: user1.username
  //   };
  // });
});

function getTaskSource() {
  return [
    {
      name: t('work.sources.none'),
      value: SourceType[SourceType.NONE]
    },
    {
      name: t('work.sources.project'),
      value: SourceType[SourceType.PROJECT]
    },
    {
      name: t('work.sources.document'),
      value: SourceType[SourceType.DOCUMENT]
    },
    {
      name: t('work.sources.board'),
      value: SourceType[SourceType.BOARD]
    },
    {
      name: t('work.sources.workFlow'),
      value: SourceType[SourceType.WORK_FLOW]
    }
  ];
}

function getImplementObject() {
  return [
    {
      name: t('work.task.individual'),
      value: 'Cá nhân'
    }, {
      name: t('work.task.organization'),
      value: 'Đơn vị'
    }
  ];
}

function updateParent(value: Task | null) {
  task.value.parent = value;
  task.value.parentId = value?.id;
}

const clients = ref<ClientInterface[]>([]);
const taskCustomers = ref<ClientInterface[] | any>([]);
const {
  refetch: getAllClientRefetch,
  onResult: getAllClientOnResult
} = getAllClientGraphql();

getAllClientOnResult(async (result) => {
  clients.value = await get(result, 'data.allClient', []);
  taskCustomers.value = task.value.taskCustomers?.map(customer => {
    const client = clients.value.find(client => client.id == customer.clientId);
    return {
      id: client?.id,
      city: client?.city,
      clientCode: client?.clientCode,
      clientName: client?.clientName,
      address: client?.address,
      email: client?.email,
      field: client?.field,
      foundingDate: client?.foundingDate,
      groupClient: client?.groupClient,
      home: client?.home,
      note: client?.note,
      phone: client?.phone,
      scale: client?.scale,
      taxCode: client?.taxCode,
      status: client?.status,
      isDelete: client?.isDelete,
      employeeCode: client?.employeeCode,
      employeeName: client?.employeeName,
      contact: client?.contact,
      contactEmail: client?.contactEmail,
      contactPhone: client?.contactPhone,
      position: client?.position,
    };
  });
});

watch(() => taskCustomers.value, () => {
  task.value.taskCustomers = taskCustomers.value?.map((taskCustomer: ClientInterface) => {
    return {
      id: '',
      taskId: '',
      clientId: taskCustomer.id,
      orderNo: null
    };
  });
});

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'WorkDetailLeftPanel' };
</script>

<style lang='scss' scoped>
:deep(.left-information-panel) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>