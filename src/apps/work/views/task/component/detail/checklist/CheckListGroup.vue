<template>
  <div>
    <div class='border-round flex hover:surface-hover justify-content-between px-2 tile'>
      <div class='align-items-center flex w-full'>
        <input
          v-model.lazy.trim='group.name'
          class='font-semibold no-border p-component w-full'
          :disabled='disableModify'
          maxlength='1000'>
      </div>
      <div class='buttons flex'>
        <ButtonIcon
          v-tooltip='t("Thêm checklist")'
          :disabled='disableModify'
          icon='add'
          round
          text
          @click='addChecklist(undefined)'/>
        <!--        <ButtonIcon-->
        <!--          icon='edit'-->
        <!--          round-->
        <!--          text/>-->
        <ButtonIcon
          v-tooltip='t("Xóa nhóm checklist ")'
          :disabled='disableModify'
          icon='delete'
          round
          text
          @click='deleteCheckListGroup'/>
      </div>
    </div>
    <div class='ml-3'>
      <template v-if='group?.checkLists'>
        <div
          v-for='(checklist,index) in group.checkLists'
          :key='group.checkLists[index].id'>
          <CheckListItem
            ref='checkListItems'
            v-model='group.checkLists[index]'
            @delete-check-list='deleteCheckList'>
          </CheckListItem>
        </div>
      </template>

    </div>
  </div>
</template>

<script lang='ts' setup>

import type { ApolloError } from '@apollo/client/core';
import { cloneDeep } from 'lodash';
import { computed, inject, type Ref, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { addCheckListGraphql } from '@/apps/work/api/graphql/checklist-api';
import { deleteCheckListGroupById, updateCheckListGroupName } from '@/apps/work/api/graphql/checklistgroup-api';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import type { CheckList, CheckListGroup, Task } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import CheckListItem from '@/apps/work/views/task/component/detail/checklist/CheckListItem.vue';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});

const emits = defineEmits<{
  (e: 'deleteCheckListGroup', id: string): void
}>();
const group = defineModel<CheckListGroup>({ required: true });

const providedTask = inject<Ref<Task | undefined>>('providedTask', toRef(undefined));

const { t } = useI18n();
const taskStore = useTaskStore();
const { canModifyTask } = taskStore;
watch(() => group.value.name, (value) => {
  updateCheckListGroupNameFunc(value);
});

function defaultCheckList(orderNo?: number): CheckList {
  return cloneDeep({
    name: `Công việc ${group.value.checkLists?.length || '0'}`,
    isComplete: false,
    orderNo: orderNo || 0,
    taskId: props.taskId,
    groupId: group.value.id
  });
}

const checkListItems = ref<InstanceType<typeof CheckListItem>[]>([]);
// const focusChecklist = (index:number) => {
//   // Access the specific CheckListItem component by index
//   checkListItems.value[index];
// };
const refetchCheckList = inject('refetchCheckList', () => void {});
const {
  mutate: addCheckListMutate,
  onError: addCheckListOnError,
  onDone: addCheckListOnDone
} = addCheckListGraphql();

function addChecklist(index?: number) {
  let newCheckList = defaultCheckList(index || group.value.checkLists?.length || 0);
  addCheckListMutate({ checkListInput: newCheckList });

}

addCheckListOnError(param => {
  handleError(param);
});
addCheckListOnDone(param => {
  refetchCheckList();
});

function deleteCheckList(id: string) {
  refetchCheckList();
  // group.value.checkLists = group.value?.checkLists?.filter(e => e.id != id) || [];
  //Or refetch
}

const {
  mutate: deleteCheckListGroupMutate,
  onError: deleteCheckListGroupOnError,
  onDone: deleteCheckListGroupOnDone
} = deleteCheckListGroupById();

function deleteCheckListGroup() {
  if (group.value.id) {
    deleteCheckListGroupMutate({ id: group.value.id });
  }
}

deleteCheckListGroupOnDone(param => {
  emits('deleteCheckListGroup', group.value.id || '');
});
deleteCheckListGroupOnError(param => {
  handleError(param);
});

const {
  mutate: updateCheckListGroupMutate,
  onError: updateCheckListGroupNameOnError,
  onDone: updateCheckListGroupNameOnDone
} = updateCheckListGroupName();

function updateCheckListGroupNameFunc(name: string) {
  updateCheckListGroupMutate({
    name: name,
    id: group.value.id
  });
}

updateCheckListGroupNameOnDone(param => {
  toastSuccess({ message: 'Đổi tên nhóm checklist thành công' });
});
updateCheckListGroupNameOnError(param => {
  handleError(param);
});

const disableModify = computed(() => {
  return !!providedTask.value && canModifyTask(providedTask.value);
});

function handleError(error: ApolloError) {
  const extension = error.graphQLErrors[0]?.extensions;
  const data = {
    message: '',
    code: '',
  };
  if ((extension?.errorCode as string).startsWith('notAllow')) {
    data.message = 'Không có quyền thực hiện';
  }
  if ((extension?.errorCode as string).startsWith('taskAlready')) {
    const statusType: StatusType = (extension?.errorDetail as Record<string, never>)?.statusType;
    data.message = `Công việc ở trạng thái ${t(`common.statuses.${(statusType as string).toLowerCase()}`)}, không thể thực hiện thao tác`;
  }
  toastErrorData({ error: { data: data } });
}
</script>

<style scoped>
.div-editable {
  &:focus-visible {
    outline: none;
    border-bottom: 1px solid var(--primary-400);
  }
}

.tile:hover {
  .buttons {
    opacity: 1
  }
}

.buttons {
  opacity: 0
}

.no-border {
  border: none;
  outline: none;
  background-color: transparent;
}
</style>