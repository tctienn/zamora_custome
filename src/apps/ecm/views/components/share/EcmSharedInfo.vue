<template>
  <AutoComplete
    v-model='userToAdd'
    class='w-full'
    input-class='w-full'
    :min-length='3'
    option-label='label'
    :placeholder='t("ecm.share.addSharedUser")'
    :suggestions='suggestUsers'
    @complete='searchShareUsers'
    @item-select='addSharedUser'/>
  <div class='font-bold py-2'>{{ t('ecm.share.accessiblePeople') }}</div>
  <DataView
    data-key='userId'
    :value='shareInfo.sharedUsers'>
    <template #list='{items}'>
      <div
        v-for='(data, index) in items'
        :key='index'>
        <div class='align-items-center border-bottom-1 col-12 flex'>
          <div class='col-8'>
            <AppUser
              name-visible
              :user-id='data.userId'/>
          </div>
          <div
            v-if='data.permission==="OWNER"'
            class='col-4'>
            {{ t('ecm.share.sharePermission.owner') }}
          </div>
          <div
            v-else
            class='align-items-center col-4 flex gap-1 pr-0'>
            <Dropdown
              class='p-inputtext-sm w-full'
              :model-value='data.permission'
              option-label='label'
              option-value='value'
              :options='sharePermission'
              @update:model-value='updateUserPermission($event, Number(index))'/>
            <AppIcon
              v-tooltip='t("common.delete")'
              class='cursor-pointer text-red-600'
              name='do_not_disturb_on'
              @click='removeSharedUser(Number(index))'/>
          </div>
        </div>
      </div>

    </template>
  </DataView>

  <div class='font-bold py-2'>{{ t('ecm.share.generalAccessPermission') }}</div>
  <div class='align-items-center flex gap-3 w-full'>
    <AppIcon
      class='flex-initial'
      :name='shareInfo.type === "PUBLIC" ? "public" : "lock"'
      size='1.5'/>
    <Dropdown
      v-model='shareInfoType'
      class='flex-auto'
      option-label='label'
      option-value='value'
      :options='shareType'
      @change='changeShareInfoType'/>
    <Dropdown
      v-if='shareInfo.type === "PUBLIC"'
      v-model='shareInfo.defaultPermission'
      class='flex-shrink-0'
      option-label='label'
      option-value='value'
      :options='sharePermission'>
      <template #header>
        <div class='font-bold pt-1 px-2'>{{ t('ecm.share.permission') }}</div>
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang='ts'>

import { clone, cloneDeep, omit } from 'lodash';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import type { ComputedRef } from 'vue';
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteShareInformation,
  getSearchShareUsers,
  getShareInformation,
  saveShareInformation
} from '@/apps/ecm/api/graphql/share';
import type { SharedUser, ShareInfo, ShareInfoInput } from '@/apps/ecm/model/share/share';
import AppUser from '@/common/components/app/AppUser.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const { t } = useI18n();
let _fileFolderId: string;
let _isFolder: boolean;
const dialogRef = inject<ComputedRef>('dialogRef');
const shareInfo = ref<ShareInfo>({ type: 'LIMITED' } as ShareInfo);
const shareInfoType = ref('LIMITED');
const userToAdd = ref<SharedUser>();
const suggestUsers = ref<SharedUser[]>([]);
const shareInfoInput = computed((): ShareInfoInput => {
  return {
    fileFolderId: _fileFolderId,
    isFolder: _isFolder,
    sharedUsers: shareInfo.value.sharedUsers,
    type: shareInfo.value.type,
    defaultPermission: shareInfo.value.defaultPermission
  };
});
const shareType = [
  {
    label: t('ecm.share.shareType.limited'),
    value: 'LIMITED'
  },
  {
    label: t('ecm.share.shareType.public'),
    value: 'PUBLIC'
  },
];
const sharePermission = [
  {
    label: t('ecm.share.sharePermission.view'),
    value: 'VIEW'
  },
  {
    label: t('ecm.share.sharePermission.edit'),
    value: 'EDIT'
  },
];

function searchShareUsers(event: AutoCompleteCompleteEvent) {
  if (event.query.length > 2) {
    getSearchShareUsers(event.query)
      .onResult((a) => {
        if (a.data.searchShareUsers) {
          suggestUsers.value = a.data.searchShareUsers.map((user: SharedUser) => ({
            ...user,
            label: user.fullName + ' - ' + user.email
          }));
        }
      });
  }
}

function addSharedUser() {
  if (userToAdd.value) {
    if (!shareInfo.value.sharedUsers.some(u => u.userId === userToAdd.value?.userId)) {
      const infoClone = clone(shareInfo.value);
      infoClone.sharedUsers = [...infoClone.sharedUsers, omit(userToAdd.value, 'label')];
      shareInfo.value = infoClone;
    }
    userToAdd.value = undefined;
  }
}

function removeSharedUser(index: number) {
  if (index > 0) {
    const infoClone = clone(shareInfo.value);
    infoClone.sharedUsers = infoClone.sharedUsers.filter((a, i) => i !== index);
    shareInfo.value = infoClone;
  }
}

function updateUserPermission(permission: string, index: number) {
  const infoClone = cloneDeep(shareInfo.value);
  infoClone.sharedUsers[index] = {
    ...shareInfo.value.sharedUsers[index],
    permission
  };
  shareInfo.value = infoClone;
}

function save() {
  saveShareInformation().mutate({ info: shareInfoInput.value })
    .then(() => {
      EventBus.emit('updateListFileFolder');
      toastSuccess();
    });
}

function stopShare() {
  deleteShareInformation().mutate({ path: shareInfo.value.path })
    .then(() => {
      EventBus.emit('updateListFileFolder');
      toastSuccess();
    });
}

onMounted(() => {
  const {
    id,
    isFolder
  } = dialogRef?.value.data || {
    fileFolderId: '',
    isFolder: false
  };
  _fileFolderId = id;
  _isFolder = isFolder;
  getShareInformation(id, isFolder)
    .onResult((a) => {
      if (a.data.shareInformation) {
        shareInfo.value = a.data.shareInformation;
        shareInfoType.value = shareInfo.value.type;
        EventBus.emit('usersShared', shareInfo.value.sharedUsers.length);
      }
    });
  EventBus.on('saveShareInformation', save);
  EventBus.on('stopShareInformation', stopShare);
});

onUnmounted(() => {
  EventBus.off('saveShareInformation', save);
  EventBus.off('stopShareInformation', stopShare);
});

function changeShareInfoType(event: DropdownChangeEvent) {
  const info = cloneDeep(shareInfo.value);
  info.type = event.value;
  shareInfo.value = info;
}

</script>

<script lang='ts'>
export default { name: 'EcmSharedInfo' };
</script>

<style scoped>
</style>
