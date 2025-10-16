<template>
  <Dialog
    v-if='userGroup'
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("admin.userGroup.addUser")'
    @hide='emits("hide-dialog")'>

    <PickListUser
      v-model='users'
      v-model:selected='selectedUser'
      :disable-item-fn='isDisabledUser'
      show-search>
      <template #item-action='{item}'>
        <Dropdown
          :model-value='item["level"]'
          option-label='label'
          option-value='value'
          :options='levels'
          :placeholder='t("common.select")'
          @change='changeUserLevel($event, item)'/>
      </template>
    </PickListUser>
    <template #footer>
      <div class='flex justify-content-center'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          text
          @click='emits("hide-dialog")'/>
        <Button
          icon='pi pi-check'
          :label='t("common.save")'
          text
          @click='addUserInUserGroup'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { omit, pick, toLower } from 'lodash';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import Dropdown from 'primevue/dropdown';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserServicePublic } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { addUserToUserGroup } from '@/apps/admin/api/graphql/user-group-graphql-api';
import type { UserInGroupInterface } from '@/apps/admin/model/User';
import type { UserInterface } from '@/apps/admin/model/User';
import type { UserGroupInterface } from '@/apps/admin/model/userGroup';
import { Level } from '@/apps/admin/model/userGroup';
import userGroup from '@/apps/ecm/views/config/UserGroup.vue';
import PickListUser, { type ExtendUser } from '@/common/components/pick-list/PickListUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { mapEnum } from '@/common/helpers/utils';
import type { UserLevel } from '@/common/model/group';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  group: {
    type: Object as PropType<UserGroupInterface>,
    required: true
  }
});
const emits = defineEmits(['hide-dialog', 'reload']);
const visible = ref(props.visibleDialog);
const { t } = useI18n() || {};
const selectedUser = ref<UserLevel[]>(props.group.users);
const users = ref<UserLevel[]>([]);

function isDisabledUser(u: ExtendUser): boolean {
  return !!u?.locked;
}

const { onResult: getAllUserResult, } = getAllUserServicePublic();
getAllUserResult((response) => {
  users.value = response.data.getAllUserServicePublic.map((user: UserInterface) => ({
    ...user,
    level: props.group.users.find(u => u.id === user.id)?.level
  }));
});

const levels = mapEnum(Level).map((type) => ({
  label: t(`admin.userGroup.types.${toLower(type)}`),
  value: type
}));

const {
  mutate: addUserToUserMutate,
  onDone: addUserToUserDone,
  onError: addUserOnError
} = addUserToUserGroup();

function changeUserLevel(event: DropdownChangeEvent, user: UserInGroupInterface) {
  user.level = event.value;
}

function addUserInUserGroup() {
  if (!validateAddUser(selectedUser.value)) {
    return;
  }
  addUserToUserMutate({
    id: props.group.id,
    userList: selectedUser.value.map(user => pick(user, 'id', 'level', 'fullName', 'email'))
  });
}

function validateAddUser(listUser: UserLevel[]) {
  for (const userInGroupInterface of listUser) {
    if (!userInGroupInterface.level) {
      toastError({ message: t('admin.userGroup.message.validateLeveNotNull') });
      return false;
    }
  }
  return true;
}

addUserToUserDone((response) => {
  selectedUser.value = selectedUser.value.map(user => omit(user));
  toastSuccess({ message: t('admin.userGroup.addUser') });
  emits('reload');
  emits('hide-dialog');
});

addUserOnError((err) => {
  toastError({ message: t('admin.userGroup.error.' + err.graphQLErrors[0].extensions.errorCode) });
});
</script>

<script lang='ts'>
export default { name: 'UserGroupAddForm' };
</script>

<style scoped>
</style>
