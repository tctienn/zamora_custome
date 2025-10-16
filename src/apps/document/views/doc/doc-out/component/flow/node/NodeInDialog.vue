<template>
  <div
    class='border-1 border-round cursor-pointer flex node surface-border'
    :class="{'is-selected':isSelected}"
    @click.stop='emits("selectNode",nodeData as CommonNodeData)'>
    <div class='flex flex-column gap-2 p-2 w-full'>
      <div class='relative'>
        <div class='align-items-start flex h-2rem'>
          <div
            class='border-round div-editable mx-auto px-4 py-2'
            :class='classForTitle()'
            v-bind='{contenteditable:!viewOnly}'
            style='cursor: text'
            @input='nodeLabel=($event.target as HTMLElement)?.innerText || ""'>
            {{ nodeLabel }}
          </div>
        </div>

        <div
          v-if='!isStartEndGroup && !viewOnly'
          class='absolute align-items-start flex gap-2 node-actions transition-duration-500'
          style='top: 0; right: 0'>
          <AppIcon
            v-tooltip='t("common.delete")'
            class='cursor-pointer hover:surface-hover p-2'
            name='delete'
            size='1.5'
            @click.stop='emits("deleteNode")'/>
        </div>

      </div>
      <div
        v-if='!isStartEndGroup '
        class='flex gap-4'>
        <label
          v-for='option in flowConfigType?.optionActions'
          :key='option.name'
          class='align-items-center cursor-pointer flex gap-2'>
          <Checkbox
            binary
            :disabled='viewOnly'
            :model-value='isOptionChecked(option.name)'
            @update:model-value='checkOption($event, option.label||"", option.name)'/>
          {{ option.label }}
        </label>
      </div>
      <div class='flex flex-column gap-2'>
        <template
          v-for='(userDeptRole,idx) in nodeData?.options?.userDeptRoles'
          :key='userDeptRole.id'>
          <div class='align-items-center flex justify-content-between user-tile'>
            <div class='align-items-center flex grid w-full'>
              <div class='align-items-center col-7 flex gap-3'>
                <div class='font-semibold text-lg'> {{ idx + 1 }}.</div>
                <AppUserDeptRole
                  avatar-size='3'
                  info-visible
                  :infos='["positionName","deptName"]'
                  name-visible
                  :user-dept-role='userDeptRole'/>
              </div>
              <div class='col-5'>
                {{ userDeptRole.roleName }}
              </div>
            </div>
            <ButtonIcon
              v-if='!viewOnly'
              v-tooltip="t('Xóa người dùng')"
              class='user-buttons'
              icon='delete'
              round
              text
              @click='deleteUser(idx)'>
            </ButtonIcon>
          </div>
        </template>
      </div>
    </div>
  </div>

</template>

<script lang='ts' setup>
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { NodeGroup } from '@/apps/document/views/doc/doc-out/component/flow/config';
import type { CommonNodeData } from '@/apps/work-flow/model/flow';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';

const props = defineProps({
  index: {
    type: Number,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  nodeGroups: {
    type: Array as PropType<NodeGroup[]>,
    default: () => []
  },
  indexGroup: {
    type: Number,
    default: 1,
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits<{
  (e: 'deleteNode'): void
  (e: 'levelUp'): void
  (e: 'levelDown'): void
  (e: 'selectNode', selectedNode: CommonNodeData): void
}>();
const nodeData = defineModel('nodeData', { type: Object as PropType<CommonNodeData> });
const { t } = useI18n();
const nodeLabel = defineModel<string>('label', { default: 'Tên nốt' });
const flowConfigType = inject('flowConfigType', ref<FlowType>());

function checkOption(value: boolean, label: string, name: string) {
  if (!nodeData.value) {
    return;
  }
  if (value) {
    nodeData.value.optionActions = [
      ...nodeData.value.optionActions || [],
      {
        name,
        label,
      },
    ];
  } else {
    nodeData.value.optionActions = nodeData.value?.optionActions?.filter((item) => item.name !== name);
  }
}

function isOptionChecked(name: string) {
  return nodeData.value?.optionActions?.some((item) => item.name === name) == true;
}

function deleteUser(idx: number) {
  nodeData.value?.options?.userDeptRoles?.splice(idx, 1);
}

const isStartEndGroup = computed(() => {
  return props.indexGroup == 0 || props.indexGroup == props.nodeGroups?.length - 1;
});

function classForTitle() {
  return {
    'bg-green-500 text-white': props.indexGroup === 0,
    'bg-red-500 text-white': props.indexGroup === props.nodeGroups.length - 1,
    'bg-primary': !isStartEndGroup.value,
  };
}

</script>

<style lang='scss' scoped>
.div-editable {
  &:focus-visible {
    outline: var(--primary-dark) solid 2px;
  }
}

.is-selected {
  border-color: var(--primary-color) !important;
}

.node:hover {
  .node-actions {
    opacity: 1;
  }
}

.node {
  min-width: fit-content;
}

.node-actions {
  opacity: 0;
}

.user-tile:hover {
  .user-buttons {
    opacity: 1;
  }
}

.user-buttons {
  opacity: 0;
}
</style>