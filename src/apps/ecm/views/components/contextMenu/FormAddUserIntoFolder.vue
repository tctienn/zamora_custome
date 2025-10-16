<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("common.selectUser")'
    @hide='emits("hide-dialog")'>
    <DataTable
      v-model:selection='selectedUser'
      data-key='id'
      lazy
      :loading='loadingUser'
      table-style='min-width: 40rem'
      :value='users'>
      <Column
        header-style='width: 3rem'
        selection-mode='multiple'></Column>
      <Column
        field='fullName'
        :header='t("common.userName")'></Column>
      <Column
        field='email'
        :header='t("admin.userGroup.email")'></Column>
    </DataTable>

    <template #footer>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        text
        @click='emits("hide-dialog")'/>
      <Button
        icon='pi pi-check'
        :label='t("common.choose")'
        @click='pushUsersToFileFolderPermission'/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { UserInGroupInterface } from '@/apps/admin/model/User';
import { getGroup } from '@/apps/ecm/api/graphql/group-graphql-api';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

interface UserGroupFormProps {
  visibleDialog: boolean;
}

const props = withDefaults(defineProps<UserGroupFormProps>(), { visibleDialog: false });

const emits = defineEmits(['hide-dialog', 'reload-form-group-permission', 'add-users-permissions']);

const route = useRoute();
const { id } = route.params;

const visible = ref(props.visibleDialog);
const { t } = useI18n() || {};
const users = ref<UserInGroupInterface[]>([]);
const selectedUser = ref();
const { onResult: findByGroupIdResult, loading: loadingUser } = getGroup(id as string);
findByGroupIdResult((res) => {
  users.value = res.data.getGroup.users || [];
});

function pushUsersToFileFolderPermission() {
  emits('add-users-permissions', selectedUser.value);
  emits('hide-dialog');
}

</script>

<script lang='ts'>
export default { name: 'FormAddUserIntoFolder' };
</script>