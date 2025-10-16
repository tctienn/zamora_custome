<template>
  <ChooseNextUsers
    v-for='node in nodes'
    :key='node.id'
    :node='node'
    :select-user-ids='selectUserIdsRecord[node.id]'
    @update:select-user-ids='updateSelectUserIds(node.id, $event)'/>
</template>

<script lang='ts' setup>
import { useVuelidate, type Validation } from '@vuelidate/core';
import { inject, onMounted, type PropType, type Ref, ref, watch } from 'vue';

import { firstBasicNodes } from '@/apps/work-flow/api/graphql/flow-api';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import ChooseNextUsers from '@/apps/work-flow/views/process/detail/task/popup/ChooseNextUsers.vue';

const flowId = defineModel('flowId', {
  type: String,
  default: ''
});
const nodes = ref<NodeInputInterface[]>([]);
const selectUserIdsRecord = defineModel('selectUserIdsRecord', {
  type: Object as PropType<Record<string, Set<string>>>,
  default: {}
});
const {
  load,
  refetch
} = firstBasicNodes();

watch(flowId, (value) => {
  if (value) {
    (load(undefined, { id: value }) || refetch({ id: value }))
      ?.then(result => {
        if (result) {
          nodes.value = result?.firstBasicNodes || [];
        }
      });
  }
});

function updateSelectUserIds(nodeId: string, userIds: Set<string>) {
  selectUserIdsRecord.value = {
    ...selectUserIdsRecord.value,
    [nodeId]: userIds
  };
}

const hasValidKeysAndValues = (value?: Record<string, Set<string>>) => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return false;
  }
  return keys.every(key => value[key] instanceof Set && value[key].size > 0);
};

const rules = { selectUserIdsRecord: { hasValidKeysAndValues } };
const v$ = useVuelidate(rules, { selectUserIdsRecord });
const registerValidation = inject('registerValidation', (key: string, v: Ref<Validation>) => void {});

onMounted(() => {
  registerValidation?.('ChooseNextFirstUsers', v$);
});
</script>

<style scoped>

</style>