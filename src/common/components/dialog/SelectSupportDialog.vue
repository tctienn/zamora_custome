<template>
  <Dialog
    v-if='user'
    v-model:visible='visible'
    :header="
      t('admin.user.userSupport') +
        t(getGender(user?.gender) || '') +
        ' ' +
        user?.fullName
    "
    v-bind='DEFAULT_DIALOG_CONFIG'
    :style="{ width: '65vw' }"
    @hide='closeDialog'>
    <form
      ref='form'
      v-disabled='{ disabled: isDetail }'>
      <div class='font-bold mb-2'>
        {{ t('admin.user.selectUserSupport') }}
      </div>
      <div class='align-items-center flex gap-2 mb-3'>
        <div class='w-6'>
          <NamedMultiSelectUser
            v-model:list-user='userSupportIdsSelected'
            class='p-component'
            name='attendeeIds'
            :options='supports'
            :show-button-add='false'/>
        </div>
        <Button
          icon='pi pi-save'
          :label="t('admin.user.saveUserSupport')"
          @click='saveUserSupports'/>
      </div>
      <div class='grid'>
        <div class='col-4'>
          <div class='font-bold mb-2'>
            {{ t('admin.user.listUserSupport') }}
          </div>
          <OrderList
            v-model='userSupportIds'
            data-key='id'
            :meta-key-selection='true'
            :selection='userSupport'
            style='min-height: 25rem'
            @selection-change='onSelectionChange'>
            <template #item='slotProps'>
              <div
                class='align-items-center flex gap-3 justify-content-between p-2 row-item'>
                <AppUser
                  avatar-size='2.5'
                  info-visible
                  :infos="['positionName', 'organizationName']"
                  name-visible
                  :user-id='slotProps?.item'/>
                <ButtonIcon
                  v-tooltip.top="t('common.delete')"
                  class='icon-delete toggle'
                  icon='delete'
                  icon-size='1.7'
                  rounded
                  text
                  @click='handleDelete()'/>
              </div>
            </template>
          </OrderList>
        </div>

        <div class='col-8'>
          <div>
            <span class='font-bold'>{{
              t('admin.user.selectPermission')
            }}</span>
            <span class='text-sm'>{{
              t('admin.user.selectUserSupportForPermission')
            }}</span>
          </div>
          <div class='container-list grid mt-2 p-2'>
            <div class='col-3'>
              <div class='font-bold mb-2'>
                {{ t('admin.user.incomingDoc') }}
              </div>
              <div
                v-for='(incomingDoc, index) in incomingDocs'
                :key='index'
                class='align-items-center flex mb-2'>
                <Checkbox
                  v-model='selected'
                  :input-id='incomingDoc.key'
                  :value='incomingDoc.key'/>
                <label
                  class='ml-2'
                  :for='incomingDoc.key'>{{
                    incomingDoc.name
                  }}</label>
              </div>
            </div>
            <div class='col-3'>
              <div class='font-bold mb-2'>
                {{ t('admin.user.outgoingDoc') }}
              </div>
              <div
                v-for='(outgoingDoc, index) in outgoingDocs'
                :key='index'
                class='align-items-center flex mb-2'>
                <Checkbox
                  v-model='selected'
                  :input-id='outgoingDoc.key'
                  :value='outgoingDoc.key'/>
                <label
                  class='ml-2'
                  :for='outgoingDoc.key'>{{
                    outgoingDoc.name
                  }}</label>
              </div>
            </div>

            <div class='col-3'>
              <div class='font-bold mb-2'>{{ t('admin.user.docSubmit') }}</div>
              <div
                v-for='(doc, index) in docSubmit'
                :key='index'
                class='align-items-center flex mb-2'>
                <Checkbox
                  v-model='selected'
                  :input-id='doc.key'
                  :value='doc.key'/>
                <label
                  class='ml-2'
                  :for='doc.key'>{{ doc.name }}</label>
              </div>
            </div>

            <div class='col-3'>
              <div class='font-bold mb-2'>{{ t('admin.user.meeting') }}</div>
              <div
                v-for='(meeting, index) in meetings'
                :key='index'
                class='align-items-center flex mb-2'>
                <Checkbox
                  v-model='selected'
                  :input-id='meeting.key'
                  :value='meeting.key'/>
                <label
                  class='ml-2'
                  :for='meeting.key'>{{
                    meeting.name
                  }}</label>
              </div>
            </div>
            <div
              class='flex justify-content-end w-full'
              style='max-height: 40px'>
              <Button
                v-if='userSupport'
                icon='pi pi-save'
                :label="t('admin.user.saveUserSupportPermission')"
                @click='submit'/>
            </div>
          </div>
        </div>
      </div>
    </form>
    <div class='px-3'>
      <div
        v-for='(allow, index) in allows'
        :key='index'
        class='align-items-center flex mb-2'>
        <Checkbox
          v-model='allowChecked'
          :input-id='allow.key'
          :value='allow.key'/>
        <label
          class='ml-2'
          :for='allow.key'>{{ allow.name }}</label>
      </div>
    </div>
    <template #footer>
      <div
        class='fixed flex gap-2 justify-content-center pb-2 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='closeDialog'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteUserSupport,
  getUsersByRoleTroLy,
  getUserSupportByUserId,
  getUserSupportByUserIdAndUserSupportId,
  saveGeneralPermission,
  saveListUserSupport,
  saveUserSupport,
} from '@/apps/admin/api/graphql/admin-customer-tenant';
import { OrganizationType } from '@/apps/document/model/organization';
import { getGender } from '@/apps/meeting/views/meeting/components/meeting-class';
import AppUser from '@/common/components/app/AppUser.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { SupportPermission, type UserInterface } from '@/common/model/User';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  orgType: {
    type: String,
    default: OrganizationType.ADMINISTRATIVE,
  },
  id: {
    type: String,
    default: null,
  },
  user: {
    type: Object as PropType<any>,
    default: {} as any,
  },
  deptId: {
    type: Array as PropType<any>,
    default: null,
  },
  optionSupport: {
    type: Array as PropType<any[]>,
    default: undefined,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

const { onResult: getUsersByRoleTroLyResult } = getUsersByRoleTroLy();
const supports = ref<any[]>([]);
const userSupportIdsSelected = ref<any[]>([]);

if (props.orgType === OrganizationType.ADMINISTRATIVE) {
  getUsersByRoleTroLyResult((res) => {
    supports.value = res.data.findByRoleTroLy || [];
  });
} else {
  supports.value = Array.isArray(props.optionSupport)
    ? props.optionSupport.map(({ userId }) => ({ id: userId }))
    : [];
}

const userSupportIds = ref();

const { t } = useI18n();
const visible = ref(props.visibleDialog);
const user = ref<UserInterface>(props.user);
const selected = ref();
const allowChecked = ref();

const {
  mutate: saveUserSupportMutate,
  onDone: saveUserSupportDone
} =
  saveUserSupport();

const {
  mutate: saveListUserSupportMutate,
  onDone: saveListUserSupportDone
} =
  saveListUserSupport();

const {
  onResult: getUserSupportByUserIdResult,
  refetch: getUserSupportByUserIdRefetch,
} = getUserSupportByUserId(props.id, props.deptId.toString());

const {
  onResult: getUserSupportByUserIdAndUserSupportIdResult,
  load: getUserSupportByUserIdAndUserSupportIdLoad,
  refetch: getUserSupportByUserIdAndUserSupportIdRefetch,
} = getUserSupportByUserIdAndUserSupportId('', '', '');
getUserSupportByUserIdAndUserSupportIdLoad();
const userSupport = ref();
getUserSupportByUserIdResult((res) => {
  userSupportIds.value = res.data.getUserSupportByUserIdAndDeptId?.map(
    (item: any) => item.userSupportId,
  );
  if (res.data.getUserSupportByUserIdAndDeptId[0]) {
    allowChecked.value =
      res.data.getUserSupportByUserIdAndDeptId[0].supportsPermission;
  }
});

getUserSupportByUserIdAndUserSupportIdResult((res) => {
  selected.value =
    res.data.getUserSupportByUserIdAndUserSupportIdAndDeptId.supportPermission;
});

const {
  mutate: saveGeneralPermissionMutate,
  onDone: saveGeneralPermissionOnDone,
} = saveGeneralPermission();

function closeDialog() {
  if (userSupportIds.value.length > 0) {
    saveGeneralPermissionMutate({
      userId: props.id,
      supportsPermission: allowChecked.value?.join(','),
      deptId: props.deptId,
    });
  }

  emits('hide-dialog');
}

function submit() {
  saveUserSupportMutate({
    userSupport: {
      userId: props.id,
      userSupportId: userSupport.value.join(','),
      supportType: null,
      supportPermission: selected.value,
      orgType: props.orgType,
      roleId: 'LANH_DAO',
      deptId: props.deptId,
    },
  });
}

const onSelectionChange = (e: any) => {
  userSupport.value = e.value;
  getUserSupportByUserIdAndUserSupportIdRefetch({
    userId: props.id || '',
    userSupportId: userSupport.value.join(','),
    deptId: props.deptId.toString(),
  });
};

function saveUserSupports() {
  const userSupportList = userSupportIdsSelected.value.join(',');
  if (userSupportList === '') {
    return;
  }
  saveListUserSupportMutate({
    userId: props.id,
    userSupportList: userSupportList,
    orgType: props.orgType,
    roleId: 'LANH_DAO',
    deptId: props.deptId,
  });
}

saveListUserSupportDone(() => {
  getUserSupportByUserIdRefetch();
  userSupportIdsSelected.value = [];
  toastSuccess({ message: t('admin.user.successUserSupport') });
});
const confirm = useConfirm();
const {
  mutate: deleteUserSupportMutate,
  onDone: deleteUserSupportDone
} =
  deleteUserSupport();

function handleDelete() {
  confirm.require({
    message: t('admin.user.deleteUserSupport'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteUserSupportMutate({
        userId: props.id,
        userSupportId: userSupport.value.join(','),
        deptId: props.deptId,
      });
    },
  });
}

deleteUserSupportDone(() => {
  getUserSupportByUserIdRefetch();
});

saveUserSupportDone(() => {
  toastSuccess({ message: t('admin.user.successUserSupport') });
});

const incomingDocs = [
  {
    key: SupportPermission.READ_INCOMING_DOC,
    name: t('admin.user.read'),
  },
  {
    key: SupportPermission.ADVISE_INCOMING_DOC,
    name: t('admin.user.advise'),
  },
  {
    key: SupportPermission.TRANSFER_INCOMING_DOC,
    name: t('admin.user.transfer'),
  },
  {
    key: SupportPermission.RETURN,
    name: t('admin.user.return'),
  },
  {
    key: SupportPermission.COMPLETE,
    name: t('admin.user.complete'),
  },
  {
    key: SupportPermission.WITHDRAW_INCOMING_DOC,
    name: t('admin.user.withdraw'),
  },
  {
    key: SupportPermission.SENT_TO_KNOW,
    name: t('admin.user.sentToKnow'),
  },
];

const outgoingDocs = [
  {
    key: SupportPermission.READ_OUTGOING_DOC,
    name: t('admin.user.read'),
  },
  {
    key: SupportPermission.ADVISE_OUTGOING_DOC,
    name: t('admin.user.advise'),
  },
  {
    key: SupportPermission.TRANSFER_OUTGOING_DOC,
    name: t('admin.user.transfer'),
  },
  {
    key: SupportPermission.APPROVE_OUTGOING_DOC,
    name: t('admin.user.approve'),
  },
  {
    key: SupportPermission.WITHDRAW_OUTGOING_DOC,
    name: t('admin.user.withdraw'),
  },
];

const docSubmit = [
  {
    key: SupportPermission.READ_DOC_SUBMIT,
    name: t('admin.user.read'),
  },
  {
    key: SupportPermission.ADVISE_DOC_SUBMIT,
    name: t('admin.user.advise'),
  },
  {
    key: SupportPermission.TRANSFER_DOC_SUBMIT,
    name: t('admin.user.transfer'),
  },
  {
    key: SupportPermission.APPROVE_DOC_SUBMIT,
    name: t('admin.user.approve'),
  },
  {
    key: SupportPermission.WITHDRAW_DOC_SUBMIT,
    name: t('admin.user.withdraw'),
  },
];

const meetings = [
  {
    key: SupportPermission.REGISTER,
    name: t('admin.user.register'),
  },
  {
    key: SupportPermission.APPROVE_MEETING,
    name: t('admin.user.approve'),
  },
];

const allows = [
  {
    key: SupportPermission.ALLOW_VIEW_CONTENT,
    name: t('admin.user.allowViewContent'),
  },
  {
    key: SupportPermission.ALLOW_EXCHANGE,
    name: t('admin.user.allowExchange'),
  },
];
</script>

<style scoped>
:deep(.p-orderlist-controls) {
  display: none;
}

.container-list {
  padding: 0.75rem 0;
  border: 1px solid var(--surface-border);
  background-color: var(--surface-card);
  border-radius: 6px;
  overflow: auto;
  transition: background-color 0.2s,
  color 0.2s,
  border-color 0.2s,
  box-shadow 0.2s;
  outline-color: transparent;
  max-height: 25rem;
  min-height: 25rem;
}

.icon-delete {
  visibility: hidden;
}

.row-item:hover {
  .icon-delete {
    visibility: visible;
  }
}

:deep(.p-orderlist .p-orderlist-list .p-orderlist-item) {
  padding: 0 1.25rem;
}
</style>
