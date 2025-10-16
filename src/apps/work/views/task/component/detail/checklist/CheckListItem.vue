<template>
  <template v-if='!modelValue'>
  </template>
  <template v-else>
    <div class='border-round flex hover:surface-hover justify-content-between px-2 tile w-full'>
      <div class='align-items-center flex gap-2 w-full'>
        <Checkbox
          binary
          :disabled='disableModify'
          :model-value='modelValue.isComplete'
          :pt='{
            box:{
              style:{"background-color" : modelValue.isComplete?"#5CB85CD6":""}
            }
          }'
          @update:model-value='toggleCheckbox'/>
        <input
          v-model.lazy.trim='modelValue.name'
          autofocus
          class='flex-grow-1 no-border p-component w-full'
          :class='{"complete" : modelValue.isComplete}'
          :disabled='disableModify'
          :maxlength='1000'
          @keydown.enter='emits("addCheckList")'>
      </div>
      <div class='align-items-center flex'>
        <AppUser
          v-if='modelValue?.lastModifiedBy'
          overlay-visible
          :user-id='modelValue?.lastModifiedBy'>

        </AppUser>
        <div class='buttons flex'>
          <ButtonIcon
            v-tooltip='t("Sửa checklist")'
            :disabled='disableModify'
            icon='edit'
            text
            @click='visibleDialogUpdate=true'/>
          <ButtonIcon
            v-tooltip='t("Xóa checklist")'
            :disabled='disableModify'
            icon='delete'
            text
            @click='deleteCheckList'/>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible='visibleDialogUpdate'
      :header='"Cập nhật checklist"'
      style='width:30vw'
      v-bind='DEFAULT_DIALOG_CONFIG'>
      <div class='grid'>
        <div class='align-items-center col-5 flex'>
          <div>
            Ngày bắt đầu (Dự kiến)
          </div>
        </div>
        <div class='col-7'>
          <Calendar
            v-model='updateDataCheckList.startTime'
            date-format='dd/mm/yy'
            show-icon></Calendar>
        </div>
        <div class='align-items-center col-5 flex'>
          Ngày kết thúc (Dự kiến)
        </div>
        <div class='col-7'>
          <Calendar
            v-model='updateDataCheckList.endTime'
            date-format='dd/mm/yy'
            show-icon></Calendar>
          <ValidateErrorMessage :errors='v$.endTime.$errors'/>
        </div>

        <div class='align-items-center col-5 flex'>
          Ngày hoàn thành
        </div>
        <div class='col-7'>
          <Calendar
            v-model='updateDataCheckList.completedTime'

            :disabled='!modelValue.isComplete'
            show-icon></Calendar>
        </div>

      </div>

      <template #footer>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='hideDialogUpdate'/>
        <Button
          class='p-button-plain'
          icon='pi pi-save'
          :label="t('common.save')"
          @click='updateCheckListFun'/>
      </template>
    </Dialog>
  </template>
</template>

<script lang='ts' setup>
import type { ApolloError } from '@apollo/client/core';
import { useVuelidate } from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import { omit } from 'lodash';
import { computed, inject, reactive, type Ref, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  completeCheckList,
  deleteCheckListGraphql,
  incompleteCheckList,
  updateCheckList,
  updateCheckListName
} from '@/apps/work/api/graphql/checklist-api';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import type { CheckList, Task } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const emits = defineEmits<
    {
      (e: 'addCheckList',): void
      (e: 'deleteCheckList', id: string): void
    }
>();
const modelValue = defineModel<CheckList>({ default: {} });

const providedTask = inject<Ref<Task | undefined>>('providedTask', toRef(undefined));

const { t } = useI18n();
const { moment } = useMoment();
const taskStore = useTaskStore();
const { canModifyTask } = taskStore;
watch(() => modelValue.value?.name, (value) => {
  updateCheckListNameFun(value || '');
});
const {
  mutate: deleteCheckListMutate,
  onError: deleteCheckListOnError,
  onDone: deleteCheckListOnDone
} = deleteCheckListGraphql();

function deleteCheckList() {
  if (!modelValue.value?.id) {
    return;
  }
  deleteCheckListMutate({ checkListId: modelValue.value?.id });
}

deleteCheckListOnError(param => {
  handleError(param);
});
deleteCheckListOnDone(param => {
  toastSuccess({ message: 'Xóa checklist thành công' });
  emits('deleteCheckList', modelValue.value?.id || '');
});
const {
  mutate: completeCheckListMutate,
  onError: completeCheckListOnError,
  onDone: completeCheckListOnDone
} = completeCheckList();
const {
  mutate: incompleteCheckListMutate,
  onError: incompleteCheckListOnError,
  onDone: incompleteCheckListOnDone
} = incompleteCheckList();

function toggleCheckbox(value: boolean) {
  const variables = { checkListId: modelValue.value?.id };
  if (value) {
    completeCheckListMutate(variables);
  } else {
    incompleteCheckListMutate(variables);
  }
}

completeCheckListOnError(param => {
  handleError(param);
});
completeCheckListOnDone(res => {
  modelValue.value.isComplete = true;
  modelValue.value = res?.data?.completeCheckList;
});
incompleteCheckListOnError(param => {
  handleError(param);
});
incompleteCheckListOnDone(res => {
  modelValue.value.isComplete = false;
  modelValue.value = res?.data?.incompleteCheckList;
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

const {
  mutate: updateCheckListNameMutate,
  onError: updateCheckListNameOnError,
  onDone: updateCheckListNameOnDone
} = updateCheckListName();
const {
  mutate: updateCheckListMutate,
  onError: updateCheckListOnError,
  onDone: updateCheckListOnDone
} = updateCheckList();

function updateCheckListNameFun(name: string) {
  updateCheckListNameMutate({
    name: name,
    id: modelValue.value?.id
  });
}

updateCheckListNameOnDone(param => {
  toastSuccess({ message: 'Đổi tên checklist thành công' });
});
updateCheckListNameOnError(param => {
  handleError(param);
});
const visibleDialogUpdate = ref<boolean>(false);

const updateDataCheckList = reactive<{
  startTime?: Date,
  endTime?: Date,
  completedTime?: Date
}>({
  startTime: modelValue.value?.startTime ? new Date(modelValue.value?.startTime as unknown as string) : undefined,
  endTime: modelValue.value?.endTime ? new Date(modelValue.value?.endTime as unknown as string) : undefined,
  completedTime: modelValue.value?.completedTime ? new Date(modelValue.value?.completedTime as unknown as string) : undefined,
});
watch(() => modelValue.value?.completedTime, (value) => {
  updateDataCheckList.completedTime = value ? new Date(value as unknown as string) : undefined;
});
const validateRules = {
  // startTime: {
  //   required: helpers.withMessage(t('meeting.common.error.startTimeCantEmpty'), required),
  //   checkStartTime: helpers.withMessage(t('meeting.common.error.startTimeInThePass'), (value: Date | undefined) => {
  //     return value == undefined || value > new Date(Date.now());
  //   })
  // },
  endTime: {
    checkEndTime: helpers.withMessage(t('meeting.common.error.startTimeAfterEndTime'), (value: Date | undefined) => {
      return value == undefined || !updateDataCheckList?.startTime || value > updateDataCheckList.startTime;
    }),
  },
};
const v$ = useVuelidate(validateRules, { endTime: updateDataCheckList.endTime });

function hideDialogUpdate() {
  visibleDialogUpdate.value = false;
}

function updateCheckListFun() {
  v$.value.$validate().then(valid => {
    if (!valid) {
      return;
    }
    updateCheckListMutate({
      id: modelValue.value?.id,
      checkListInput: omit({
        ...modelValue.value,
        startTime: updateDataCheckList?.startTime ? moment(updateDataCheckList?.startTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME) : undefined,
        endTime: updateDataCheckList?.endTime ? moment(updateDataCheckList?.endTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME) : undefined,
        completedTime: updateDataCheckList?.completedTime ? moment(updateDataCheckList?.completedTime).format(DateTimeFormat.ISO_LOCAL_DATE_TIME) : undefined,
      }, 'lastModifiedBy', 'createdBy'),
    });
  });

}

updateCheckListOnError(param => {
  handleError(param);
});
updateCheckListOnDone(param => {
  modelValue.value = {
    ...modelValue.value,
    ...updateDataCheckList
  };
  visibleDialogUpdate.value = false;
  toastSuccess({ message: 'Cập nhật checklist thành công' });
});
const disableModify = computed(() => {
  return !!providedTask.value && canModifyTask(providedTask.value);
});
</script>

<style scoped lang='scss'>
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

.complete {
  color: var(--green-400)
}

:deep(.p-checkbox.p-highlight .p-checkbox-box) {
  border-color: var(--green-400)
}

.checked {
  background-color: var(--green-400) !important;
}
</style>