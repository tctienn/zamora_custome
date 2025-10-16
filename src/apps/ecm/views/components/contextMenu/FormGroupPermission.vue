<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("ecm.group.userAuthorization")'
    @hide='emits("hide-dialog")'>
    <div style='text-align: right'>
      <ButtonIcon
        icon='add_circle'
        icon-size='1.5'
        rounded
        text
        @click='addUser'/>
    </div>
    <DataTable
      data-key='id'
      lazy
      :loading='loading'
      table-style='min-width: 40rem'
      :value='usersDisplay'>
      <Column
        field='info.fullName'
        :header='t("common.fullName")'></Column>
      <Column
        field='info.email'
        :header='t("admin.userGroup.email")'></Column>
      <Column
        field='permission'
        :header='t("admin.userGroup.permission.title")'>
        <template #body='{data, index}'>
          <Dropdown
            :disabled='!hasPermission("/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/DECENTRALIZATION")'
            :model-value='data["permission"]'
            option-label='label'
            option-value='value'
            :options='permission'
            :placeholder='t("common.select")'
            @change='changeUserPermission($event,index)'/>
        </template>
      </Column>
      <Column
        body-style='center'
        class='text-center'
        :header='t("common.delete")'
        header-style='center'>
        <template #body='{index}'>
          <ButtonIcon
            class='p-button-danger'
            icon='delete'
            text
            @click='deleteUser(index)'/>
        </template>
      </Column>
    </DataTable>
    <br>
    <template #footer>
      <Button
        icon='pi pi-times'
        :label='t("common.close")'
        severity='danger'
        @click='emits("hide-dialog")'/>
      <Button
        v-if="hasPermission('/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/DECENTRALIZATION')"
        icon='pi pi-check'
        :label='t("common.save")'
        @click='addUserInUserGroup'/>
    </template>

    <FormAddUserIntoFolder
      v-if='showFormAddUser'
      :visible-dialog='showFormAddUser'
      @add-users-permissions='pushUsersToFileFolderPermission($event)'
      @hide-dialog='hideFormAddUser'/>

  </Dialog>
</template>

<script setup lang='ts'>
import { cloneDeep, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import Dropdown from 'primevue/dropdown';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { UserInGroup } from '@/apps/admin/model/User';
import { Permission } from '@/apps/admin/model/userGroup';
import { hasPermission } from '@/apps/admin/services/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findByGroupIdAndPath, save } from '@/apps/ecm/api/graphql/file-folder-permission-graphql-api';
import type { FileFolderPermission } from '@/apps/ecm/model/permission';
import { useStorageStore } from '@/apps/ecm/store/storage';
import FormAddUserIntoFolder from '@/apps/ecm/views/components/contextMenu/FormAddUserIntoFolder.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

interface UserGroupFormProps {
  visibleDialog: boolean;
}

const props = withDefaults(defineProps<UserGroupFormProps>(), { visibleDialog: false });

const emits = defineEmits(['hide-dialog', 'reload']);

const route = useRoute();
const { id } = route.params;

const store = useStorageStore();
const { selectedFileFolders } = storeToRefs(store);
const {
  usersMoreInfo,
  fetchAllUsers
} = useUserMoreInfoStore();
const {
  onResult: findByGroupIdAndPathResult,
  loading
} = findByGroupIdAndPath(id as string, selectedFileFolders.value[0].treePath);
findByGroupIdAndPathResult((res) => {
  listUser.value = res.data.findByGroupIdAndPath;
});

const visible = ref(props.visibleDialog);
const { t } = useI18n() || {};
const listUser = ref<FileFolderPermission[]>([]);
const usersDisplay = computed((): FileFolderPermission[] => {
  return listUser.value.map((u) => ({
    ...u,
    info: usersMoreInfo[u.id.userId]
  }));
});
const showFormAddUser = ref(false);

function changeUserPermission(event: DropdownChangeEvent, index: number) {
  let listTemp = cloneDeep(listUser.value);
  listTemp[index].permission = event.value;
  listUser.value = listTemp;
}

const permission = Object.keys(Permission).map((type) => ({
  label: t(`admin.userGroup.permission.${toLower(type)}`),
  value: type
}));

const {
  mutate: saveMutation,
  onDone: saveOnDone
} = save();

function addUserInUserGroup() {
  const inputData = listUser.value.map((user) => {
    return {
      id: {
        groupId: id as string,
        userId: user.id,
        path: selectedFileFolders.value[0].treePath
      },
      permission: user.permission?.toString()
    };
  });

  saveMutation({ inputData });
}

function addUser() {
  showFormAddUser.value = true;
}

function pushUsersToFileFolderPermission(data: UserInGroup[]) {
  listUser.value = [...listUser.value,
    ...data
      .filter(u => listUser.value.findIndex(l => l.id.userId === u.id) === -1)
      .map((user) => ({
        id: {
          groupId: id as string,
          userId: user.id,
          path: selectedFileFolders.value[0].treePath
        },
        permission: Permission.VIEW
      }))
  ];
}

function deleteUser(index: number) {
  listUser.value = listUser.value.filter((value, i) => i !== index);
}

function hideFormAddUser() {
  showFormAddUser.value = false;
}

saveOnDone(() => {
  toastSuccess({ message: t('admin.userGroup.addUser') });
  emits('reload');
  emits('hide-dialog');
});

onMounted(() => {
  fetchAllUsers();
});
</script>

<script lang='ts'>
export default { name: 'FormGroupPermission' };
</script>