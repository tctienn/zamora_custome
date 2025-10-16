<template>
  <Dialog
    v-model:visible='visible'
    header='Choose next action'
    modal
    :pt='{
      content: {
        class: "p-0 relative"
      }
    }'
    :style='`min-width: ${30*(nodes?.length || 1)}rem`'>
    <div class='flex'>
      <ChooseNextUsers
        v-for='node in nodes'
        :key='node.id'
        v-model:comment='results[node.id].comment'
        v-model:select-user-ids='results[node.id].userIds'
        class='flex-grow-1'
        :node='node'/>
    </div>

    <template #footer>
      <ButtonIcon
        icon='close'
        :label='t("common.close")'
        severity='danger'
        @click='visible=false'/>
      <ButtonIcon
        :disabled='!isValid'
        icon='check'
        :label='t("common.confirm")'
        @click='submit'/>
    </template>
  </Dialog>

</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { nextNodes } from '@/apps/work-flow/api/graphql/task';
import { createNextTasks } from '@/apps/work-flow/api/graphql/work';
import { type NodeInputInterface, NodeType } from '@/apps/work-flow/model/flow';
import ChooseNextUsers from '@/apps/work-flow/views/process/detail/task/popup/ChooseNextUsers.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  workId: {
    type: String,
    default: ''
  },
  taskId: {
    type: String,
    default: ''
  },
  currentNodeId: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['reload']);
const { t } = useI18n();
const visible = defineModel('visible', {
  type: Boolean,
  default: false
});
const { user } = useUserStore();
const {
  result,
  load,
  refetch
} = nextNodes(props.workId, props.currentNodeId);
const nodes = computed(() => result.value?.nextNodes as NodeInputInterface[]);
type NodeResult = { [key: string]: { type: NodeType, userIds?: Set<string>, comment?: string } }
const results = ref<NodeResult>({});

watch(() => nodes.value, () => {
  results.value = nodes.value.reduce((acc, node) => {
    acc[node.id] = {
      type: node.type,
      comment: '',
      userIds: new Set()
    };
    return acc;
  }, {} as NodeResult);
});

watch(() => visible.value, (value) => {
  if (value) {
    load() || refetch();
  }
});

const isValid = computed(() => {
  return nodes.value?.every(node => {
    const result = results.value?.[node.id];
    if (node.type === NodeType.BASIC) {
      return result?.userIds?.size;
    }
    return true;
  });
});

async function submit() {
  if (!isValid.value) {
    return;
  }

  const promises = Object.keys(results.value).map((nodeId) => {
    const result = results.value[nodeId];
    return createNextTasks().mutate({
      workId: props.workId,
      currentTaskId: props.taskId,
      assignedIds: result.userIds ? Array.from(result.userIds) : [user.id],
      currentNodeId: props.currentNodeId,
      nextNodeId: nodeId
    });
  });
  try {
    await Promise.all(promises);
    visible.value = false;
    emits('reload');
    toastSuccess();
  } catch (error) {
    toastError({ message: error?.toString() });
  }
}

</script>

<style scoped>

</style>