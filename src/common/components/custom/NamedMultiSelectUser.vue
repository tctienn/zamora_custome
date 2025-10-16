<template>
  <input
    ref='inputId'
    hidden
    :name='props.name'
    type='text'
    :value='listUser'/>
  <div class='flex gap-2'>
    <MultiSelect
      v-bind='$attrs'
      v-model='listUser'
      append-to='body'
      class='multi-select w-full'
      :disabled='props.disable'
      display='chip'
      filter
      :filter-fields="['aliasName', 'fullName']"
      :max-selected-labels='props.selectMax'
      option-label='fullName'
      option-value='id'
      :options='options || finalAllUser'
      panel-class='named-multiselect-user-panel'
      :placeholder='placeholder'
      :pt="{
        panel: {
          style: {
            'width': getWidth+'px'
          }
        },
        label: {
          class:
            'flex-wrap flex align-items-center h-full w-fit p-scrollpanel-content',
        },
        token: {
          class: 'px-2 py-1 mb-2',
        },
      }"
      @hide="emits('hide-overlay')">
      <template #option='slotProps'>
        <AppUser
          avatar-size='2.5'
          info-visible
          :infos="['positionName', 'departments', 'username']"
          name-visible
          :user-id='slotProps.option.id'></AppUser>
      </template>

      <template #chip='{ value }'>
        <AppUser
          avatar-size='1.5'
          name-visible
          :user-id='value'></AppUser>
      </template>

      <!--    <template #footer>-->
      <!--      <div class='px-4 py-2'>-->
      <!--        <b>{{ selectedUsers ? selectedUsers.length : 0 }}</b>-->
      <!--        item{{ (selectedUsers ? selectedUsers.length : 0) > 1 ? 's' : '' }} selected.-->
      <!--      </div>-->
      <!--    </template>-->
    </MultiSelect>
    <ButtonIcon
      v-if='showButtonAdd'
      v-tooltip="t('meeting.common.selectUser')"
      class='cursor-pointer'
      :disabled='props.disable'
      icon='group_add'
      icon-size='1.25'
      @click='() => (showDialog = true)'>
    </ButtonIcon>
  </div>
  <SelectUserDialog
    v-model='listUser'
    v-model:visible='showDialog'
    :filter-function='filterUsersFunction'
    :multiple='true'>
  </SelectUserDialog>
</template>

<script lang='ts' setup>
import { computed, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserMoreInfoNotAdminGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import SelectUserDialog from '@/common/components/dialog/user/SelectUserDialog.vue';
import { convertAlias } from '@/common/helpers/utils';

const props = defineProps({
  disable: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: '',
  },
  selectedUserIds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '',
  },
  showButtonAdd: {
    type: Boolean,
    default: true,
  },
  options: {
    type: Array as PropType<UserMoreInfo[]>,
    default: undefined,
  },
  selectMax: {
    type: Number,
    default: 5,
  },
});
const emits = defineEmits(['hide-overlay']);
const { t } = useI18n();

const listUser = defineModel<string[]>('listUser', { default: [] });
const showDialog = ref(false);
const getWidth = ref();

onMounted(() => {
  const invalidInput = document.querySelector('.multi-select') as HTMLElement;
  if (invalidInput) {
    getWidth.value = invalidInput.offsetWidth;

  }
});

const infoStore = useUserMoreInfoStore();
const users = ref();
const { onResult: getAllUserOnResult } = getAllUserMoreInfoNotAdminGraphql();
getAllUserOnResult((res) => {
  users.value = res.data.getAllUserMoreInfoNotAdmin;
});
const alterAllUsers = computed(() =>
  users.value?.map((user: UserMoreInfo) => {
    return {
      ...user,
      aliasName: convertAlias(user.fullName),
    };
  }),
);
const finalAllUser = computed(() => {
  return alterAllUsers.value?.filter(
    (e: UserMoreInfo) => !props.selectedUserIds.includes(e.id),
  );
});

function filterUsersFunction(user: UserMoreInfo) {
  return !props.selectedUserIds?.includes(user.id);
}

onMounted(() => {
  if (!props.options) {
    infoStore.fetchAllUsers();
  }
});
</script>

<script lang='ts'>
export default { name: 'NamedMultiSelectUser' };
</script>

<style lang='scss' scoped></style>
