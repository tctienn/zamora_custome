<template>
  <Dialog
    v-model:visible='visible'
    :breakpoints="{ '960px': '50vw', '640px': '75vw' }"
    :header='t("common.selectUser")'
    modal
    :pt='{
      content: {
        class: "p-0 relative"
      }
    }'
    style='width: 30vw;'>
    <template #default>
      <form
        class='p-2 sticky surface-ground top-0 z-1'
        @submit.prevent='search'>
        <InputGroup>
          <InputText
            v-model='keyword'
            class='w-full'
            :placeholder='`${t("common.search")} ${t("common.user").toLowerCase()}...`'/>
          <Button
            icon='pi pi-search'
            type='submit'/>
        </InputGroup>
      </form>

      <div class='flex flex-column gap-1'>
        <Panel
          v-for='dept of groupedUsers'
          :key='dept.code'
          :pt='{
            header: {
              class: "border-noround font-bold"
            },
            content: {
              class: "border-noround p-1"
            }
          }'
          toggleable>
          <template #header>
            <Checkbox
              v-if='multiple'
              binary
              :model-value='dept.users.every(user => isUserSelected(user.id))'
              @update:model-value='toggleAllUsersInDepartment($event, dept.code)'/>
            <div>
              <i class='pi pi-building'/>
              {{ dept.name }}
            </div>
          </template>
          <div class='flex flex-column gap-2'>
            <div
              v-for='user of dept.users'
              :key='user.id'
              class='align-items-center cursor-pointer flex gap-2 hover:surface-hover px-3 py-2'
              @click='selectUser(user.id)'>
              <Checkbox
                binary
                :model-value='isUserSelected(user.id)'/>
              <AppUser
                avatar-size='3'
                info-visible
                :infos='["positionName", "username"]'
                name-visible
                :user-id='user.id'/>
            </div>
          </div>

        </Panel>
      </div>

    </template>
    <template #footer>
      <ButtonIcon
        v-for='(button, index) in footerButtons'
        :key='index'
        v-bind='button'
        :icon='button.icon'
        @click='button.command'/>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { computed, onMounted, onUpdated, type PropType, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { convertAlias } from '@/common/helpers/utils';

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  filterFunction: {
    type: Function,
    default: () => true
  },
  showSelectAll: {
    type: Boolean,
    default: true
  }
});
const emits = defineEmits(['update:modelValue']);
const { t } = useI18n();

const infoStore = useUserMoreInfoStore();
const { allUsers } = storeToRefs(infoStore);
const keyword = ref('');

const visible = defineModel('visible', {
  type: Boolean,
  default: false
});
const selectUserIds = ref<Set<string>>(new Set());

const groupedUsers = ref<{ [key: string]: { code: string, name: string, users: UserMoreInfo[] }; }>({});

function isUserSelected(userId: string) {
  return selectUserIds.value.has(userId);
}

function selectUser(userId: string) {
  if (selectUserIds.value.has(userId)) {
    selectUserIds.value.delete(userId);
  } else {
    if (props.multiple) {
      selectUserIds.value.add(userId);
    } else {
      selectUserIds.value = new Set([userId]);
    }
  }
}

function search() {
  groupedUsers.value = filterGroupedUsers();
}

function filterGroupedUsers() {
  const groupedUsers: { [key: string]: { code: string, name: string, users: UserMoreInfo[] } } = {};
  const filterUsers = allUsers.value
    .filter(user => props.filterFunction(user))
    .filter(user => {
      return convertAlias(user.fullName).includes(convertAlias(keyword.value)) || user.email.includes(convertAlias(keyword.value));
    });

  filterUsers.forEach(user => {
    user?.departments?.forEach(department => {
      if (!groupedUsers[department.code]) {
        groupedUsers[department.code] = {
          code: department.code,
          name: department.name,
          users: []
        };
      }
      groupedUsers[department.code].users.push(user);
    });
  });

  const noneDept = filterUsers.filter(user => user?.departments?.length === 0);
  if (noneDept.length > 0) {
    groupedUsers['no-dept'] = {
      code: 'no-dept',
      name: t('common.noDepartment'),
      users: noneDept
    };
  }

  return groupedUsers;
}

function toggleAllUsersInDepartment(isSelectedAll: boolean, departmentCode: string) {
  const users = groupedUsers.value[departmentCode].users;
  if (isSelectedAll) {
    users.forEach(user => selectUserIds.value.add(user.id));
  } else {
    users.forEach(user => selectUserIds.value.delete(user.id));
  }
}

const dialogFooterButtons = {
  closeButton: {
    command: () => visible.value = false,
    icon: 'close',
    label: t('common.close'),
    severity: 'danger',
  },
  saveButton: {
    command: () => {
      emits('update:modelValue', Array.from(selectUserIds.value));
      visible.value = false;
    },
    icon: 'check',
    label: t('common.select'),
  },
  saveAllButton: {
    command: () => {
      emits('update:modelValue', allUsers.value.map(obj => obj.id));
      visible.value = false;
    },
    icon: 'check',
    label: t('common.selectAll'),
  }
};

provide('dialogFooterButtons', dialogFooterButtons);

const footerButtons = computed(() => {
  const buttons = { ...dialogFooterButtons };
  if (!props.showSelectAll) {
    const keys = Object.keys(buttons);
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      delete buttons[lastKey as keyof typeof buttons];
    }
  }
  return buttons;
});

watch(() => props.modelValue, () => {
  selectUserIds.value = new Set(props.modelValue);
});

watch(() => allUsers.value, () => {
  search();
});

onMounted(() => {
  infoStore.fetchAllUsers();
  search();
});

onUpdated(() => {
  if (visible.value) {
    search();
  }
});
</script>

<style scoped>

</style>
