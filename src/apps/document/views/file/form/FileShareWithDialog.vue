<template>
  <Dialog
    v-model:visible='visible'
    header='Chia sẻ hồ sơ'
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 55vw'
    @hide="emits('hide-dialog')">
    <form ref='form'>
      <div class='p-fluid'>
        <div class='font-bold'>Tên hồ sơ: {{ file?.fileName }}</div>
        <div class='font-bold my-3'>Chọn người cần chia sẻ</div>
        <NamedMultiSelectUser
          v-model:list-user='users'
          class='p-component w-full'
          name='shareUser'
          :options='usersOp'
          :show-button-add='false'
          @hide-overlay='users = []'/>
        <DataTable
          v-model:selection='selectedRow'
          class='mt-3'
          style='max-height: 25rem; min-height: 15rem'
          v-bind='DEFAULT_DATATABLE_CONFIG'
          :value='shareUserList'>
          <Column
            header='Danh sách chia sẻ'
            style='width: 30%'>
            <template #body='{ data: { userId } }'>
              <AppUser
                avatar-size='3'
                info-visible
                :infos="['positionName', 'departments']"
                name-visible
                :user-id='userId'></AppUser>
            </template>
          </Column>
          <Column
            class='text-center'
            header='Toàn quyền'
            style='width: 15%'>
            <template #body='{ data: { userId } }'>
              <div class='align-items-center flex justify-content-center'>
                <Checkbox
                  binary
                  :model-value='
                    getPermission(userId, Permission.FULL_PERMISSION)
                  '
                  @change='setPermission(userId, Permission.FULL_PERMISSION)'/>
              </div>
            </template>
          </Column>
          <Column
            class='text-center'
            header='Xem'>
            <template #body='{ data: { userId } }'>
              <div class='align-items-center flex justify-content-center'>
                <Checkbox
                  binary
                  :disabled='getPermission(userId, Permission.FULL_PERMISSION)'
                  :model-value='getPermission(userId, Permission.READ)'
                  @change='setPermission(userId, Permission.READ)'/>
              </div>
            </template>
          </Column>
          <Column
            class='text-center'
            header='Sửa'>
            <template #body='{ data: { userId } }'>
              <div class='align-items-center flex justify-content-center'>
                <Checkbox
                  binary
                  :disabled='getPermission(userId, Permission.FULL_PERMISSION)'
                  :model-value='getPermission(userId, Permission.UPDATE)'
                  @change='setPermission(userId, Permission.UPDATE)'/>
              </div>
            </template>
          </Column>
          <Column
            class='text-center'
            header='Xóa'>
            <template #body='{ data: { userId } }'>
              <div class='align-items-center flex justify-content-center'>
                <Checkbox
                  binary
                  :disabled='getPermission(userId, Permission.FULL_PERMISSION)'
                  :model-value='getPermission(userId, Permission.DELETE)'
                  @change='setPermission(userId, Permission.DELETE)'/>
              </div>
            </template>
          </Column>
          <Column
            class='text-center'
            header='Ghi'>
            <template #body='{ data: { userId } }'>
              <div class='align-items-center flex justify-content-center'>
                <Checkbox
                  binary
                  :disabled='getPermission(userId, Permission.FULL_PERMISSION)'
                  :model-value='getPermission(userId, Permission.WRITE)'
                  @change='setPermission(userId, Permission.WRITE)'/>
              </div>
            </template>
          </Column>
          <Column
            class='text-center'
            :header="t('common.action')"
            style='width: 15%'>
            <template #body='{ data: { userId } }'>
              <div class='flex justify-content-center'>
                <ButtonIcon
                  v-tooltip.top="t('common.delete')"
                  class='icon-delete toggle'
                  icon='delete'
                  icon-size='1.7'
                  rounded
                  text
                  @click='deleteUserPermission(userId)'/>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </form>
    <template #footer>
      <div
        class='fixed flex gap-2 justify-content-center pb-2 surface-overlay w-full'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          type='submit'
          @click='submit'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getFileInfoById, saveShareUser, } from '@/apps/document/api/graphql/file';
import { type FileInterface, Permission } from '@/apps/document/model/file';
import AppUser from '@/common/components/app/AppUser.vue';
import NamedMultiSelectUser from '@/common/components/custom/NamedMultiSelectUser.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { convertAlias } from '@/common/helpers/utils';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['hide-dialog', 'reload']);
const visible = ref(props.visibleDialog);
const { t } = useI18n();

const selectedRow = ref();
const users = ref<string[]>([]);
const shareUserList = ref<ShareUser[]>([]);

interface ShareUser {
  userId: string;
  permission: string[];
}

const file = ref<FileInterface>();

const { onResult: getFileInfoByIdResult } = getFileInfoById(props.id);
getFileInfoByIdResult((res) => {
  file.value = res.data.getFileInfoById;
  shareUserList.value = cloneDeep(res.data.getFileInfoById?.shareUser) || [];
});

const { allUsers } = storeToRefs(useUserMoreInfoStore());
const usersOp = computed(() =>
  allUsers.value
    .map((user) => {
      return {
        ...user,
        aliasName: convertAlias(user.fullName),
      };
    })
    .filter((item) => item.id !== file.value?.createdBy),
);

watch(users, (newUsers) => {
  const missingUsers = newUsers.filter(
    (userId) =>
      !shareUserList.value?.some(
        (shareUser: ShareUser) => shareUser.userId === userId,
      ),
  );

  missingUsers.forEach((userId: string) => {
    shareUserList.value = [
      ...shareUserList.value,
      {
        userId,
        permission: [],
      },
    ];
  });
});

const {
  mutate: saveShareUserMutate,
  onDone: saveShareUserOnDone
} =
  saveShareUser();

const submit = () => {
  saveShareUserMutate({
    id: props.id,
    shareUsers: shareUserList.value,
  });
};

saveShareUserOnDone(() => {
  toastSuccess({ message: t('document.file.saveDone') });
  emits('hide-dialog');
  emits('reload');
});

const getPermission = (userId: string, permission: string) => {
  const user = shareUserList.value.find((item) => item.userId === userId);
  return user?.permission.includes(permission) || false;
};

const setPermission = (userId: string, newPermission: string) => {
  const item = shareUserList.value.find(
    (item: ShareUser) => item.userId === userId,
  );

  if (item) {
    if (item.permission.includes(newPermission)) {
      if (newPermission === Permission.FULL_PERMISSION) {
        item.permission = [];
      } else {
        item.permission = item.permission.filter(
          (perm) => perm !== newPermission,
        );
      }
    } else {
      if (newPermission === Permission.FULL_PERMISSION) {
        item.permission = [
          Permission.FULL_PERMISSION,
          Permission.READ,
          Permission.UPDATE,
          Permission.WRITE,
          Permission.DELETE,
        ];
      } else {
        item.permission.push(newPermission);
      }
    }
  }
};
const confirm = useConfirm();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());

function deleteUserPermission(id: string) {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('document.file.userPermission'),
      itemName: usersMoreInfo.value[id].fullName,
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      users.value = users.value.filter((item: string) => item !== id);
      shareUserList.value = shareUserList.value.filter(
        (item: ShareUser) => item.userId !== id,
      );
    },
  });
}
</script>

<style scoped>
:deep(.p-fluid .p-button) {
  width: unset !important;
}
</style>
