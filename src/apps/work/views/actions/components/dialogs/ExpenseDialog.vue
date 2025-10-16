<template>
  <Dialog
    v-model:visible='visible'
    :header='headerDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <DataTable
      :value='expenses'
      v-bind='DEFAULT_DATATABLE_CONFIG'>

      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', { itemType: toLower(t('work.expense.title')) })
        }}</span>
      </template>

      <template #header>
        <div class='align-items-center flex'>
          <ButtonIcon
            class='text-white'
            icon='add_circle'
            rounded
            text
            @click='createNewExpense'/>
          <span class='font-bold ml-2 text-primary text-white text-xl'>{{ t('work.expense.title') }} - {{
            item?.name
          }}</span>
        </div>
      </template>

      <Column
        field='expenseCategory'
        :header='t("work.expense.expenseCategory")'/>

      <Column
        field='time'
        :header='t("common.time")'>
        <template #body='{data:{time}}'>
          {{ moment(time).format('DD/MM/YYYY HH:mm') }}
        </template>
      </Column>

      <Column
        field='lastModifiedBy'
        :header='t("work.expense.declarer")'>
        <template #body='{data:{lastModifiedBy}}'>
          <AppUser
            v-if='lastModifiedBy'
            avatar-size='1.5'
            class='w-fit'
            :info-visible='false'
            :user='users.find(u => u.id === lastModifiedBy)'/>
        </template>
      </Column>

      <Column
        field='totalMoney'
        :header='t("work.expense.amount")'>
        <template #body='{data:{totalMoney}}'>
          {{ formatCurrency(totalMoney) }} đ
        </template>
      </Column>

      <Column
        field='attachments'
        :header='t("work.expense.attachment")'>
        <template #body='{data:{attachments}}'>
          <div
            v-for='attachment in attachments'
            :key='attachment.id'>
            <a :href='GATEWAY_URL + "/files/download/" + attachment.path'>{{ attachment.name }}</a>
          </div>
        </template>
      </Column>

      <Column
        v-if='menuActions.length'
        class='text-center'>
        <template #body='{data}'>
          <ButtonIcon
            v-tooltip.top='t("common.action")'
            class='text-color'
            icon='list'
            rounded
            text
            @click='toggleActionMenu({event : $event, data : data})'/>
        </template>
      </Column>

    </DataTable>

    <Menu
      ref='menuAction'
      :model='menuActions'
      :popup='true'>
      <template #item='{item: {icon, label}}'>
        <MenuItem
          :icon='icon'
          :label='label'/>
      </template>
    </Menu>

    <template #footer>
      <DialogFooter/>
    </template>

    <AddExpenseDialog
      v-if='isShowAddExpenseDialog'
      :expense='expense'
      :item='props.item'
      :visible-dialog='isShowAddExpenseDialog'
      @hide-dialog='() => isShowAddExpenseDialog = false'
      @reload='reload'/>
  </Dialog>
</template>

<script lang='ts' setup>
import { get, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteExpenseGraphql, findAllTaskExpenseByTaskIdGraphql } from '@/apps/work/api/graphql/task-expense-api';
import type { Task } from '@/apps/work/model/task';
import type { TaskExpense } from '@/apps/work/model/taskCost';
import AddExpenseDialog from '@/apps/work/views/actions/components/dialogs/AddExpenseDialog.vue';
import { GATEWAY_URL } from '@/common/api/configService';
import { getActiveUsersGraphql } from '@/common/api/graphql/user-graphql';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { User } from '@/common/model/User';

const props = withDefaults(defineProps<ConfigFormProps>(), {
  visibleDialog: false,
  isDetail: false,
  item: undefined
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { t } = useI18n();
const { moment } = useMoment();
const headerDialog = t('common.editItemName', {
  item: toLower(t('work.taskCost.objectName')),
  name: props.item.name
});

interface ConfigFormProps {
  visibleDialog: boolean,
  item: Task,
  isDetail: boolean,
}

const confirm = useConfirm();
const visible = ref(props.visibleDialog);
const expenses = ref<TaskExpense[]>([]);
const isShowAddExpenseDialog = ref(false);
const users = ref<User[]>([]);
const expense = ref<TaskExpense>({} as TaskExpense);
const {
  onResult: findAllTaskExpenseByTaskIdOnResult,
  onError: findAllTaskExpenseByTaskIdOnError,
  refetch: findAllTaskExpenseByTaskIdRefetch
} = findAllTaskExpenseByTaskIdGraphql(props.item.id || '');
findAllTaskExpenseByTaskIdOnResult(res => {
  expenses.value = res.data.findAllTaskExpenseByTaskId;
});
findAllTaskExpenseByTaskIdOnError(e => {
  toastError();
});

const { onResult: getActiveUsersResult } = getActiveUsersGraphql();

getActiveUsersResult((response) => {
  users.value = get(response, 'data.getAllUserStatusActive', []);
});

const menuAction = ref();
const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    functionPermission: '/ADMIN/CATEGORY/CATEGORY_CATEGORY/UPDATE',
    command: () => {
      showAddExpenseDialog();
    }
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    functionPermission: '/ADMIN/CATEGORY/CATEGORY_CATEGORY/DELETE',
    command: () => {
      deleteExpense();
    }
  }
];
const {
  onDone: deleteExpenseOnDone,
  onError: deleteExpenseOnError,
  mutate: deleteExpenseMutate
} = deleteExpenseGraphql();
deleteExpenseOnDone(() => {
  toastSuccess({ message: t('common.result.message.deleteSuccess') });
  reload();
});
deleteExpenseOnError(e => {
  toastError();
});

function deleteExpense() {
  confirm.require({
    message: t('work.expense.confirmDelete'),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteExpenseMutate({
        id: expense.value.id,
        taskId: expense.value.taskId
      });
    }
  });
}

function toggleActionMenu({
  event,
  data
}: { event: Event, data: TaskExpense }) {
  menuAction.value.toggle(event);
  expense.value = data;
}

function reload() {
  findAllTaskExpenseByTaskIdRefetch({ taskId: props.item.id || '' });
}

function showAddExpenseDialog() {
  isShowAddExpenseDialog.value = true;
}

function createNewExpense() {
  expense.value = {} as TaskExpense;
  isShowAddExpenseDialog.value = true;
}

const footerButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  }
};

const formatCurrency = (value: string) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

provide('dialogFooterButtons', footerButtons);
</script>

<script lang='ts'>
export default { name: 'ExpenseDialog' };
</script>