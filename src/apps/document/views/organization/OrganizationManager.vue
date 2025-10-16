<template>
  <div class='h-full w-full'>
    <div class='flex justify-content-between'>
      <div class='align-content-center align-items-center'>
        <h4>{{ t('document.partyPosition.partyUnionStructure') }}</h4>
      </div>
      <div class='flex gap-2 pb-2'>
        <ButtonIcon
          class='btn-create'
          icon='add'
          :label="t('document.partyPosition.addOrganization')"
          @click='createOrganization(null)'/>

        <ButtonIcon
          class='btn-create'
          :disabled='!organizationId'
          icon='person_add'
          :label="t('document.partyPosition.chooseMember')"
          @click='showFormAddUser()'/>

        <!--        <ButtonIcon-->
        <!--          v-tooltip.top='t("admin.user.refresh")'-->
        <!--          icon='restart_alt'-->
        <!--          outlined/>-->
      </div>
    </div>
    <Splitter
      class='mb-5'
      style='border: none; height: 86vh'>
      <SplitterPanel
        class='flex justify-content-center p-0'
        :size='25'>
        <TabView
          class='h-30 p-0 w-full'
          :lazy='true'
          @tab-change='tabKey($event)'>
          <TabPanel :header="t('document.partyPosition.structureParty')">
            <p class='p-0'>
              <Tree
                v-model:selectionKeys='selectedOrganization'
                class='p-0'
                :expanded-keys='expandKey'
                :meta-key-selection='true'
                scroll-height='75vh'
                selection-mode='single'
                style='border: none'
                :value='nodes'
                @node-select='onNodeSelect'>
                <template #default='slotProp'>
                  <div
                    class='align-items-center edge flex justify-content-between'>
                    {{ slotProp.node.label }}
                    <div class='flex'>
                      <ButtonIcon
                        v-tooltip.top="t('common.create')"
                        class='toggle'
                        icon='add_box'
                        icon-size='1.7'
                        rounded
                        text
                        @click='createOrganization(slotProp.node.data.id)'/>
                      <ButtonIcon
                        v-tooltip.top="t('common.edit')"
                        class='toggle'
                        icon='edit'
                        icon-size='1.7'
                        rounded
                        text
                        @click='editOrganization(slotProp.node.data)'/>
                      <ButtonIcon
                        v-tooltip.top='"Gán nhãn"'
                        class='toggle'
                        icon='sell'
                        icon-size='1.7'
                        rounded
                        text
                        @click='assignTags(slotProp.node)'/>
                      <ButtonIcon
                        v-tooltip.top="t('common.delete')"
                        class='toggle'
                        icon='delete'
                        icon-size='1.7'
                        rounded
                        text
                        @click='deleteOrganization(slotProp.node)'/>
                    </div>
                  </div>
                </template>
              </Tree>
            </p>
          </TabPanel>

          <TabPanel :header="t('document.partyPosition.structureUnion')">
            <p class='p-0'>
              <Tree
                v-model:selectionKeys='selectedOrganization'
                class='p-0'
                :meta-key-selection='true'
                scroll-height='75vh'
                selection-mode='single'
                style='border: none'
                :value='nodes'
                @node-select='onNodeSelect'>
                <template #default='slotProp'>
                  <div
                    class='align-items-center edge flex justify-content-between'>
                    {{ slotProp.node.label }}
                    <div class='flex'>
                      <ButtonIcon
                        v-tooltip.top="t('common.edit')"
                        class='toggle'
                        icon='edit'
                        icon-size='1.7'
                        rounded
                        text
                        @click='editOrganization(slotProp.node.data)'/>
                      <ButtonIcon
                        v-tooltip.top="t('common.delete')"
                        class='toggle'
                        icon='delete'
                        icon-size='1.7'
                        rounded
                        text
                        @click='deleteOrganization(slotProp.node)'/>
                    </div>
                  </div>
                </template>
              </Tree>
            </p>
          </TabPanel>
        </TabView>
      </SplitterPanel>
      <SplitterPanel
        class='flex justify-content-center'
        :size='75'>
        <DataTable
          v-model:selection='selectedRow'
          class='users w-full'
          data-key='id'
          :total-records='totalRecords'
          :value='listUser'>
          <template #empty>
            <span class='block font-bold text-600 text-center'>{{
              t('common.emptyRecords', {
                itemType: toLower(t('admin.user.objectName')),
              })
            }}</span>
          </template>
          <Column
            body-class='text-center'
            :header="t('document.partyPosition.stt')">
            <template #body='{ index }'>
              {{ index + 1 }}
            </template>
          </Column>
          <Column
            body-class='text-center'
            :header="t('document.partyPosition.userName')">
            <template #body='{ data: { userId } }'>
              <AppUser
                avatar-size='3'
                name-visible
                :user-id='userId'/>
            </template>
          </Column>
          <Column
            body-class='text-center'
            :header="t('document.partyPosition.position')">
            <template #body='{ data: { positionName } }'>
              {{ positionName }}
            </template>
          </Column>
          <Column
            body-class='text-center'
            :header="t('document.partyPosition.role')">
            <template #body='{ data: { role } }'>
              {{ getRoleName(role) }}
            </template>
          </Column>
          <Column
            body-class='text-center'
            :header="t('document.partyPosition.mobileEmail')">
            <template #body='{ data: { phone, email } }'>
              <div>{{ phone }}</div>
              <div>{{ email }}</div>
            </template>
          </Column>
          <Column
            body-class='text-center'
            :header="t('document.partyPosition.birthCreated')">
            <template #body='{ data: { birthDay, createdDateOfUser } }'>
              <div>
                {{ birthDay ? moment(birthDay).format('DD/MM/YYYY') : '' }}
              </div>
              <div>
                {{
                  createdDateOfUser
                    ? moment(createdDateOfUser).format('HH:mm DD/MM/YYYY')
                    : ''
                }}
              </div>
            </template>
          </Column>
          <Column
            class='text-center'
            :header="t('common.action')">
            <template #body='{ data }'>
              <ButtonIcon
                v-tooltip.top="t('common.action')"
                class='text-color'
                icon='more_horiz'
                icon-size='1.7'
                rounded
                text
                @click='toggleActionMenu({ event: $event, data: data })'/>
            </template>
          </Column>
        </DataTable>
      </SplitterPanel>
    </Splitter>
  </div>
  <OrganizationForm
    v-if='visibleDialog'
    :organization-prop='selectOrganization'
    :organization-type='organizationType'
    :visible-dialog='visibleDialog'
    @close-dialog='hideDialog'/>
  <FormAddUserToOrganization
    v-if='visibleDialogUser'
    :organization-id='organizationId'
    :organization-name='organizationName'
    :selected-users='listUser'
    :visible-dialog='visibleDialogUser'
    @hide-dialog='hideDialog'/>
  <SelectSupportDialog
    v-if='supportFormVisible'
    :id='selectedUser.userId'
    :dept-id='organizationId'
    :option-support="listUser.filter((item: any) => item.role === 'TRO_LY')"
    :org-type='organizationType'
    :user='selectedUser'
    :visible-dialog='supportFormVisible'
    @hide-dialog='hideSupportFormDialog'
    @reload='hideDialog'/>

  <OrganizationTag
    v-if='visibleOrganizationTag'
    :selected-labels='organization.tags'
    :visible-dialog='visibleOrganizationTag'
    @hide-dialog='visibleOrganizationTag = false'
    @save-label='saveLabels'/>
  <Menu
    ref='menuAction'
    :model='menuActionsFilter'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { filter, toLower } from 'lodash';
import moment from 'moment';
import type { TreeExpandedKeys, TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { useConfirm } from 'primevue/useconfirm';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getRoles } from '@/apps/admin/api/graphql/role-graphql-api';
import OrganizationTag from '@/apps/admin/views/organization/OrganizationTag.vue';
import {
  deleteOrganizationGraphql,
  getByTypeGraphql,
  saveTagsOrganization,
} from '@/apps/document/api/graphql/organization';
import { findByOrganizationIdGraphql } from '@/apps/document/api/graphql/userOrganization';
import { type OrganizationInterface, OrganizationType, } from '@/apps/document/model/organization';
import { RoleType } from '@/apps/document/model/permission';
import FormAddUserToOrganization from '@/apps/document/views/organization/FormAddUserToOrganization.vue';
import OrganizationForm from '@/apps/document/views/organization/OrganizationForm.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import SelectSupportDialog from '@/common/components/dialog/SelectSupportDialog.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { sortTree } from '@/common/helpers/tree-node-utils';
import { listToTree } from '@/common/helpers/utils';

const confirm = useConfirm();
const {
  onResult: getOrganizationResult,
  refetch: getOrganizationRefetch
} =
  getByTypeGraphql(OrganizationType.PARTY);
getOrganizationResult((res) => {
  organizations.value = res.data.getByType;
});
const { t } = useI18n();
const groupCode = ref();
const supportFormVisible = ref(false);
const totalRecords = ref(0);
const organizations = ref<OrganizationInterface[]>(
  [] as OrganizationInterface[],
);
const organization = ref({} as OrganizationInterface);
const visibleDialog = ref(false);
const selectOrganization = ref({} as OrganizationInterface);
const visibleDialogUser = ref(false);
const selectedOrganization = ref<TreeSelectionKeys>({});
const organizationId = ref();
const visibleOrganizationTag = ref(false);
const organizationName = ref<string | undefined>('');
const listUser = ref([]);
const organizationType = ref<OrganizationType>(OrganizationType.PARTY);
const roles = ref([
  {
    label: String,
    value: String,
  },
]);
const expandKey = ref<TreeExpandedKeys>();
const { onResult: getRoleResult } = getRoles({
  keyword: '',
  pageable: {
    page: 0,
    size: 999999,
  },
});

getRoleResult((res) => {
  roles.value = res.data.getRoles.edges.map((r: any) => ({
    label: r.node.name,
    value: r.node.code,
  }));
});

const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} =
  deleteOrganizationGraphql();
const {
  onResult: getUserOnResult,
  refetch: getUserRefetch
} =
  findByOrganizationIdGraphql('');

getUserOnResult((res) => {
  listUser.value = res.data.findByOrganizationId;
});

function initExpandKeys(treeNodes: TreeNode[]) {
  const rs: Record<string, true> = {};
  treeNodes.forEach((node) => {
    rs[node.key || ''] = true;
  });
  return rs;
}

const nodes = computed<TreeNode[]>(() => {
  return sortTree(
    listToTree(
      organizations.value.map((item: OrganizationInterface) => ({
        key: item.id,
        label: item.name,
        parentId: item.parentId,
        data: { ...item },
        children: [],
      })),
      {
        id: 'key',
        parentId: 'parentId',
        children: 'children',
      },
    ),
    'order',
  );
});

watch(nodes, () => {
  expandKey.value = initExpandKeys(nodes.value);
});

function onNodeSelect(node: TreeNode) {
  organizationName.value = node.label;
  organizationId.value = node.key;
  getUserRefetch({ organizationId: node.key });
}

function hideSupportFormDialog() {
  supportFormVisible.value = false;
}

const selectedUser = ref();
const selectedRow = ref();
let menuActionsFilter = ref();

function toggleActionMenu({
  event,
  data
}: { event: Event; data: any }) {
  menuActionsFilter.value = menuActions;
  if (data.role !== RoleType.LANH_DAO) {
    menuActionsFilter.value = filter(menuActions, (action) => {
      return action.key !== 'support';
    });
  }
  selectedRow.value = data;
  selectedUser.value = data;
  menuAction.value.toggle(event);
}

const menuAction = ref();

const menuActions = [
  {
    key: 'support',
    label: t('common.support'),
    icon: 'group_add',
    command: () => {
      supportFormVisible.value = true;
    },
  },
];

function tabKey(key: any) {
  listUser.value = [];
  organizationId.value = null;
  selectedOrganization.value = {};
  organizationType.value =
    key.index == 0 ? OrganizationType.PARTY : OrganizationType.UNION;
  getOrganizationRefetch({ organizationType: organizationType.value });
}

function saveLabels(data: string[]) {
  saveTagsOrganization().mutate({
    organizationId: organization.value.id,
    tags: data
  }).then((res) => {
    getOrganizationRefetch();
    toastSuccess({ message: 'Đã gán nhãn thành công.' });
  });
}

function assignTags(data: any) {
  organization.value = data.data;
  visibleOrganizationTag.value = true;
}

function showFormAddUser() {
  visibleDialogUser.value = true;
}

function getRoleName(code: string) {
  return roles.value.find((x: any) => x.value == code)?.label;
}

function editOrganization(data: OrganizationInterface) {
  visibleDialog.value = true;
  selectOrganization.value = data;
}

function deleteOrganization(organization: TreeNode) {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('document.partyPosition.organization'),
      itemName: organization.label,
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteMutate({ id: organization.key });
    },
  });
}

function hideDialog() {
  selectOrganization.value = {} as OrganizationInterface;
  visibleDialog.value = false;
  visibleDialogUser.value = false;
  getOrganizationRefetch();
  getUserRefetch();
}

function createOrganization(parentId: string | null) {
  if (parentId) {
    selectOrganization.value = {} as OrganizationInterface;
    selectOrganization.value = {
      ...selectOrganization.value,
      parentId: parentId,
    };
  } else {
    selectOrganization.value = {} as OrganizationInterface;
  }
  visibleDialog.value = true;
}

deleteOnDone(() => {
  toastSuccess({ message: t('document.partyPosition.message.deleteSuccess') });
  getOrganizationRefetch();
  getUserRefetch();
});
</script>

<script lang='ts'>
export default { name: 'OrganizationManager' };
</script>

<style scoped>
:deep(.p-treenode-label) {
  width: 100%;
}

.edge {
  .toggle {
    visibility: hidden;
  }

  &:hover {
    .toggle {
      visibility: visible;
    }
  }
}

:deep(.p-tree-selectable:hover) {
  overflow: auto;
}
</style>
