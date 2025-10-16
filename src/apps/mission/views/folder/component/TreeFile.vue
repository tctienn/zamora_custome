<template>
  <div
    v-if='props.title'
    class='align-items-center flex gap-1 mt-2 pl-5'>
    <AppIcon
      name='deployed_code'
      size='1.5'/>
    <span class='font-bold'>{{ props.title }}</span>
  </div>
  <Tree
    v-model:selection-keys='selectedFile'
    class='border-noround-bottom border-noround-right ecm-tree flex-grow-1 overflow-y-auto'
    :meta-key-selection='true'
    selection-mode='single'
    :value='tree'>
    <template #default='{ node }'>
      <div
        class='align-items-center flex gap-2 justify-content-between text-color w-full'
        :class="{
          'text-primary current-folder': isCurrentFolder(node.key || ''),
          'label-child': node.data.folderParent !== null
        }">
        <div class='align-items-center flex gap-2 label-container'>
          <AppUser
            v-if='node.data.folderParent === null'
            :overlay-visible='true'
            :user-id='node.data.createdBy'/>
          <AppIcon
            :class="
              checkFileIOwn(node.data.createdBy)
                ? 'text-orange-400'
                : 'text-blue-400'
            "
            fill
            name='folder'
            size='1.5'/>
          <div
            class='label-truncated'
            :class="{
              'text-red-400': !node.data.status,
              'font-bold': !node.parentId,
            }">
            {{ node.label }}
          </div>
        </div>

        <div class='group-btn'>
          <div class='flex gap-2'>
            <ButtonIcon
              v-for='(button, index) in filterBtn(node.data)'
              :key='index'
              v-tooltip.top='button.tooltip'
              :class="
                button.icon === 'delete'
                  ? 'text-red-400'
                  : 'text-700 hover:text-blue-600'
              "
              :icon='button.icon'
              icon-size='1.5'
              rounded
              text
              @click="button.onClick(node.key || '')"/>
          </div>
        </div>
      </div>
    </template>
  </Tree>
</template>

<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import type { Ref } from 'vue';
import { computed, type PropType, ref, watch } from 'vue';
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

import { Permission } from '@/apps/document/model/file';
import { deleteFolder } from '@/apps/mission/api/graphql/folder';
import AppUser from '@/common/components/app/AppUser.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  listFile: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
});

const emits = defineEmits([
  'fileId',
  'addNewFile',
  'shareFile',
  'updateFileInfo',
  'addJobToFolder',
  'showLog',
  'reload',
]);

const { t } = useI18n();
const { user } = useUserStore();
const selectedFile = ref();
const fileId = ref();
const nameFolder = inject<Ref<string>>('nameFolder', ref(''));
const tree = computed(() =>
  listToTree(
    props.listFile.map((item: any) => ({
      key: item.id,
      label: item.folderName,
      data: item,
      parentId: item.folderParent,
      children: [],
    })),
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  ),
);

watch(
  selectedFile,
  (newVal) => {
    if (newVal) {
      fileId.value = Object.keys(newVal)[0];
      console.log('Selected file:', getNameFile(fileId.value));
      nameFolder.value = getNameFile(fileId.value);
      emits('fileId', fileId.value);
    }
  },
  { deep: true },
);

const checkFileIOwn = (createBy: string) => {
  return createBy === user.id;
};

function isCurrentFolder(id: string) {
  return selectedFile.value?.[id];
}

const filterBtn = (data: any) => {
  const userPermission =
    data.createdBy === user.id
      ? [Permission.FULL_PERMISSION]
      : data.shareUser?.find((item: any) => item.userId === user.id)
        ?.permission || [];
  if (userPermission.includes(Permission.FULL_PERMISSION)) {
    return buttonIcons;
  }
  return buttonIcons.filter((button) =>
    button.permission?.some((perm) => userPermission.includes(perm)),
  );
};

interface ButtonType {
  tooltip: string;
  icon: string;
  onClick: any;
  permission?: Permission[];
}

const confirm = useConfirm();
const {
  mutate: deleteFileMutate,
  onDone: deleteFileOnDone
} = deleteFolder();

const addNewFile = (id: string) => {
  emits('addNewFile', id);
};
const shareFile = (id: string) => {
  emits('shareFile', id);
};
const addDocToFile = (id: string) => {
  emits('addJobToFolder', id);
};

const updateFileInfo = (id: string) => {
  emits('updateFileInfo', id);
};

const showLog = (id: string) => {
  emits('showLog', id);
};

const buttonIcons: ButtonType[] = [
  {
    tooltip: 'Thêm mới',
    icon: 'create_new_folder',
    onClick: addNewFile,
    permission: [Permission.WRITE],
  },
  /*  {
      tooltip: 'Chia sẻ',
      icon: 'share',
      onClick: shareFile,
      permission: [Permission.WRITE],
    },*/
  {
    tooltip: '',
    icon: 'sell',
    onClick: addDocToFile,
    permission: [Permission.WRITE],
  },
  {
    tooltip: 'Sửa',
    icon: 'edit',
    onClick: updateFileInfo,
    permission: [Permission.UPDATE],
  },
  {
    tooltip: t('common.delete'),
    icon: 'delete',
    onClick: function handleDeleteFileType(id: string) {
      confirm.require({
        message: t('common.confirmDelete', {
          itemType: t('document.file.file'),
          itemName: getNameFile(id),
        }),
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          deleteFileMutate({ id: id });
        },
      });
    },
    permission: [Permission.DELETE],
  },
  {
    tooltip: 'Xem hoạt động',
    icon: 'schedule',
    onClick: showLog,
    permission: [Permission.FULL_PERMISSION],
  },
];

deleteFileOnDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('document.file.file'),
      itemName: getNameFile(Object.keys(selectedFile.value)[0]),
    }),
  });
  confirm.close();
  emits('reload');
});

const getNameFile = (id: string) => {
  return props.listFile.find((item: any) => item.id === id)?.folderName;
};
</script>

<style scoped>
:deep(.p-treenode-label) {
  width: 100%;
  display: flex;
  overflow: hidden;

  .group-btn {
    display: none;
  }
}

:deep(.p-treenode-label):hover {
  .group-btn {
    display: flex;
  }
}

.label-container {
  flex-grow: 1;
  min-width: 0;
}

.label-child {
  margin-left: 30px;
}

.label-truncated {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
</style>
