<template>
  <input
    ref='inputId'
    hidden
    :name='props.name'
    type='text'
    :value='user[0]'/>
  <div
    ref='selectUserRef'
    class='flex gap-2'>
    <Dropdown
      v-bind='$attrs'
      append-to='body'
      class='flex-grow-1 select-user'
      filter
      :filter-fields="['aliasName', 'fullName']"
      :model-value='user[0]'
      option-label='fullName'
      option-value='id'
      :options='options || finalAllUser'
      :pt="{
        panel: {
          style: {
            'width': getWidth+'px'
          }
        },
        input: {
          class: 'px-3 py-0 flex align-items-center',
        },
        root: {
          style: {
            'display': props.isHidden ? 'none': 'flex'
          }
        }
      }"
      show-clear
      @update:model-value='user = [$event]'>
      <template #value='slotProps'>
        <AppUser
          v-if='slotProps.value'
          avatar-size='2'
          name-visible
          :user-id='slotProps.value'/>
        <span v-else>
          {{ slotProps.placeholder }}
        </span>
      </template>
      <template #option='slotProps'>
        <AppUser
          avatar-size='2.5'
          info-visible
          :infos="['positionName', 'departments', 'username']"
          name-visible
          :user-id='slotProps.option.id'></AppUser>
      </template>
    </Dropdown>
    <ButtonIcon
      v-if='buttonSelectUser'
      v-tooltip="t('meeting.common.selectUser')"
      class='cursor-pointer'
      icon='group_add'
      icon-size='1.25'
      name='group_add'
      @click='() => (showDialog = true)'>
    </ButtonIcon>
  </div>
  <SelectUserDialog
    v-model='user'
    v-model:visible='showDialog'></SelectUserDialog>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import AppUser from '@/common/components/app/AppUser.vue';
import SelectUserDialog from '@/common/components/dialog/user/SelectUserDialog.vue';
import { convertAlias } from '@/common/helpers/utils';

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  selectedUserIds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  buttonSelectUser: {
    type: Boolean,
    default: true,
  },
  options: {
    type: Array as PropType<any[]>,
    default: undefined,
  },
  isHidden: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
const modelValue = defineModel('modelValue', {
  type: String,
  default: null,
});
const selectUserRef = ref<HTMLDivElement>();
const getWidth = ref();
const user = ref<string[]>([modelValue.value]);
const showDialog = ref(false);
const inputId = ref();
const infoStore = useUserMoreInfoStore();
const { allUsers } = storeToRefs(infoStore);
watch(user, (value) => {
  modelValue.value = value[0];
});
watch(modelValue, (value) => {
  user.value = [value];
});
onMounted(() => {
  infoStore.fetchAllUsers();

  if (selectUserRef.value) {
    const invalidInput = selectUserRef.value.querySelector('.select-user') as HTMLElement;
    if (invalidInput) {
      getWidth.value = invalidInput.offsetWidth;
    }
  }
});
const alterAllUsers = computed(() =>
  allUsers.value.map((user) => {
    return {
      ...user,
      aliasName: convertAlias(user.fullName),
    };
  }),
);
const finalAllUser = computed(() => {
  return alterAllUsers.value.filter(
    (e) => !props.selectedUserIds.includes(e.id),
  );
});
</script>

<script lang='ts'>
export default { name: 'NamedSelectUser' };
</script>

<style scoped></style>
