<template>
  <div
    class='form-element'
    :class='{ "edit-mode": editMode, "highlight": highlight }'
    :style='{
      gridColumn: `span ${element.config?.span || totalColumns} / span ${element.config?.span || totalColumns}`,
    }'
    @click='$emit("focus-element")'
    @dragover.prevent>
    <div
      v-if='dropEnabled'
      class='drop-zone'
      :class="{ 'drag-over': isDragOver }"
      @dragenter.prevent='isDragOver = true'
      @dragleave.prevent='isDragOver = false'
      @dragover.prevent
      @drop.prevent='emitDrop'></div>

    <slot>
      {{ element.config?.label }}
    </slot>
    <template v-if='editMode'>
      <div class='action'>
        <div
          class='delete-btn icon-action'
          @click="$emit('delete')">
          <i class='pi pi-trash text-xl'></i>
          <div class='sub-text'>{{ t('common.delete') }}</div>
        </div>
        <div
          class='config-btn icon-action'
          @click="$emit('update:config')">
          <i class='pi pi-cog text-xl'></i>
          <div class='sub-text'>{{ t('common.configure') }}</div>
        </div>
      </div>
    </template>
    <div
      class='resize-handle'
      @mousedown="(e) => $emit('start-resize', e)"></div>
    <Badge
      v-if='errorCount'
      class='error-count'
      severity='danger'>{{ errorCount }}
    </Badge>
  </div>
</template>

<script lang='ts' setup>

import { useVuelidate, type Validation } from '@vuelidate/core';
import { helpers, requiredIf } from '@vuelidate/validators';
import { computed, onMounted, type PropType, type Ref, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { type ElementConfig, requiredNames } from '@/apps/e-form/model/form-config';

const props = defineProps({
  element: {
    type: Object as PropType<ElementConfig>,
    default: () => ({}),
  },
  totalColumns: {
    type: Number,
    default: 12,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  highlight: {
    type: Boolean,
    default: false,
  },
  dropEnabled: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['focus-element', 'start-resize', 'delete', 'drop-before', 'update:config']);
const { t } = useI18n();

const validateRules = {
  element: {
    config:
      {
        name: {
          required: helpers.withMessage(t('common.validate.required', { item: t('common.name') }),
            requiredIf(() => requiredNames.includes(props.element.type))),
        }
      }
  },
};
const elementRef = toRef(() => props.element);
const v$: Ref<Validation> = useVuelidate(validateRules, { element: elementRef });

const errorCount = computed(() => v$.value.$errors.length);

onMounted(() => {
  v$.value.$touch();
});

const isDragOver = ref(false);

function emitDrop() {
  isDragOver.value = false;
  emits('drop-before');
}
</script>

<style lang='scss' scoped>
.form-element {
  position: relative;
  user-select: none;

  &.edit-mode:hover,
  &.edit-mode.highlight {
    cursor: move;

    &:after {
      content: '';
      position: absolute;
      top: -.25rem;
      bottom: -.25rem;
      left: -.75rem;
      right: -.5rem;
      border: 2px solid var(--primary-color);
      border-radius: 6px;
      pointer-events: none;
      z-index: 1;
    }

    .resize-handle {
      background: var(--primary-color);
      cursor: ew-resize;
    }

    .delete-btn,
    .config-btn {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .resize-handle {
    position: absolute;
    top: -.25rem;
    left: 100%;
    width: 4px;
    height: calc(100% + .5rem);
    border-radius: 2px;
    background: transparent;
    z-index: 5;
  }

  .error-count {
    position: absolute;
    top: -.5rem;
    right: 0;
    z-index: 6;
  }

  .icon-action {
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 20px;
    padding: 10px;

    .sub-text {
      display: none;
    }

    &.delete-btn {
      background: var(--red-500);
      color: white;
    }

    &.config-btn {
      background: var(--cyan-500);
      color: white;
    }

    &:hover {
      width: 7.5rem;

      .sub-text {
        display: block;
      }
    }
  }

  .delete-btn,
  .config-btn {
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    z-index: 111;
  }

  .action {
    position: absolute;
    top: 0;
    left: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-left: 0.5rem;
  }

}

.drop-zone {
  position: absolute;
  top: -1rem;
  left: 0;
  width: 100%;
  height: 1rem;
  background: transparent;
  z-index: 2;
  transition: background 0.2s ease, opacity 0.2s ease;
  border-radius: 0.5rem;

  &.drag-over {
    background: var(--primary-color);
    opacity: 0.4;
  }
}
</style>