<template>
  <Dialog
    v-model:visible='visible'
    :header='header || t("document.doc.docInDetail.transferProcessing")'
    modal
    :pt='{
      content: {
        class: {
          "p-0": userSelectNextResponse.length > 1,
          "py-2": userSelectNextResponse.length == 1
        }
      }
    }'
    style='width:70vw'
    @hide='hideDialog'>
    <div
      v-if='userSelectNextResponse[0]?.usersSelectNext.length === 1'
      class='align-items-end flex gap-2 mb-2 pl-3'>
      <AppUser
        avatar-size='3'
        :user-id='userSelectNextResponse[0]?.usersSelectNext[0].userId'/>
      <div>
        <div class='text-sm'>
          <b>{{ userSelectNextResponse[0]?.usersSelectNext[0]?.userName }}</b>
        </div>
        <span>{{ userSelectNextResponse[0]?.usersSelectNext[0]?.positionName }}</span>

      </div>
    </div>
    <!--      Dung v-show vi van phai render ra component-->
    <template v-else>
      <Carousel
        v-if='!canSkipComputed'
        v-show='!canAutoSelect'
        :num-scroll='1'
        :num-visible='1'
        :pt='{
          previousButton: {
            class: "w-3rem h-3rem"
          },
          previousButtonIcon: {
            class: "w-2rem h-2rem"
          },
          nextButton: {
            class: "w-3rem h-3rem"
          },
          nextButtonIcon: {
            class: "w-2rem h-2rem"
          }
        }'
        :show-indicators='userSelectNextResponse.length>1'
        :show-navigators='userSelectNextResponse.length>1'
        :value='userSelectNextResponse'>
        <template #item='{data}'>
          <MiniUserSelectNextNode
            v-model='dataNextAction.dataNodeMap[data?.node.id]'
            v-model:selection-mode='selectionMode'
            class='py-2'
            :hide-receive-to-know='hideReceiveToKnow'
            :should-show-checkbox='shouldShowCheckbox'
            :show-users-from-different-dept='showUsersFromDifferentDept'
            :user-select-next-response='data'>
          </MiniUserSelectNextNode>
        </template>
      </Carousel>
    </template>

    <NoteAndAttachmentNextNode
      v-model='dataNextAction'
      :can-skip='canSkipComputed'
      :class='{"pt-2 px-4" : userSelectNextResponse.length > 1,
               "pt-2": userSelectNextResponse.length == 1}'/>

    <template #footer>
      <div class='flex gap-2'>
        <Button
          class='border-round-sm'
          icon='pi pi-times'
          :label="t('common.back')"
          :loading='isLoading'
          severity='danger'
          @click='visible = false'/>
        <Button
          class='border-round-sm'
          :disabled='disableNextAction'
          icon='pi pi-send'
          :label='t("document.flowAction.process")'
          :loading='isLoading'
          @click='action'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { v4 as uuidv4 } from 'uuid';
import { computed, inject, type PropType, type Ref, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { addAnswer } from '@/apps/document/api/graphql/answer';
import { canSkipChooseUser, getListUserSelectNext } from '@/apps/document/api/graphql/user-next-action';
import type { DocIn, DocInInput } from '@/apps/document/model/doc/doc-in';
import type { DocOut, DocOutInput } from '@/apps/document/model/doc/doc-out';
import type { Answer } from '@/apps/document/model/doc/doc-submit-input';
import type { OrganizationType } from '@/apps/document/model/organization';
import { ProcessType } from '@/apps/document/model/process/incoming';
import type { ProcessInput } from '@/apps/document/model/process/process';
import type {
  SkipChooseUserModel,
  UserSelectNext,
  UserSelectNextActionModel,
  UserSelectNextResponse
} from '@/apps/document/model/userNextAction';
import { ProcessNameType } from '@/apps/document/model/userNextAction';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import MiniUserSelectNextNode from '@/apps/document/views/doc/component/user-select-next/MiniUserSelectNextNode.vue';
import NoteAndAttachmentNextNode
  from '@/apps/document/views/doc/component/user-select-next/NoteAndAttachmentNextNode.vue';
import {
  type DataNextAction,
  type SelectionMode
} from '@/apps/document/views/doc/component/user-select-next/process-data';
import AppUser from '@/common/components/app/AppUser.vue';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  flowId: {
    type: String,
    default: undefined,
  },
  flowInstanceId: {
    type: String,
    default: undefined,
  },
  result: {
    type: String,
    required: true,
  },
  nodeId: {
    type: String,
    required: true,
  },
  isStartNode: {
    type: Boolean,
    default: false,
  },
  orgType: {
    type: String as PropType<OrganizationType>,
    default: undefined
  },
  header: {
    type: String,
    default: undefined
  },
  shouldShowCheckbox: {
    type: Function as PropType<(node: TreeNode) => boolean>,
    default: () => true, // Example default function accepting a parameter
  },
  showUsersFromDifferentDept: {
    type: Boolean,
    default: true
  },
  hideReceiveToKnow: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  processNameType: {
    type: String as PropType<ProcessNameType>,
    default: ProcessNameType.OUTGOING
  }
});

const emits = defineEmits<{
  (e: 'action', data: DataNextAction, callback: () => void): void
}>();

const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const userSelectNextResponse = ref<UserSelectNextResponse[]>([]);
const selectionMode = ref<SelectionMode>('tree');

const doc = inject('doc', {} as Ref<DocOutInput | DocOut | DocInInput | DocIn>);

const model = computed<UserSelectNextActionModel>(() => ({
  flowId: props.flowId,
  flowInstanceId: props.flowInstanceId,
  isStartNode: props.isStartNode,
  nodeId: props.nodeId,
  orgType: props.orgType,
  result: props.result,
  type: props.processNameType,
}));
const {
  onResult: listUserOnResult,
  refetch: listUserRefetch,
  load: listUserLoad
} = getListUserSelectNext(model.value, userDeptRole.value);
listUserOnResult(res => {
  console.log('res');
  userSelectNextResponse.value = res.data?.getListUserSelectNext || [];
});
listUserRefetch({
  model: model.value,
  userDeptRole: userDeptRole.value
});

const {
  refetch: canSkipRefetch,
  load: canSkipLoad,
  result: canSkipResult,
} = canSkipChooseUser();
const canSkipComputed = computed(() => {
  if (props.flowId && !props.flowInstanceId) {
    return false;
  } else {
    return canSkipResult.value?.canSkipChooseUser;
  }
});
const canAutoSelect = computed(() => {
  return userSelectNextResponse.value.every(e => e.usersSelectNext.length == 1);
});

watch(() => canSkipComputed.value, (rs) => {
  if (rs == false) {
    listUserLoad() || listUserRefetch();
  }
}, { immediate: true });

watchEffect(() => {
  if (!props?.flowInstanceId || !props?.nodeId || !doc.value?.id) {
    return;
  }
  let variables: SkipChooseUserModel = {
    docId: doc.value?.id,
    flowInstanceId: props.flowInstanceId,
    nodeId: props.nodeId,
    result: props.result,
    type: props.processNameType
  };
  canSkipLoad(null, { model: variables })
  || canSkipRefetch({ model: variables });
});

const dataNextAction = ref<DataNextAction>({
  attachments: [],
  dataNodeMap: {}
});
const visible = defineModel<boolean>('visible', { default: false });

const afterAction = inject('afterAction', () => void {});

async function action() {
  // const isValid = await v$.value.$validate();
  // if (!isValid) {
  //   return;
  // }
  EventBus.emit('get-question', (data: Answer[]) => {
    const mapData = data?.map((a: Answer) => ({
      id: uuidv4(),
      idAnswer: a.id,
      label: a.label,
      questionId: a.questionId,
      userId: userDeptRole.value.userId,
      userName: userDeptRole.value.userName,
      deptId: userDeptRole.value.deptId,
      deptName: userDeptRole.value.deptName,
      roleId: userDeptRole.value.roleId,
      roleName: userDeptRole.value.roleName,
      text: a.text
    }));

    if (mapData.length > 0) {
      addAnswer().mutate({ answers: mapData });
    }
  });
  emits('action', dataNextAction.value, afterAction);
}

function hideDialog() {
  dataNextAction.value = {
    attachments: [],
    dataNodeMap: {}
  };
}

const disableNextAction = computed<boolean>(() => {
  return !canSkipComputed.value && Object.entries(dataNextAction.value.dataNodeMap).some(
    ([, value]) => {
      return value.processes.length == 0
            || !value.processes.find(e => e.processType == ProcessType.XL_CHINH)
            || value.processes.some(e => !e?.processType);
    }
  );
});

watch(userSelectNextResponse, (value) => {
  if (value.length == 1) {
    const firstNode = value[0];
    if (
      firstNode.usersSelectNext.length == 1
    ) {
      const firstPerson = firstNode.usersSelectNext[0];
      dataNextAction.value.dataNodeMap = {
        [firstNode.node.id]: {
          node: firstNode.node,
          edge: firstNode.edge,
          processes: [
            {
              receiverId: firstPerson.userId,
              receiverName: firstPerson.userName,
              receiverDeptId: firstPerson.deptId,
              receiverDeptName: firstPerson.deptName,
              receiverRoleId: firstPerson.roleId,
              receiverRoleName: firstPerson.roleName,
              processType: ProcessType.XL_CHINH
            } as ProcessInput
          ],
        }
      };
      return;
    }
  }
  value.forEach(data => {
    dataNextAction.value.dataNodeMap = {
      ...dataNextAction.value.dataNodeMap,
      [data.node.id]: {
        node: data.node,
        edge: data.edge,
        processes: [],
      }
    };
  });

}, { once: true });

defineExpose({ userSelectNext: [] as UserSelectNext[] });
</script>

<style scoped>

</style>