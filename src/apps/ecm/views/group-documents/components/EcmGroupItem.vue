<template>
  <component
    :is='viewerType'
    :group='props.group'
    :group-admin-names='groupAdminNames'
    @select-group='selectGroup'
    @show-menu-action='showMenuAction'></component>

  <ContextMenu
    ref='menuAction'
    :model='menuActions'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </ContextMenu>

  <GroupForm
    v-if='userGroupFormVisible'
    :item='userGroup'
    :visible-dialog='userGroupFormVisible'
    @hide-dialog-form='hideLogUserFormDialog'
    @reload-form='reload'/>

  <FormGroupDetail
    v-if='formGroupDetailVisible'
    :item='userGroup'
    :visible-dialog='formGroupDetailVisible'
    @hide-dialog='hideLogUserFormDialog'
    @reload='reload'/>

  <FormDecentralization
    v-if='formDecentralizationVisible'
    :group='userGroup'
    :visible-dialog='formDecentralizationVisible'
    @hide-dialog='hideLogUserFormDialog'
    @reload='reload'/>

  <FormAddUser
    v-if='userGroupAddFormVisible'
    :group='userGroup'
    :visible-dialog='userGroupAddFormVisible'
    @hide-dialog='hideLogUserFormDialog'
    @reload='reload'/>
</template>

<script setup lang='ts'>
import { filter, find, join, map } from 'lodash';
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, onUnmounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { Level, UserLike } from '@/apps/admin/model/userGroup';
import { deleteGroupGraphql, likeOrDislikeGroup, lockGroupGraphql } from '@/apps/ecm/api/graphql/group-graphql-api';
import FormAddUser from '@/apps/ecm/views/group/FormAddUser.vue';
import FormDecentralization from '@/apps/ecm/views/group/FormDecentralization.vue';
import FormGroupDetail from '@/apps/ecm/views/group/FormGroupDetail.vue';
import GroupForm from '@/apps/ecm/views/group/GroupCreateOrUpdateForm.vue';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import type { Group } from '@/common/model/group';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  group: {
    type: Object as PropType<Group>,
    default: {} as Group
  },
  layout: {
    type: String as PropType<'list' | 'grid'>,
    default: 'list'
  }
});

const { user } = storeToRefs(useUserStore());
const viewerType = computed(() => props.layout === 'list' ? 'EcmGroupListItem' : 'EcmGroupGridItem');
const userGroup = ref<Group>(props.group);
const { t } = useI18n();
const router = useRouter();
const groupAdminNames = computed(() => join(map(filter(props.group.users, ['level', Level[Level.MANAGE]]), 'fullName'), ', '));
const userGroupFormVisible = ref(false);
const menuAction = ref();
const formGroupDetailVisible = ref(false);
const formDecentralizationVisible = ref(false);
const userGroupAddFormVisible = ref(false);
const confirm = useConfirm();
const {
  mutate: likeOrDislikeGroupMutate,
  onDone: likeOrDislikeGroupOnDone
} = likeOrDislikeGroup();

const isFavorite = computed(() => find(props.group.favoriteUserList, { id: user.value.id }));
const isAdmin = computed(() => find(props.group.users, {
  id: user.value.id,
  level: Level[Level.MANAGE]
}));

const commonActions = computed(() => [
  {
    label: t('admin.userGroup.detail'),
    icon: 'info',
    command: () => {
      detail();
    }
  },
  {
    label: t(`common.${isFavorite.value ? 'disLike' : 'like'}`),
    icon: isFavorite.value ? 'heart_minus' : 'favorite',
    command: () => {
      likeOrDislikeGroupFn();
    }
  }
]);

const managerActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editUserGroup();
    }
  },
  {
    label: t('ecm.group.memberManagement'),
    icon: 'groups_2',
    command: () => {
      addUserGroup();
    }
  },
  {
    label: `${t('common.lock')}/${t('common.unlock')}`,
    icon: 'lock',
    command: () => {
      lockUserGroup();
    }
  },
  {
    label: t('admin.userGroup.decentralization'),
    icon: 'social_leaderboard',
    command: () => {
      decentralization();
    }
  },
  // {
  //   label: t('ecm.group.disband'),
  //   icon: 'group_off',
  //   command: () => void {}
  // },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteUserGroup();
    }
  },
];

const menuActions = computed(() => commonActions.value.concat(isAdmin.value ? managerActions : []));

function showMenuAction(event: Event) {
  EventBus.emit('hide-group-menu-action');
  setTimeout(() => menuAction.value.toggle(event), 100);
}

function hideMenuAction() {
  menuAction.value.hide();
}

function selectGroup() {
  router.push({
    name: 'EcmGroupMainPage',
    params: { id: props.group.id }
  });
}

function reload() {
  EventBus.emit('reload-data');
}

function addUserGroup() {
  userGroupAddFormVisible.value = true;
}

function editUserGroup() {
  userGroupFormVisible.value = true;
}

function likeOrDislikeGroupFn() {
  likeOrDislikeGroupMutate({ groupId: userGroup.value.id });
  reload();
}

likeOrDislikeGroupOnDone((res) => {
  if (res.data.likeOrDislikeGroup.favoriteUserList.find((u: UserLike) => u.id == user.value.id) == undefined) {
    toastSuccess({ message: t('ecm.group.disLikeSuccess') });
  } else {
    toastSuccess({ message: t('ecm.group.likeSuccess') });
  }
  reload();
});

function hideLogUserFormDialog() {
  EventBus.emit('reload-data');
  userGroupFormVisible.value = false;
  formGroupDetailVisible.value = false;
  formDecentralizationVisible.value = false;
  userGroupAddFormVisible.value = false;
}

function detail() {
  formGroupDetailVisible.value = true;
}

const {
  mutate: deleteUserGroupMutate,
  onDone: deleteUserGroupDone,
  onError: deleteUserGroupError
} = deleteGroupGraphql();

deleteUserGroupDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.userGroup.userGroupName'),
      itemName: userGroup.value.name
    })
  });
  confirm.close();
  reload();
});

deleteUserGroupError((error) => {
  toastErrorData({ error });
});

function deleteUserGroup() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.userGroup.userGroupName'),
      itemName: userGroup.value.name
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteUserGroupMutate({ id: userGroup.value.id });
    }
  });
}

function decentralization() {
  formDecentralizationVisible.value = true;
}

const {
  mutate: lockUserGroupMutate,
  onDone: lockUserGroupDone,
} = lockGroupGraphql();

function lockUserGroup() {
  if (userGroup.value.status == 'ACTIVE') {
    confirm.require({
      message: t('common.confirmLock', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name
      }),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        lockUserGroupMutate({ id: userGroup.value.id });
      }
    });
  } else {
    confirm.require({
      message: t('common.confirmUnLock', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name
      }),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        lockUserGroupMutate({ id: userGroup.value.id });
      }
    });
  }
}

lockUserGroupDone((e) => {
  if (e.data.lockOrUnlockGroup.status == 'ACTIVE') {
    toastSuccess({
      message: t('common.result.message.locked', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name
      })
    });
  } else {
    toastSuccess({
      message: t('common.result.message.unlocked', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name
      })
    });
  }
  confirm.close();
  reload();
});

onMounted(() => {
  EventBus.on('hide-group-menu-action', hideMenuAction);
});

onUnmounted(() => {
  EventBus.off('hide-group-menu-action', hideMenuAction);
});
</script>

<script lang='ts'>
import EcmGroupGridItem from '@/apps/ecm/views/group-documents/components/EcmGroupGridItem.vue';
import EcmGroupListItem from '@/apps/ecm/views/group-documents/components/EcmGroupListItem.vue';

export default {
  name: 'EcmGroupItem',

  components: {
    EcmGroupGridItem,
    EcmGroupListItem
  }
};
</script>

<style scoped lang='scss'>
:deep(.group-avatar) {
  img {
    object-fit: contain;
    border-radius: inherit;
  }
}
</style>