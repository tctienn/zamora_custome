<template>
  <div class='flex flex-column gap-1'>
    <Panel
      v-for='group of groupedUsers'
      :key='group.code'
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
          :model-value='group.users.every(user => isUserSelected(user.id))'
          @update:model-value='toggleAllUsers($event, group.code)'/>
        <div>
          <i class='pi pi-building'/>
          {{ group.name }}
        </div>
      </template>
      <div class='flex flex-column gap-2'>
        <div
          v-for='user of group.users'
          :key='user.id'
          class='align-items-center cursor-pointer flex gap-2 hover:surface-hover px-3 py-2'
          @click='selectUser(user.id)'>
          <Checkbox
            binary
            :model-value='isUserSelected(user.id)'/>
          <AppUser
            avatar-size='3'
            info-visible
            :infos='["email", "positionName"]'
            name-visible
            :user-id='user.id'/>
        </div>
      </div>

    </Panel>
  </div>
</template>

<script setup lang='ts'>
import { computed, inject, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array as PropType<UserMoreInfo[]>,
    default: () => []
  },
  groupedBy: {
    type: String as PropType<'department' | 'position' | undefined>,
    default: 'department'
  }
});
const { t } = useI18n();

const selectUser = inject('selectUser', (id: string) => void {});
const isUserSelected = inject('isUserSelected', (id: string) => false);

type GroupedUser = { [key: string]: { code: string, name: string, users: UserMoreInfo[] } }

const groupedUsers = computed((): GroupedUser => {
  switch (props.groupedBy) {
  case 'position':
    return groupByPosition(props.users);
  case 'department':
    return groupByDepartment(props.users);
  default:
    return {
      '': {
        code: '',
        name: '',
        users: props.users
      }
    };
  }
});

function groupByPosition(users: UserMoreInfo[]): GroupedUser {
  const groupedUsers: GroupedUser = {};

  users.forEach(user => {
    if (user.position && user.position.length > 0) {
      user.position.forEach(pos => {
        if (!groupedUsers[pos]) {
          groupedUsers[pos] = {
            code: pos,
            name: user.positionName.join(', '),
            users: []
          };
        }
        groupedUsers[pos].users.push(user);
      });
    } else {
      if (!groupedUsers['no-position']) {
        groupedUsers['no-position'] = {
          code: 'no-position',
          name: t('common.noPosition'),
          users: []
        };
      }
      groupedUsers['no-position'].users.push(user);
    }
  });

  return groupedUsers;
}

function groupByDepartment(users: UserMoreInfo[]): GroupedUser {
  const groupedUsers: GroupedUser = {};
  users.forEach(user => {
    user.departments.forEach(dept => {
      if (!groupedUsers[dept.code]) {
        groupedUsers[dept.code] = {
          code: dept.code,
          name: dept.name,
          users: []
        };
      }
      groupedUsers[dept.code].users.push(user);
    });
  });

  const noneDept = users.filter(user => user.departments.length === 0);
  if (noneDept.length > 0) {
    groupedUsers['no-dept'] = {
      code: 'no-dept',
      name: t('common.noDepartment'),
      users: noneDept
    };
  }
  return groupedUsers;
}

function toggleAllUsers(all: boolean, code: string) {
  const users = groupedUsers.value[code].users;
  users.forEach(user => {
    if (isUserSelected(user.id) !== all) {
      selectUser(user.id);
    }
  });
}

</script>

<style scoped>

</style>