<template>
  <div
    v-if='mapSourceEdges[groupId]'
    class='edge flex gap-2 gap-3 justify-content-center relative'>
    <div
      class='absolute arrow'
      style='top: 0; left: 50%'></div>
    <div
      class='p-3'>
      <div
        class='bg-blue-500 border-round editable-wrapper p-2 relative text-white'>
        <div
          class='div-editable px-2'
          v-bind='{contenteditable:!viewOnly}'
          @input='mapSourceEdges[groupId].data.label=($event.target as HTMLElement)?.innerText || ""'>
          {{ mapSourceEdges[groupId]?.data?.label }}
        </div>
        <ButtonIcon
          v-if='showAddButton'
          v-tooltip="t('Thêm nốt xuống dưới')"
          class='absolute button p-2'
          icon='add'
          round
          style='top:0; left: calc(100% + 1rem)'
          @click='emits("addGroupAtIdx")'>
        </ButtonIcon>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import type { EdgeGroup } from '@/apps/document/views/doc/doc-out/component/flow/config';

const props = defineProps({
  groupId: {
    type: String,
    default: ''
  },
  showAddButton: {
    type: Boolean,
    default: false,
  },
  viewOnly: {
    type: Boolean,
    default: false,
  }
});
const emits = defineEmits(['addGroupAtIdx']);
const mapSourceEdges = defineModel<Record<string, EdgeGroup>>('mapSourceEdges', { default: () => ({}) });
const { t } = useI18n();
</script>

<style scoped>
.editable-wrapper {
  &:focus-within {
    outline: var(--blue-700) solid 2px;
  }

  .div-editable {
    &:focus-visible {
      outline: none;
    }
  }
}

.edge:hover {
  .button {
    opacity: 1;
  }
}

.button {
  opacity: 0;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.arrow {
  width: 2px;
  height: 100%;
  background-color: var(--blue-500);
  position: relative;
}

.arrow::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 10px solid var(--blue-500);
  position: absolute;
  top: calc(100% - 7px);
  left: -4px;
}
</style>