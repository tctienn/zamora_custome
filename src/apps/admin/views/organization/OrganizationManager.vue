<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.organization.tableTitle') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <Button
          v-if="hasPermission('/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-ORGANIZATION/CREATE')"
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("common.create")'
          @click='showOrganizationFormDialog'/>

        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-import'
          label='Import'
          severity='secondary'
          @click='importExcel'></Button>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-export'
          label='Export'
          severity='secondary'
          @click='exportExcel'></Button>
      </div>
    </template>
  </Toolbar>
  <TreeTable
    v-model:expandedKeys='expandedOrganizations'
    v-model:selectionKeys='selectedOrganization'
    class='custom-tree'
    filter-mode='lenient'
    :filters='filters'
    :loading='loadingData'
    :meta-key-selection='true'
    :row-hover='true'
    scroll-height='flex'
    :scrollable='true'
    selection-mode='single'
    :style='{"height": "calc(100% - 3.5rem)"}'
    :value='organizationTreeComputed'
    @node-select='(n) => nodeSelected=n'>

    <template #empty>
      <span class='font-bold text-600 text-center w-full'>{{
        t('common.emptyRecords', { itemType: toLower(t('admin.organization.objectName')) })
      }}</span>
    </template>

    <Column
      body-class='word-break-break-word max-w-11rem'
      expander
      field='ordinalNumber'
      header='STT'
      header-class='justify-content-start max-w-11rem'>
      <template #body='{node: {data: {ordinalNumber}}}'>
        <p :class='ordinalNumber?.split(".").length > 2 ? "" : "font-bold"'>{{ ordinalNumber }}</p>
      </template>
    </Column>
    <Column
      body-class='word-break-break-word justify-content-center max-w-10rem'
      field='code'
      header='Logo'
      header-class='justify-content-center max-w-10rem'>
      <template #body='{node: {data: {logo, code, ordinalNumber}}}'>
        <div
          v-if='ordinalNumber?.split(".").length < 3'
          class='block-logo'>
          <img
            v-if='generateAvatarUrl(logo)'
            :alt='extractAvatarLabel(code)'
            :src='generateAvatarUrl(logo)'/>
          <div
            v-else
            class='border-300 border-round-sm h-3rem p-avatar relative size text-color w-3rem'
            style='background-color: rgb(149, 165, 166);'>
            <span
              class='p-avatar-text text-2xl text-white'>
              {{ extractAvatarLabel(extractAvatarLabel(code), 1) }}
            </span>
          </div>
        </div>
      </template>
    </Column>
    <Column
      body-class='word-break-break-word'
      field='name'
      :header='t("admin.organization.name")'
      header-class='justify-content-start'>
      <template #body='{node: {data: {name, ordinalNumber, status}}}'>
        <p :class='[ordinalNumber?.split(".").length > 2 ? "" : "font-bold", status === "DEACTIVATE" ? "text-red" : ""]'>{{ name }}</p>
      </template>
    </Column>
    <Column
      body-class='word-break-break-word max-w-12rem justify-content-center'
      field='code'
      :header='t("admin.organization.code")'
      header-class='justify-content-center max-w-12rem'>
      <template #body='{node: {data: {code, ordinalNumber}}}'>
        <p :class='ordinalNumber?.split(".").length > 2 ? "" : "font-bold"'>{{ code }}</p>
      </template>
    </Column>
    <Column
      body-class='word-break-break-word max-w-12rem justify-content-center'
      field='code'
      :header='t("admin.organization.shortName")'
      header-class='justify-content-center max-w-12rem'>
      <template #body='{node: {data: {acronym}}}'>
        <p class='font-bold'>{{ acronym }}</p>
      </template>
    </Column>
    <Column
      body-class='justify-content-center max-w-12rem'
      field='order'
      :header='t("common.type")'
      header-class='justify-content-center max-w-12rem'>
      <template #body='{node: {data: {type}}}'>
        {{ typeName(type) }}
      </template>
    </Column>
    <Column
      body-class='justify-content-center max-w-12rem'
      field='countUser'
      :header='t("admin.organization.userNumber")'
      header-class='max-w-12rem'

      style='text-align:-webkit-center'>
      <template #body='data'>
        <span
          class='number-user'>{{ data.node.data.countUser }}</span>
      </template>
    </Column>
    <Column
      body-class='justify-content-center max-w-10rem text-center'
      :exclude-global-filter='true'
      field='status'
      :header='t("common.status")'
      header-class='max-w-10rem justify-content-center'>
      <template #body='{node: {data: {status}}}'>
        <span
          class='status-badge'
          :class='`status-${toLower(status)}`'>{{ status ? t(`common.statuses.${toLower(status)}`) : '' }}</span>
      </template>
    </Column>

    <Column
      body-class='justify-content-center max-w-10rem text-center'
      :header="t('common.action')"
      header-class='justify-content-center max-w-10rem '>
      <template #body='{node}'>
        <ButtonIcon
          class='text-color'
          icon='more_vert'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu({event : $event, data : node?.data,node:node})'/>
      </template>
    </Column>
  </TreeTable>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
  </Menu>

  <FormAddUserOfOrganization
    v-if='formAddUserVisible'
    group=''
    :item='organization'
    :visible-dialog='formAddUserVisible'
    @hide-dialog='hideOrganizationFormDialog'
    @reload='reload'/>

  <OrganizationForm
    v-if='organizationFormVisible'
    :is-detail='isDetail'
    :item='organization'
    :organizations='organizations'
    :selected-organization='selectedOrganization'
    :visible-dialog='organizationFormVisible'
    @hide-dialog='hideOrganizationFormDialog'
    @reload='reload'/>

  <OrganizationTag
    v-if='visibleOrganizationTag'
    :selected-labels='organization?.tags'
    :visible-dialog='visibleOrganizationTag'
    @hide-dialog='visibleOrganizationTag = false'
    @save-label='saveLabels'/>

  <OrganizationSettingProperties
    v-if='settingPropertiesFormVisible'
    :org-id='organization.id'
    :selected-labels='organization?.tags'
    :visible-dialog='settingPropertiesFormVisible'
    @hide-dialog='settingPropertiesFormVisible = false'
    @save-label='saveLabels'/>
</template>

<script setup lang='ts'>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import type { TreeNode } from 'primevue/treenode';
import type { TreeTableSelectionKeys } from 'primevue/treetable';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getCategoryByGroup } from '@/apps/admin/api/graphql/category-graphql-api';
import {
  deleteOrganizationGraphql,
  getListOrganizationIsDeleteFalseGraphql,
  saveTags
} from '@/apps/admin/api/graphql/organization-graphql-api';
import { exportOrganizationRest } from '@/apps/admin/api/rest/exportApi';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { Organization } from '@/apps/admin/model/organization';
import { usePermissionStore } from '@/apps/admin/store/permission';
import FormAddUserOfOrganization from '@/apps/admin/views/organization/FormAddUserOfOrganization.vue';
import OrganizationForm from '@/apps/admin/views/organization/OrganizationForm.vue';
import OrganizationSettingProperties from '@/apps/admin/views/organization/OrganizationSettingProperties.vue';
import OrganizationTag from '@/apps/admin/views/organization/OrganizationTag.vue';
import { toastError, toastErrorData, toastSuccess, toastWarn } from '@/common/helpers/custom-toast-service';
import { downloadFile } from '@/common/helpers/file-utils';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { setOrdinalNumberTree } from '@/common/helpers/tree-node-utils';
import { expandTreeNodes, listToTree } from '@/common/helpers/utils';
import { extractAvatarLabel } from '@/common/helpers/utils';

const hasPermission = usePermissionStore().hasPermission;
const { t } = useI18n() || {};

const getAllOrganizationLoading = ref(true);
const organizations = ref([]);
const expandedOrganizations = ref({});
const types = ref([
  {
    code: 'DV',
    name: 'Đơn vị'
  }, {
    code: 'PB',
    name: 'Phòng ban'
  }
]);
const organizationTree = ref<TreeNode[]>();
const filters = ref<{ [key: string]: string }>({});
const searchTerm = inject('searchTerm', ref(''));
const visibleOrganizationTag = ref(false);
const formAddUserVisible = ref<boolean>(false);
const isDetail = ref(false);
const typeName = computed(() => (value: string) => {
  return types.value.find((t) => t.code == value)?.name;
});
const loadingData = ref(false);
const organizationTreeComputed = computed<TreeNode[]>(() => {
  return setOrdinalNumberTree(organizationTree.value);
});

const { onResult: getCategoryByGroupOnResult } = getCategoryByGroup('ORGANIZATION_TYPE');

const selectedOrganization = ref<TreeTableSelectionKeys>();
const nodeSelected = ref<TreeNode>();

const {
  onResult: getAllOrganizationResult,
  onError: getAllOrganizationError,
  refetch: getAllOrganizationRefetch,
} = getListOrganizationIsDeleteFalseGraphql();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.getListOrganizationIsDeleteFalse', []);

  function sumCountUser(node: any) {
    let selfCount = node.data.countUser || 0;
    if (!node.children || node.children.length === 0) {
      node.data.countUser = selfCount;
      return selfCount;
    }
    let sum = selfCount;
    for (const child of node.children) {
      sum += sumCountUser(child);
    }
    node.data.countUser = sum;
    return sum;
  }

  organizationTree.value = listToTree(organizations.value.map((organization: Organization) => ({
    key: organization.code,
    data: {
      ...organization,
      countUser: organization?.users?.length ?? 0
    },
    parentId: organization.parentCode,
    children: []
  })), {
    id: 'key',
    parentId: 'parentId',
    children: 'children'
  });

  // Sum countUser for all root nodes
  if (organizationTree.value && Array.isArray(organizationTree.value)) {
    for (const root of organizationTree.value) {
      sumCountUser(root);
    }
  }

  expandedOrganizations.value = expandTreeNodes(organizationTree.value, 'key');
  getAllOrganizationLoading.value = false;
});

getAllOrganizationError((error) => {
  getAllOrganizationLoading.value = false;
  toastErrorData({
    prefix: 'organization.errors',
    error
  });
});

function reload() {
  assign(organization.value, new Organization());
  getAllOrganizationRefetch();
}

function saveLabels(data: string[]) {
  saveTags().mutate({
    organizationId: organization.value.id,
    tags: data
  }).then(() => {
    getAllOrganizationRefetch();
    toastSuccess({ message: 'Đã gắn nhãn thành công' });
  });
}

function showOrganizationFormDialog() {
  isDetail.value = false;
  organizationFormVisible.value = true;
}

function editOrganization() {
  isDetail.value = false;
  organizationFormVisible.value = true;
}

function settingProperties() {
  isDetail.value = false;
  settingPropertiesFormVisible.value = true;
}

function addUser() {
  formAddUserVisible.value = true;
}

function hideOrganizationFormDialog() {
  formAddUserVisible.value = false;
  organizationFormVisible.value = false;
  assign(organization.value, new Organization());
}

const menuAction = ref();
const menuActionCondition = [
  {
    label: t('common.detail'),
    icon: 'pi pi-info-circle',
    show: true,
    command: () => {
      isDetail.value = true;
      organizationFormVisible.value = true;
    }
  },
  {
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    show: true,
    command: () => {
      editOrganization();
    }
  },
  {
    label: t('common.settingProperties'),
    icon: 'pi pi-cog',
    show: true,
    command: () => {
      settingProperties();
    }
  },
  {
    label: t('common.addUserIntoOrg'),
    icon: 'pi pi-user-plus',
    show: true,
    command: () => {
      addUser();
    }
  },
  {
    label: 'Gán nhãn',
    icon: 'pi pi-tag',
    show: true,
    command: () => {
      visibleOrganizationTag.value = true;
    }
  },
  {
    label: t('common.delete'),
    icon: 'pi pi-trash',
    show: true,
    command: () => {
      deleteOrganization();
    }
  }
];

const menuActions = menuActionCondition.filter(obj => obj.show);

function toggleActionMenu({
  event,
  data,
  node
}: { event: Event, data: OrganizationInterface, node: TreeNode }) {
  menuAction.value.toggle(event);
  organization.value = cloneDeep(data);
  selectedOrganization.value = { [data.code || '']: true };
  nodeSelected.value = node;
}

const organization = ref<OrganizationInterface>(new Organization());
const organizationFormVisible = ref(false);
const settingPropertiesFormVisible = ref(false);

const {
  mutate: deleteOrganizationMutate,
  onDone: deleteOrganizationDone,
  onError: deleteOrganizationError
} = deleteOrganizationGraphql();

const confirm = useConfirm();

function deleteOrganization() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.organization.objectName'),
      itemName: organization.value.name
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteOrganizationMutate({ id: organization.value.id });
    }
  });
}

deleteOrganizationDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('organization.objectName'),
      itemName: organization.value.name
    })
  });
  confirm.close();
  reload();
});

deleteOrganizationError((error) => {
  toastErrorData({ error });
});

const exportExcel = () => {
  loadingData.value = true;
  exportOrganizationRest().then(file => {
    if (file) {
      downloadFile(file, 'PhongBan.xlsx');
    }
    toastSuccess({ message: t('common.exportAndDownloadSuccess') });
  }).catch(reason => {
    toastError({ message: t('common.result.message.somethingWrong') });
  }).finally(() => {
    setTimeout(() => {
      loadingData.value = false;
    }, 1000);
  });
};

const importExcel = () => {
  toastWarn({ message: 'Chức năng sắp ra mắt' });
};

watch(searchTerm, (newValue) => {
  filters.value['global'] = newValue;
});
</script>

<script lang='ts'>
export default { name: 'OrganizationManager' };
</script>

<style scoped>
:deep(.img-contain .p-avatar img) {
  object-fit: cover;
  object-position: center center;
}

:deep(.number-user) {
  background-color: var(--primary-500);
}

:deep(.p-treetable-wrapper) {
  background-color: var(--surface-0);
}

.block-logo {
  height: 3rem;
  width: auto;
}

.block-logo img {
  height: 100%;
  width: auto;
  border-radius: 0.25rem;
  object-fit: cover;
}
</style>
