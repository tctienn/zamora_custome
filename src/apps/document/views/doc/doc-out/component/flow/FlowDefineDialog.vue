<template>
  <Dialog
    v-model:visible='visible'
    :dismissable-mask='false'
    :header='t("Thiết lập quy trình")'
    modal
    :pt='{
      content: {
        class: "py-1 px-4"
      }
    }'
    style='width:80vw'
    @after-hide='afterHideDialog'
    @show='showDialog'>
    <div class='flex gap-4'>
      <div
        class='col-4 overflow-auto surface-card'
        style='height: 70vh'>
        <UserSelectMoreDetail
          v-model='selectedUser'
          display-mode='tree'
          :org-type='userDeptRole.type'
          remove-empty-dep
          selection-mode='multiple'
          :should-show-checkbox='shouldShowCheckbox'
          user-id-only
          :users='allUsers'>
        </UserSelectMoreDetail>
      </div>
      <div
        class='align-items-center flex flex-column justify-content-center'>
        <ButtonIcon
          v-tooltip='"Thêm người vào nốt đang chọn"'
          :disabled='!selectedNode'
          icon='person_add'
          icon-size='1.5'
          text
          @click='addUserToNode(undefined)'/>
        <!--        <ButtonIcon-->
        <!--          v-tooltip='`Tạo nốt và thêm người ${selectedNode?"dưới nốt đang chọn":"nốt áp cuối"}`'-->
        <!--          icon='add_box'-->
        <!--          icon-size='1.5'-->
        <!--          text-->
        <!--          @click='addNodeAndUser'/>-->

      </div>
      <div
        class='flex-grow-1 overflow-auto p-2 surface-card'
        style='height: 70vh'>
        <FlowDefineView
          ref='flowRef'
          v-model:edge-groups='edgeGroupsModified'
          v-model:node-groups='nodeGroupsModified'
          v-model:selected-node='selectedNode'/>
      </div>
    </div>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='handleClose'/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='handleSave'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>

import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onMounted, type Ref, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import {
  defaultEdgeGroups,
  defaultNodeGroups,
  type EdgeGroup,
  type NodeGroup,
  transformNodeEdgeGroupToData
} from '@/apps/document/views/doc/doc-out/component/flow/config';
import FlowDefineView from '@/apps/document/views/doc/doc-out/component/flow/FlowDefineView.vue';
import UserSelectMoreDetail from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetail.vue';
import { distinctByFields } from '@/common/helpers/extension/array.extension';

const visible = defineModel<boolean>('visible', { default: false });
const userMoreInfoStore = useUserMoreInfoStore();
const { allUsers } = storeToRefs(userMoreInfoStore);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();

//Node cua flow
const nodes = defineModel<Node[]>('nodes', { default: [] });
const edges = defineModel<Edge[]>('edges', { default: [] });
//Node dinh nghia o fe
const nodeGroupsOriginal = defineModel<NodeGroup[]>('nodeGroups', { default: [] });
const edgeGroupsOriginal = defineModel<EdgeGroup[]>('edgeGroups', { default: [] });
const nodeGroupsModified = ref<NodeGroup[]>([]);
const edgeGroupsModified = ref<EdgeGroup[]>([]);

function showDialog() {
  if (nodeGroupsOriginal.value.length == 0 && edgeGroupsOriginal.value.length == 0) {
    nodeGroupsModified.value = defaultNodeGroups();
    edgeGroupsModified.value = defaultEdgeGroups();
  } else {
    nodeGroupsModified.value = cloneDeep(nodeGroupsOriginal.value);
    edgeGroupsModified.value = cloneDeep(edgeGroupsOriginal.value);
  }
}

const selectedUser = ref<Array<UserDeptRoleInput & { id: string }>>([]);
const selectedNode = inject<Ref<Node | undefined>>('selectedNode', toRef(undefined));
const selectedGroup = inject<Ref<NodeGroup | undefined>>('selectedGroup', toRef(undefined));
const flowRef = ref<InstanceType<typeof FlowDefineView>>();

function addUserToNode(node: Node | undefined) {
  if (node) {
    const currentData = node.data.options;
    currentData.userDeptRoles = [...currentData.userDeptRoles || [], ...selectedUser.value];
    selectedUser.value = [];
  } else {
    if (selectedNode.value) {
      // selectedNode.value.data.options.userDeptRoles = [...selectedNode.value.data.options.userDeptRoles || [], ...selectedUser.value] as UserDeptRoleInput[];
      selectedNode.value.data.options.userDeptRoles =
          distinctByFields([...selectedNode.value.data.options.userDeptRoles || [], ...selectedUser.value], ['userId', 'roleId', 'deptId']);
      selectedUser.value = [];
    }
  }
}

function addNodeAndUser() {
  const addGroupPromise = new Promise((resolve: (value: NodeGroup | undefined) => void) => {
    let addIdx: number;
    if (selectedGroup.value) {
      addIdx = nodeGroupsOriginal.value.indexOf(selectedGroup.value);
    } else {
      addIdx = nodeGroupsOriginal.value.length - 2;
    }
    const newGroup = flowRef.value?.addGroupAtIdx(addIdx);
    resolve(newGroup);
  });
  addGroupPromise.then((nodeGroup) => {
    addUserToNode(nodeGroup?.nodes[0]);
  });

}

function handleClose() {
  visible.value = false;
}

const confirm = useConfirm();
//Transform to Node and Edge to save config
function handleSave() {
  function save() {
    const {
      nodes: nodesData,
      edges: edgesData
    } = transformNodeEdgeGroupToData(nodeGroupsModified.value, edgeGroupsModified.value);
    nodeGroupsOriginal.value = cloneDeep(nodeGroupsModified.value);
    edgeGroupsOriginal.value = cloneDeep(edgeGroupsModified.value);
    nodes.value = nodesData;
    edges.value = edgesData;
    visible.value = false;
  }

  save();
  // if(true){
  //   confirm.require({
  //     message: 'Không có văn thư ở nốt cuối, nên không thể ban hành.\n Tiếp tục lưu?',
  //     header: t('common.confirm'),
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: ()=> {
  //       save();
  //     },
  //   },
  //   );
  // } else{
  //   save();
  // }

}

function afterHideDialog() {
  selectedNode.value = undefined;
  selectedGroup.value = undefined;
  nodeGroupsModified.value = [];
  edgeGroupsModified.value = [];
}

function shouldShowCheckbox(node: TreeNode): boolean {
  return !(node.data?.__typename === 'Organization');
}

onMounted(() => {
  userMoreInfoStore.fetchAllUsers();
});
</script>