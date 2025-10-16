<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("admin.userGroup.detail")'
    @hide='emits("hide-dialog")'>

    <TabView v-model:activeIndex='activePanel'>
      <TabPanel header='Chi tiết nhóm'>
        <div>
          <div class='p-fluid'>
            <div class='formgrid grid'>
              <div class='col field'>
                <label
                  class='font-bold'
                  for='userGroupName'>{{ t('admin.userGroup.groupName') }}</label>:
                {{ group.name }}
              </div>
              <div class='col field'>
                <label
                  class='font-bold'
                  for='userGroupName'>{{ t('admin.userGroup.description') }}</label>:
                {{ group.description }}
              </div>
            </div>
            <div class='formgrid grid'>
              <div class='col field'>
                <label
                  class='font-bold'
                  for='userGroupName'>{{ t('admin.userGroup.createBy') }}</label>: {{
                    group.createBy
                  }}
              </div>
              <div class='col field'>
                <label
                  class='font-bold'
                  for='userGroupName'>{{ t('admin.userGroup.totalUser') }}</label>:
                {{ group.users.length }}
              </div>
            </div>

          </div>
        </div>
      </TabPanel>

      <TabPanel header='Danh sách thành viên'>
        <div style='text-align: right'>
          <ButtonIcon
            v-if='isAdmin'
            icon='add_circle'
            icon-size='1.5'
            rounded
            text
            @click='addUser'/>
        </div>
        <DataTable
          data-key='id'
          lazy
          :loading='loadingUser'
          table-style='min-width: 40rem'
          :total-records='totalRecords'
          :value='listUser'>
          <Column
            field='fullName'
            :header='t("common.fullName")'></Column>
          <Column
            field='email'
            :header='t("admin.userGroup.email")'></Column>
          <Column
            field='level'
            :header='t("admin.userGroup.level")'>
            <template #body='{data}'>
              <Dropdown
                :disabled='!isAdmin'
                :model-value='data["level"]'
                option-label='label'
                option-value='value'
                :options='levels'
                :placeholder='t("common.select")'
                @change='changeLevel($event,data)'/>
            </template>
          </Column>
          <Column
            v-if='isAdmin'
            :header="t('common.action')">
            <template #body='{data}'>
              <Button
                icon='pi pi-times'
                severity='danger'
                @click='deleteUser(data)'/>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>

    <template #footer>
      <div class='flex flex-row justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          text
          @click='emits("hide-dialog")'/>
        <Button
          v-if='isAdmin && activePanel === 1'
          icon='pi pi-check'
          :label='t("common.save")'
          @click='saveUsers'/>
      </div>
    </template>
  </Dialog>

  <FormAddUser
    v-if='userGroupAddFormVisible'
    :group='group'
    :visible-dialog='userGroupAddFormVisible'
    @group-emit='groupEmit'
    @hide-dialog='hideLogUserFormDialog'/>

  <FormDecentralization
    v-if='formDecentralizationVisible'
    :group='group'
    :visible-dialog='formDecentralizationVisible'
    @hide-dialog='hideLogUserFormDialog'/>
</template>

<script setup lang='ts'>
import { cloneDeep, find, pick, toLower } from 'lodash';
import Dropdown, { type DropdownChangeEvent } from 'primevue/dropdown';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { addUserToUserGroup } from '@/apps/admin/api/graphql/user-group-graphql-api';
import { Level, UserGroup, type UsersInterface } from '@/apps/admin/model/userGroup';
import { getGroup, getGroupById } from '@/apps/ecm/api/graphql/group-graphql-api';
import FormAddUser from '@/apps/ecm/views/group/FormAddUser.vue';
import FormDecentralization from '@/apps/ecm/views/group/FormDecentralization.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { mapEnum } from '@/common/helpers/utils';
import type { Group, UserLevel } from '@/common/model/group';
import { useUserStore } from '@/common/store/user';

interface FormProps {
  visibleDialog: boolean,
  item: Group
}

const props = withDefaults(defineProps<FormProps>(), {
  visibleDialog: false,
  item: undefined
});
const emits = defineEmits(['hide-dialog', 'reload']);
const group = ref<Group>(props.item);
const formDecentralizationVisible = ref(false);
const listUser = ref<UserLevel[]>(group.value.users);
const { user } = useUserStore();
const activePanel = ref(0);

const { t } = useI18n() || {};
const {
  onResult: getGroupOnResult,
  refetch: getGroupRefetch
} = getGroup(props.item.id);
getGroupOnResult((res) => {
  group.value = res.data.getGroup;
});

const isAdmin = computed(() => find(group.value.users, {
  id: user.id,
  level: Level[Level.MANAGE]
}));

const levels = mapEnum(Level).map((type) => ({
  label: t(`admin.userGroup.types.${toLower(type)}`),
  value: type
}));

const loadingUser = ref();
const totalRecords = ref(0);

const visible = ref(props.visibleDialog);
const userGroupAddFormVisible = ref(false);
const {
  onResult: getGroupByIdResult,
  refetch: getGroupByIdRefetch
} = getGroupById(props.item.id);

getGroupByIdResult((res) => {
  listUser.value = cloneDeep(res.data.getGroupById.users);
});

function addUser() {
  getGroupRefetch({ id: props.item.id });
  userGroupAddFormVisible.value = true;
}

const {
  mutate: addUserToUserMutate,
  onDone: addUserToUserDone,
} = addUserToUserGroup();

function saveUsers() {
  addUserToUserMutate({
    id: group.value.id,
    userList: listUser.value.map(user => pick(user, 'id', 'level', 'fullName', 'email'))
  });
}

addUserToUserDone(() => {
  toastSuccess({ message: t('admin.userGroup.addUser') });
  emits('reload');
  emits('hide-dialog');
});

function changeLevel(event: DropdownChangeEvent, user: UsersInterface) {
  const listUserClone = cloneDeep(listUser.value);
  const userExist = find(listUserClone, ['id', user.id]);
  if (userExist) {
    userExist.level = event.value;
    listUser.value = listUserClone;
  }

}

function deleteUser(data: UsersInterface) {
  const listUserColone = cloneDeep(listUser.value);
  listUserColone.splice(listUser.value.indexOf(data), 1);
  listUser.value = listUserColone;
}

function hideLogUserFormDialog() {
  userGroupAddFormVisible.value = false;
  getGroupByIdRefetch();
}

function groupEmit(paramGroup: UserGroup) {
  listUser.value = paramGroup.users;
}

</script>

<script lang='ts'>
export default { name: 'FormGroupDetail' };
</script>