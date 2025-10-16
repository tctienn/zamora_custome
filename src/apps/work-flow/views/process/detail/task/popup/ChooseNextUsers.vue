<template>
  <div
    class='flex flex-column gap-2 overflow-y-auto relative'
    style='min-height: 60vh'>
    <div class='font-semibold p-2 pl-4 shadow-1 sticky surface-card top-0 z-1'>{{ header }}</div>
    <div v-if='node?.type===NodeType.BASIC'>
      <SelectUsersGroupByDep
        class='w-full'
        :multiple='selectMultiple'
        :node='node'
        :users='allUsers'>
      </SelectUsersGroupByDep>
      <!--      <SelectedUsersGroupBy-->
      <!--        class='absolute w-full'-->
      <!--        :multiple='selectMultiple'-->
      <!--        :users='allUsers'/>-->
    </div>

    <div
      v-if='node?.type===NodeType.END'
      class='flex flex-column gap-1 p-2'>
      <label
        for='comment'>{{ t('work-flow.task.comment') }}</label>
      <Textarea
        id='comment'
        v-model='comment'
        class='w-full'
        rows='3'/>
    </div>
  </div>

</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, type PropType, provide } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { type NodeInputInterface, NodeType, SelectionOption } from '@/apps/work-flow/model/flow';
import SelectUsersGroupByDep from '@/apps/work-flow/views/process/detail/task/popup/SelectUsersGroupByDep.vue';

const props = defineProps({
  node: {
    type: Object as PropType<NodeInputInterface>,
    default: undefined
  }
});

const selectUserIds = defineModel('selectUserIds', {
  type: Object as PropType<Set<string>>,
  default: new Set()
});
const comment = defineModel('comment', {
  type: String,
  default: ''
});

const { t } = useI18n();
const infoStore = useUserMoreInfoStore();
const { allUsers } = storeToRefs(infoStore);
const selectMultiple = computed(() => props.node?.type === NodeType.BASIC && props.node?.data?.selectionOption === SelectionOption.MULTIPLE);

const header = computed(() => {
  switch (props?.node?.type) {
  case NodeType.END:
    return t('work-flow.task.finishTask') + ': ' + (props.node?.data?.label || t('work-flow.task.end'));
  default:
    return t('work-flow.task.chooseUsersForNextTasks') + ': ' + (props.node?.data?.label || '');
  }
});

function selectUser(id: string) {
  if (selectUserIds.value.has(id)) {
    selectUserIds.value.delete(id);
  } else {
    if (selectMultiple.value) {
      selectUserIds.value.add(id);
    } else {
      selectUserIds.value = new Set([id]);
    }
  }
}

function isUserSelected(userId: string) {
  return selectUserIds.value.has(userId);
}

provide('selectUser', selectUser);
provide('isUserSelected', isUserSelected);
provide('selectUserIds', selectUserIds);

onBeforeMount(() => {
  infoStore.fetchAllUsers();
});
</script>

<style scoped>

</style>