<template>
  <Dialog
    v-model:visible='visible'
    :header='header'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :pt="{
      content: 'p-0',
    }"
    :style="{ width: '35vw' }"
    @hide="emits('hide-dialog')">
    <div>
      <Tree
        v-model:selectionKeys='list'
        class='w-full'
        :empty-message="t('common.selectEmpty')"
        input-id='organizationParent'
        selection-mode='multiple'
        :value='organizations'>
        <template
          #value='{ value }: { value: TreeNode[]; placeholder: String }'>
          <div class='flex justify-content-between'>
            <span>{{
              value.length > 0
                ? value[0].label
                : t('admin.user.chooseOrganization')
            }}</span>
          </div>
        </template>
      </Tree>
      <div class='flex justify-content-center p-2 w-full'>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          @click='handleSave'/>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { saveOrgConfig } from '@/apps/document/api/graphql/org-config';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import { OrganizationType } from '@/apps/document/model/organization';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  isChooseParentOrg: {
    type: Boolean,
    default: true,
  },
  orgDialogVisible: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: null,
  },
  org: {
    type: String,
    default: null,
  },
  listOrgChild: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});
const emits = defineEmits(['hide-dialog', 'reload']);
const { t } = useI18n();
const organizations = ref();
const visible = ref(props.orgDialogVisible);
const list = ref();
const header = ref('');

const {
  mutate: saveOrgConfigMutate,
  onDone: saveOrgConfigDone
} =
    saveOrgConfig();

if (!props.isChooseParentOrg) {
  list.value = props.listOrgChild.reduce(
    (obj, key) => {
      obj[key] = true;
      return obj;
    },
      {} as Record<string, boolean>,
  );
}

props.isChooseParentOrg
  ? header.value = t('document.generalSetting.chooseOrgParent')
  : header.value = t('document.generalSetting.chooseOrg');

function handleSave() {
  if (Object.keys(list.value).join(',') === '') {
    return;
  }
  if (props.isChooseParentOrg) {
    saveOrgConfigMutate({
      orgParentIds: Object.keys(list.value).join(','),
      orgChildIds: '',
      type: props.type,
    });
  } else {
    saveOrgConfigMutate({
      orgParentIds: props.org,
      orgChildIds: Object.keys(list.value).join(','),
      type: props.type,
    });
  }
}

saveOrgConfigDone(() => {
  emits('hide-dialog');
});

onMounted(() => {
  fetchOrganizations(props.type);
});
const fetchOrganizations = (type: string) => {
  if (type === OrganizationType.ADMINISTRATIVE) {
    const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
    getAllOrganizationResult((response) => {
      const data = get(response, 'data.allOrganizationPublic', []);
      organizations.value = listToTree(
        data.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.code,
          parentId: organization.parentCode,
          children: [],
        })),
        {
          id: 'data',
          parentId: 'parentId',
          children: 'children',
        },
      );
      if (!props.isChooseParentOrg) {
        organizations.value = organizations.value.filter(
          (item: any) => item.key === props.org,
        )[0]?.children;
      }
    });
  } else {
    const { onResult: getOrganizationResult } = getByTypeGraphql(type);
    getOrganizationResult((res) => {
      const data = res.data.getByType;
      organizations.value = listToTree(
        data.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.id,
          parentId: organization.parentId,
          children: [],
        })),
        {
          id: 'key',
          parentId: 'parentId',
          children: 'children',
        },
      );
      if (!props.isChooseParentOrg) {
        organizations.value = organizations.value.filter(
          (item: any) => item.key === props.org,
        )[0]?.children;
      }
    });
  }
};
</script>

<style scoped>
:deep(.p-orderlist-controls) {
  display: none;
}
</style>
