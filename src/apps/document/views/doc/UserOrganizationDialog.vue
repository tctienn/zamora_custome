<template>
  <Dialog
    v-model:visible='visibleDialog'
    v-bind='DEFAULT_DIALOG_CONFIG'
    header='Chọn đơn vị và người đã nhận'
    style='width: 70vw'
    @hide="emits('hide-dialog')">
    <div style='height: 60vh'>
      <div class='flex gap-5 justify-content-between pb-2'>
        <div class='flex gap-5'>
          <label class='flex gap-1'>
            <RadioButton
              v-model='option'
              name='source'
              value='all'>
            </RadioButton>
            <p class='font-semibold'>Tất cả</p>
          </label>

          <label class='flex gap-1'>
            <RadioButton
              v-model='option'
              name='source'
              value='user'>
            </RadioButton>
            <p class='font-semibold'>Người dùng</p>
          </label>

          <label class='flex gap-1'>
            <RadioButton
              v-model='option'
              name='source'
              value='dept'>
            </RadioButton>
            <p class='font-semibold'>Đơn vị/Phòng ban</p>
          </label>

          <label class='flex gap-1'>
            <RadioButton
              v-model='option'
              name='source'
              value='deptOut'>
            </RadioButton>
            <p class='font-semibold'>Đơn vị ngoài</p>
          </label>
        </div>
        <InputText
          v-model='searchKeyword'
          class='w-20rem'
          :placeholder="t('common.search')"/>
      </div>
      <div
        class='content overflow-auto'
        style='height: 55vh'>
        <UserSelectMoreDetailTree
          v-if='option == "all"'
          v-model:user-ids='userIds'
          v-model:value-search='searchKeyword'
          class='overflow-auto'
          :is-hide-search='true'
          :org-type='orgType'
          :remove-empty-dep='removeEmptyDep'
          :selection-mode='"multiple"'
          :should-show-checkbox='shouldShowCheckbox'
          :user-id-only='userIdOnly'
          :users='users'
          @node-select='handleNodeSelect'
          @node-unselect='handleNodeUnselect'>
        </UserSelectMoreDetailTree>

        <DataTable
          v-if='option == "user"'
          v-model:selection='selectedUser'
          class='overflow-auto'
          data-key='id'
          scroll-height='55vh'
          scrollable
          selection-mode='multiple'
          :value='usersMoreDetails'>
          <template #empty>
            <span class='block font-bold text-600 text-center'>Không tìm thấy bản ghi nào với điều kiện tìm kiếm.</span>
          </template>
          <Column
            class='col-1 text-center'
            selection-mode='multiple'/>

          <Column
            class='col-1 text-center'
            header='STT'>
            <template #body='{index}'>
              {{ index + 1 }}
            </template>
          </Column>

          <Column
            field='userId'
            header='Người nhận'
            header-class='align-content-start'>
            <template #body='{data:{ userId, deptName}}'>
              <AppUserDeptRole
                avatar-size='2.5'
                info-visible
                :infos='["positionName", "deptName", "roleName"]'
                name-visible
                :user-dept-role='{roleId: "", userId: userId,deptId: "", deptName : deptName, userName: "", roleName: "", type: userDeptRole.type}'/>
            </template>
          </Column>

          <Column
            class='col-4'
            header='Vai trò/Tên đăng nhập'>
            <template #body='{data: {roleId, username}}'>
              <div>{{ mapRoleName.get(roleId) || "" }}</div>
              <div>{{ username }}</div>
            </template>
          </Column>
        </DataTable>

        <DataTable
          v-if='option == "dept"'
          v-model:selection='selectedOrganizations'
          class='overflow-auto'
          data-key='id'
          scroll-height='55vh'
          scrollable
          selection-mode='multiple'
          :value='organizations'>
          <Column
            class='col-1 text-center'
            selection-mode='multiple'/>

          <Column
            class='col-1 text-center'
            header='STT'>
            <template #body='{index}'>
              {{ index + 1 }}
            </template>
          </Column>

          <Column
            header='Tên phòng ban'>
            <template #body='{data: {deptName}}'>
              {{ deptName }}
            </template>
          </Column>
        </DataTable>

        <DataTable
          v-if='option == "deptOut"'
          v-model:selection='selectedOrganizationsOut'
          class='overflow-auto'
          data-key='id'
          scroll-height='55vh'
          scrollable
          selection-mode='multiple'
          :value='orgOuts'>
          <Column
            class='col-1 text-center'
            selection-mode='multiple'/>

          <Column
            class='col-1 text-center'
            header='STT'>
            <template #body='{index}'>
              {{ index + 1 }}
            </template>
          </Column>

          <Column
            field='userId'
            header='Tên phòng ban'>
            <template #body='{data:{orgOutName}}'>
              {{ orgOutName }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='chooseUserDept'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { get, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { TreeNode } from 'primevue/treenode';
import { computed, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserMoreInfoGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getAllRolesPublic } from '@/apps/admin/api/graphql/role-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { ReceiveObjectType } from '@/apps/document/model/outgoingDocReceivers';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { extractTreeNode } from '@/apps/work-flow/views/components/UserSelectMoreDetail';
import UserSelectMoreDetailTree
  from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetailTree.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userDept: {
    type: Array as PropType<any>,
    default: [] as any[]
  }
});
const emits = defineEmits(['hide-dialog']);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { result } = getAllRolesPublic();
const mapRoleName = computed(() => {
  return new Map<string, string>(result?.value?.rolesPublic?.map((role: {
    code: string,
    name: string
  }) => [role.code, role.name]));
});
const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const orgOutsTemp = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const organizations = ref([]);
const organizationsTemp = ref([]);

const { onResult: getAllOrganizationResult, } = getAllOrganizationPublicGraphql();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationPublic', []).map((res: any) => ({
    deptId: res.id,
    deptName: res.name,
    id: `org_${res.id}`
  }));

  organizationsTemp.value = organizations.value;
});

const userIds = defineModel<Array<UserDeptRoleInput & { id: string }>>({ default: [] });
const orgType = ref<OrganizationType>(OrganizationType.ADMINISTRATIVE);
const { t } = useI18n();
const removeEmptyDep = ref<boolean>();
const option = ref<string>('all');
const visibleDialog = ref(props.visible);
const selectedUser = ref();
const selectedOrganizations = ref();
const selectedOrganizationsOut = ref();
const shouldShowCheckbox = ref();
const userIdOnly = ref<boolean>(false);
const users = ref<UserMoreInfo[]>();
const usersMoreDetails = ref<UserMoreInfo[]>();
const usersMoreDetailsTemp = ref<UserMoreInfo[]>();
const { onResult: getOrgResult } = getOrgOut();
const searchKeyword = ref<string>();

function handleNodeSelect(node: TreeNode) {
  if (userIdOnly.value) {
    if (!node?.key?.startsWith('org_')) {
      userIds.value = [...userIds.value || [], extractTreeNode(node)];
    }
  } else {
    userIds.value = [...userIds.value || [], extractTreeNode(node)];
  }
}

watch(searchKeyword, (value) => {
  if (option.value == 'user') {
    usersMoreDetails.value = usersMoreDetailsTemp.value;
    usersMoreDetails.value = usersMoreDetails.value?.filter((x: any) => x.userName.toLowerCase().trim().includes(value?.toLowerCase().trim())
        || x.userName.toLowerCase().trim().includes(value?.toLowerCase().trim())
        || x.email.toLowerCase().trim().includes(value?.toLowerCase().trim())
        || x.phone.toLowerCase().trim().includes(value?.toLowerCase().trim()));
  } else if (option.value == 'dept') {
    organizations.value = organizationsTemp.value;
    organizations.value = organizations.value.filter((x: any) => x.deptName.toLowerCase().trim().includes(value?.toLowerCase().trim()));
  } else if (option.value == 'deptOut') {
    orgOuts.value = orgOutsTemp.value;
    orgOuts.value = orgOuts.value.filter((x: any) => x.orgOutName.toLowerCase().trim().includes(value?.toLowerCase().trim()));
  }
});

function handleNodeUnselect(node: TreeNode) {
  userIds.value = userIds.value.filter(e => e.id != extractTreeNode(node).id);
}

function chooseUserDept() {
  const mergeList = Array.from(
    new Map([...selectedUser.value || [], ...selectedOrganizations.value || [],
      ...selectedOrganizationsOut.value || [], ...userIds.value || []].map(item => [JSON.stringify(item), item])).values()
  );
  emits('hide-dialog', mergeList);
}

getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut.map((item: OrgOutInterface) => {
    return {
      orgOutName: item.orgOutName,
      id: item.id
    };
  });

  orgOutsTemp.value = orgOuts.value;
});

getAllUserMoreInfoGraphql().onResult((res) => {
  users.value = res.data.getAllUserMoreInfo.map((res: UserMoreInfo) => ({
    ...res,
    roles: res.roles?.filter((role: any) => Object.values(RoleType).includes(role))
  }));
  const usersMoreInfo: any[] = [];

  res.data.getAllUserMoreInfo.forEach((user: any) => {
    user.roles?.forEach((role: string) => {
      if (Object.values(RoleType).includes(role as RoleType)) {
        usersMoreInfo.push({
          userId: user.id,
          userName: user.fullName,
          username: user.username,
          deptId: user.departments.length > 0 ? user.departments[0]?.id : '',
          deptName: user.departments.length > 0 ? user.departments[0]?.name : '',
          roleId: role,
          roleName: mapRoleName.value.get(role) || '',
          id: `${user.id}_${role}`,
          phone: user.phone,
          email: user.email
        });
      }
    });
  });
  usersMoreDetails.value = usersMoreInfo;
  usersMoreDetailsTemp.value = usersMoreInfo;
});

onMounted(() => {
  if (props.userDept) {
    props.userDept.forEach((ud: any) => {
      if (ud.value.objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG) {
        selectedUser.value = [...selectedUser.value || [], ...[{
          userId: ud.value.objectId,
          userName: ud.value.objectName,
          deptId: ud.value.deptId,
          deptName: ud.value.deptName,
          roleId: ud.value.roleId,
          roleName: ud.value.roleName,
          id: `${ud.value.objectId}_${ud.value.roleId}`
        }]];
      } else if (ud.value.objectType == ReceiveObjectType.DON_VI_NOI_BO) {
        selectedOrganizations.value = [...selectedOrganizations.value || [], ...[{
          deptId: ud.value.objectId,
          deptName: ud.value.objectName,
          id: `org_${ud.value.objectId}`
        }]];
      } else if (ud.value.objectType == ReceiveObjectType.DON_VI_NGOAI) {
        selectedOrganizationsOut.value = [...selectedOrganizationsOut.value || [], ...[{
          orgOutName: ud.value.objectName,
          id: ud.value.objectId
        }]];
      }
    });

    userIds.value = [...selectedUser.value || [], ...selectedOrganizations.value || []];
  }
});

watch(option, () => {
  searchKeyword.value = '';
  usersMoreDetails.value = usersMoreDetailsTemp.value;
  organizations.value = organizationsTemp.value;
  orgOuts.value = orgOutsTemp.value;
});

</script>

<style scoped>

</style>

<script lang="ts">
export default { name: 'UserOrganizationDialog' };
</script>