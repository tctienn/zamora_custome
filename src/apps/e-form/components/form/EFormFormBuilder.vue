<template>
  <div
    class='border-round card form-canvas'
    @dragover.prevent>
    <div class='action flex gap-2 justify-content-center mb-2'>
      <div
        v-tooltip="t('common.configure')"
        class='config-btn icon-action'
        @click='emits("show-relationship-config")'>
        <i class='pi pi-cog text-xl'></i>
      </div>
      <div
        v-tooltip="t('common.preview')"
        class='icon-action play-btn'
        @click='emits("show-preview")'>
        <i class='pi pi-play text-xl'></i>
      </div>
    </div>
    <Draggable
      v-model='formElements'
      :disabled='disabled || !draggingEnabled'
      group='form-elements'>
      <template #item='{ element, index }'>

        <EFormElementWrapper
          :drop-enabled='dropEnabled'
          :edit-mode='editMode'
          :element='element'
          :highlight='currentIndexElement === index'
          :total-columns='totalColumns'
          @delete='deleteElement(index)'
          @drop-before='() => dropAtIndex(index)'
          @focus-element='currentIndexElement = index'
          @start-resize='startResize($event, index)'
          @update:config="() => $emit('update:config', index)">
          <DynamicEFormElement
            :class='{"p-disabled": disabled}'
            :mode='editMode ? ElementMode.CONFIG : ElementMode.EDIT'
            :required='element.config.validations?.some((v: ValidationRule) => v.type === "required")'
            :type='element.type'
            v-bind='omit(element.config, "type")'
            @update:label='updateLabel(index, $event)'/>
        </EFormElementWrapper>

      </template>
    </Draggable>
    <div
      class='drop-zone'
      @dragover.prevent
      @drop.prevent="$emit('drop-handle', formElements.length)"></div>
    <div
      v-if='editMode'
      class='grid-overlay'>
      <div
        v-for='n in totalColumns'
        :key='n'
        class='grid-line'></div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Draggable from 'vuedraggable';

import DynamicEFormElement from '@/apps/e-form/components/DynamicEFormElement.vue';
import { ElementMode } from '@/apps/e-form/components/element';
import EFormElementWrapper from '@/apps/e-form/components/form/EFormElementWrapper.vue';
import type { ElementConfig, ResizeInfo, ValidationRule } from '@/apps/e-form/model/form-config';

const props = defineProps({
  totalColumns: {
    type: Number,
    default: 12,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  dropEnabled: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['drop-handle', 'update:config', 'show-relationship-config', 'show-preview']);
const { t } = useI18n();
const formElements = defineModel<ElementConfig[]>({
  type: Array as PropType<ElementConfig[]>,
  default: () => []
});

const draggingEnabled = ref(true);
const resizing = ref<ResizeInfo>();
const currentIndexElement = ref<number>();

function dropAtIndex(index: number) {
  emits('drop-handle', index);
}

function dropElement(element: ElementConfig, index?: number) {

  if (index !== undefined && index >= 0 && index <= formElements.value.length) {
    formElements.value = [
      ...formElements.value.slice(0, index),
      element,
      ...formElements.value.slice(index),
    ];
  } else {
    formElements.value = [...formElements.value, element];
  }
}

const saveFormElementsConfig = (index: number, updatedField: ElementConfig) => {
  if (index !== -1) {
    formElements.value = formElements.value.map((el, i) =>
      i === index ? {
        ...el,
        config: {
          ...el.config,
          ...updatedField
        }
      } : el
    );
  }
};

function updateLabel(index: number, label: string) {
  formElements.value = formElements.value.map((el, i) => {
    if (i === index) {
      return {
        ...el,
        config: {
          ...el.config,
          label,
        },
      };
    }
    return el;
  });
}

defineExpose({
  dropElement,
  saveFormElementsConfig,
});

function deleteElement(index: number) {
  formElements.value = formElements.value.filter((_, i) => i !== index);
}

function startResize(e: MouseEvent, index: number) {
  e.preventDefault();
  e.stopPropagation();
  const el = (e.target as HTMLElement).closest('.form-element') as HTMLElement;
  const startWidth = el?.offsetWidth;
  resizing.value = {
    startX: e.clientX,
    index,
    startWidth,
    startSpan: formElements.value[index].config?.span || props.totalColumns,
  };
  draggingEnabled.value = false;
  window.addEventListener('mousemove', resizeDragging);
  window.addEventListener('mouseup', stopResize);
}

function resizeDragging(e: MouseEvent) {
  if (!resizing.value) {
    return;
  }
  const deltaX = e.clientX - resizing.value.startX;
  const colWidth = (document.querySelector('.form-canvas')?.clientWidth || 0) / props.totalColumns;
  const newWidth = resizing.value.startWidth + deltaX;
  let newSpan = Math.round(newWidth / colWidth);
  newSpan = Math.max(1, Math.min(props.totalColumns, newSpan));
  formElements.value = formElements.value.map((el, i) => {
    if (i === resizing.value?.index) {
      return {
        ...el,
        config: {
          ...el.config,
          span: newSpan,
        },
      };
    }
    return el;
  });
}

function stopResize() {
  resizing.value = undefined;
  draggingEnabled.value = true;
  window.removeEventListener('mousemove', resizeDragging);
  window.removeEventListener('mouseup', stopResize);
}
</script>

<style lang='scss' scoped>
.grid-overlay {
  position: absolute;
  padding: 1rem;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(v-bind(totalColumns), 1fr);
  pointer-events: none;
  /* Không chặn kéo thả */
  z-index: 1;

  .grid-line {
    border-right: 1px dashed var(--text-color-secondary);
    opacity: 0.4;
    height: 100%;
  }
}

.form-canvas {

  padding: 1rem;
  overflow-x: visible;
  position: relative;
  width: 100%;
  margin-left: auto;
  margin-right: auto;

  > div {
    display: grid;
    grid-template-columns: repeat(v-bind(totalColumns), 1fr);
    gap: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .form-canvas {
    width: 800px;
  }
}

@media (min-width: 1440px) {
  .form-canvas {
    width: 1200px;
  }
}

.form-element-wrapper-with-dropzone {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action {
  top: 0.5rem;
  left: 50%;

  .icon-action {
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    padding: 10px;

    &.play-btn {
      background: var(--primary-500);
      color: white;
    }

    &.config-btn {
      background: var(--cyan-500);
      color: white;
    }
  }
}

</style>