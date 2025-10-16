<template>
  <Dialog
    v-model:visible='visibleDialogPublished'
    class='h-full'
    header='Gửi văn bản đến để biết'
    :pt="{
      content: {
        class: 'pt-2'
      }
    }"
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 80vw'>
    <!-- Button Row -->
    <div class='align-items-center flex gap-2 justify-content-between mb-3'>
      <!-- Radio buttons for selection mode -->
      <div class='align-items-center col-6 flex gap-5 justify-content-between p-0'>
        <div class='flex gap-5'>
          <label class='flex gap-1'>
            <RadioButton
              v-model='option'
              name='source'
              value='all'>
            </RadioButton>
            <p class='font-semibold'>Tất cả</p>
          </label>

          <label class='flex gap-1'>
            <RadioButton
              v-model='option'
              name='source'
              value='user'>
            </RadioButton>
            <p class='font-semibold'>Người dùng</p>
          </label>

          <label class='flex gap-1'>
            <RadioButton
              v-model='option'
              name='source'
              value='group'>
            </RadioButton>
            <p class='font-semibold'>Nhóm</p>
          </label>

          <label class='flex gap-1'>
            <RadioButton
              v-model='option'
              name='source'
              value='position'>
            </RadioButton>
            <p class='font-semibold'>Chức vụ</p>
          </label>
        </div>
        <InputText
          v-model='searchKeyword'
          class='w-20rem'
          :placeholder="t('common.search')"/>
      </div>

      <!-- Search and Action buttons -->
      <div class='align-items-center col-6 flex gap-2 justify-content-end p-0'>
        <Button
          v-tooltip.top="t('common.deleteAll')"
          class='border-1 border-red-500 border-round-sm'
          icon='pi pi-trash'
          severity='danger'
          text
          @click='deleteAll'>
        </Button>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div
      class='flex gap-2'
      style='height: calc(80vh - 120px)'>
      <div class='border-1 col-6 surface-border'>
        <UserOrganization
          v-model='selectedUser'
          v-model:select-group='selectedGroup'
          v-model:select-positions='selectedPositions'
          :hide-controls='true'
          :option='option'
          :search-keyword='searchKeyword'
          style='height: calc(80vh - 160px)'/>
      </div>
      <div class='border-1 col-6 surface-border'>
        <ReceiveListUser
          v-model='selectedUser'
          class='overflow-y-auto w-full'
          :hide-delete-all='true'
          style='height: calc(80vh - 120px)'/>
      </div>
    </div>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          class='border-round-sm'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='visibleDialogPublished = false'/>
        <Button
          class='border-round-sm'
          :disabled='selectedUser.length == 0'
          icon='pi pi-send'
          label='Gửi'
          @click='saveCC'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Position } from '@/apps/admin/model/position';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { ccDoc } from '@/apps/document/api/rest/ccInfo';
import type { CcdocInterface } from '@/apps/document/model/ccdoc';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import UserOrganization from '@/apps/document/views/doc/UserOrganization.vue';
import ReceiveListUser from '@/apps/work-flow/views/components/ReceiveListUserDept/ReceiveListUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import type { User } from '@/common/model/User';

const props = defineProps({
  docId: {
    type: String,
    required: true
  },
  userDeptRole: {
    type: Object as PropType<UserDeptRoleInput>,
    required: true
  }
});
const visibleDialogPublished = defineModel<boolean>('visibleDialogPublished', { default: false });
const { t } = useI18n();
const { type } = storeToRefs(useDocumentRolesStore());
const userMoreInfoStore = useUserMoreInfoStore();
const { allUsers } = storeToRefs(userMoreInfoStore);
const selectedUser = ref<Array<UserDeptRoleInput & { id: string }>>([]);
const selectedGroup = ref();
const selectedPositions = ref();
const userInGroupTemp = ref<any[]>([]);
const option = ref<string>('all');
const searchKeyword = ref<string>();

function deleteAll() {
  selectedUser.value = [];
}

function saveCC() {
  const ccDocModel: CcdocInterface = {} as CcdocInterface;
  ccDocModel.ccInfoModels = selectedUser.value.map(item => ({
    docId: props.docId,
    receiverId: item.userId,
    receiverRoleId: item.roleId,
    receiverDeptId: item.deptId,
    receiverName: item.userName,
    receiverRoleName: item.roleName,
    receiverDeptName: item.deptName
  }));
  ccDocModel.userDeptRole = props.userDeptRole;
  ccDoc(ccDocModel).then(() => {
    toastSuccess({ message: 'Gửi để biết thành công.' });
    visibleDialogPublished.value = false;
  });
}

watch(selectedGroup, (value) => {
  userInGroupTemp.value = [...userInGroupTemp.value, ...value?.flatMap((group: any) => group.users).map((user: any) => ({ id: user.id })) || []];
  selectedUser.value = selectedUser.value.filter((su: any) => !userInGroupTemp.value.some((uigt: any) => uigt.id == su.id));
  selectedUser.value = [...selectedUser.value, ...value?.flatMap((group: any) => group.users).filter((v: any) => v.deptId).map((user: any) => ({
    userId: user.userId,
    roleName: user.roleName,
    userName: user.userName,
    deptName: user.deptName,
    deptId: user.deptId,
    roleId: user.roleId,
    type: 'ADMINISTRATIVE',
    id: user.id
  })) || []];
});

watch(selectedPositions, (value) => {
  const data = allUsers.value.filter((user: any) => value?.some((position: Position) => position.name === user.positionName));

  selectedUser.value = selectedUser.value.filter((su: any) => !data.some((u: any) => u.id === su.id));
  const newUsers = data
    .map((user: any) => ({
      userId: user.id,
      roleName: user.roles[0],
      userName: user.username,
      deptName: user.departments[0].name,
      deptId: user.departments[0].id,
      roleId: user.roleId,
      id: user.id
    }));
  selectedUser.value = [...selectedUser.value, ...newUsers] as Array<UserDeptRoleInput & { id: string }>;
}, { deep: true });

onMounted(() => {
  userMoreInfoStore.fetchAllUsers();
});
</script>

<style scoped>

</style>