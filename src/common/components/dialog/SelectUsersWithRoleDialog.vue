<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header="t('document.groupReceivingDocuments.members')"
    @hide="emits('hide-dialog')">
    <DataTable
      v-model:selection='userIds'
      class='overflow-auto'
      data-key='id'
      selection-mode='multiple'
      :value='usersMoreDetails'>
      <Column
        class='col-1 text-center'
        selection-mode='multiple'/>

      <Column
        class='col-1 text-center'
        header='STT'>
        <template #body='{ index }'>
          {{ index + 1 }}
        </template>
      </Column>

      <Column
        field='userId'
        header='Người nhận'
        header-class='align-content-start'>
        <template #body='{ data: { userId, deptName } }'>
          <AppUserDeptRole
            avatar-size='2.5'
            info-visible
            :infos="['positionName', 'deptName', 'roleName']"
            name-visible
            :user-dept-role="{
              roleId: '',
              userId: userId,
              deptId: '',
              deptName: deptName,
              userName: '',
              roleName: '',
              type: userDeptRole.type,
            }"/>
        </template>
      </Column>

      <Column
        class='col-4'
        header='Vai trò'>
        <template #body='{ data: { roleId } }'>
          <div>{{ mapRoleName.get(roleId) || "" }}</div>
        </template>
      </Column>
    </DataTable>
    <template #footer>
      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-1 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click='submitForm'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getAllUserMoreInfoGraphql,
  getAllUserMoreInfoNotCurrentUserGraphql
} from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllRolesPublic } from '@/apps/admin/api/graphql/role-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  modelValue: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['hide-dialog', 'update:modelValue']);
const { t } = useI18n();
const userIds = ref<any[]>([]);
const usersMoreDetails = ref<UserMoreInfo[]>();
const usersMoreDetailsTemp = ref<UserMoreInfo[]>();
const searchKeyword = ref<string>();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { result } = getAllRolesPublic();
const mapRoleName = computed(() => {
  return new Map<string, string>(
    result?.value?.rolesPublic?.map((role: { code: string; name: string }) => [
      role.code,
      role.name,
    ]),
  );
});
const users = ref<UserMoreInfo[]>();
const visible = ref(props.visibleDialog);
watch(searchKeyword, (value) => {
  usersMoreDetails.value = usersMoreDetailsTemp.value;
  usersMoreDetails.value = usersMoreDetails.value?.filter(
    (x: any) =>
      x.userName.toLowerCase().includes(value?.toLowerCase())
          || x.userName.toLowerCase().includes(value?.toLowerCase())
          || x.email.toLowerCase().includes(value?.toLowerCase())
          || x.phone.toLowerCase().includes(value?.toLowerCase()),
  );
});

const submitForm = () => {
  emits('update:modelValue', Array.from(userIds.value));
  emits('hide-dialog');
};

getAllUserMoreInfoNotCurrentUserGraphql().onResult((res) => {
  users.value = res.data.getAllUserMoreInfoNotCurrentUser.map((res: UserMoreInfo) => ({
    ...res,
    roles: res.roles?.filter((role: any) =>
      Object.values(RoleType).includes(role),
    ),
  }));

  const usersMoreInfo: any[] = [];
  res.data.getAllUserMoreInfoNotCurrentUser.forEach((user: any) => {
    user.roles?.forEach((role: string) => {
      if (
        Object.values(RoleType).includes(role as RoleType)
          && user.departments.length > 0
      ) {
        usersMoreInfo.push({
          userId: user.id,
          userName: user.fullName,
          username: user.username,
          deptId: user.departments.length > 0 ? user.departments[0]?.id : '',
          deptName:
              user.departments.length > 0 ? user.departments[0]?.name : '',
          roleId: role,
          roleName: mapRoleName.value.get(role) || '',
          id: `${user.id}_${role}`,
          phone: user.phone,
          email: user.email,
        });
      }
    });
  });
  usersMoreDetails.value = usersMoreInfo;
  usersMoreDetailsTemp.value = usersMoreInfo;
});

watch(
  () => props.modelValue,
  () => {
    userIds.value = props.modelValue || [];
  },
);
</script>

<style scoped></style>
