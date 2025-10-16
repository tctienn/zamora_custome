<template>
  <Dialog
    v-if='organization'
    v-model:visible='visible'
    :header='t("admin.userGroup.listUser")'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <DataTable
      data-key='id'
      lazy
      :loading='loadingUser'
      table-style='min-width: 40rem'
      :total-records='totalRecords'
      :value='users'>

      <template #header>
        <div class='align-items-center flex flex-wrap justify-content-end'>
          <span class='block p-input-icon-left'>
            <i class='pi pi-search'/>
            <InputText
              v-model='searchKeyword'
              class='py-2'
              :placeholder='t("common.search")'
              @update:model-value='searchDatatable'/>
          </span>
        </div>
      </template>
      <Column
        :header='t("common.fullName")'>
        <template #body='{data: {id}}'>
          <div class='align-items-center flex flex-row'>
            <AppUser
              name-visible
              :user-id='id'/>
          </div>
        </template>
      </Column>

      <Column
        field='username'
        :header='t("common.userName")'></Column>
      <Column
        field='email'
        :header='t("admin.userGroup.email")'></Column>

      <Column
        field='employeeId'
        :header='t("admin.user.userCode")'/>

      <Column
        field='positionName'
        :header='t("admin.position.objectName")'/>

    </DataTable>
  </Dialog>
</template>

<script lang='ts' setup>
import { toLower } from 'lodash';
import Column from 'primevue/column';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getUsersInOrganization } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { Organization } from '@/apps/admin/model/organization';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

interface UserGroupFormProps {
  visibleDialog: boolean,
  item: Organization,
  idGroup: string
}

const props = withDefaults(defineProps<UserGroupFormProps>(), {
  visibleDialog: false,
  item: undefined,
  idGroup: ''
});

const emits = defineEmits(['hide-dialog', 'reload']);

const organization = ref<Organization>(props.item);
const visible = ref(props.visibleDialog);
const { t } = useI18n() || {};
const users = ref(organization.value.users);
const totalRecords = ref(0);
const loadingUser = ref();
const searchKeyword = ref('');

getUsersInOrganization(props.item.id).onResult((res) => {
  users.value = res.data.getUsersInOrganization.usersMoreInfo;
});

function searchDatatable() {
  users.value = organization.value.users;
  users.value = users.value.filter(function (user) {
    return toLower(user.fullName).includes(toLower(searchKeyword.value))
        || toLower(user.email).includes(toLower(searchKeyword.value))
        || toLower(user.username).includes(toLower(searchKeyword.value));
  });
}

</script>

<script lang='ts'>
export default { name: 'ShowListUserOfOrganization' };
</script>

<style scoped>
</style>
