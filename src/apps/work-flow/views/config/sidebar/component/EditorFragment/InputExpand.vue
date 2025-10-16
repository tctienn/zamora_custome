<template>
  <div
    class='input-area p-inputtext'
    :style='`color: ${textColor}`'>
    <div class='align-items-center flex'>
      <InputText
        v-if='!flowType?.actions'
        v-model='modelValue.label'
        class='bg-transparent border-none input-none p-1 w-full'
        :style='`color: ${textColor}`'/>
      <Dropdown
        v-else
        class='bg-transparent border-none disable-focus input-none p-1 w-full'
        :input-class='`disable-focus p-0 ${isExpanded?"pb-1":""}`'
        :input-style='{color: textColor}'
        :model-value='outcome'
        option-label='label'
        :options='outcome?.name?flowType?.actions:actionFilter'
        @update:model-value='updateDropdown'>
      </Dropdown>
      <AppColorPicker
        v-model='color'
        v-tooltip.top="t('work-flow.flow.changeColor')"
        class='input-icon'
        :style='`color: ${textColor}`'>
      </AppColorPicker>

      <AppIcon
        v-if='canExpand'
        v-tooltip.top="t('work-flow.flow.expand')"
        class='cursor-pointer hover:text-primary input-icon'
        name='keyboard_arrow_down'
        size='1.5'
        :style='`color: ${textColor}`'
        @click='expand'>
      </AppIcon>
      <AppIcon
        v-tooltip.left="t('work-flow.flow.deleteOutcome')"
        class='cursor-pointer hover:text-primary input-icon'
        name='close'
        size='1.5'
        :style='`color: ${textColor}`'
        @click.stop='emits("delete",modelValue)'>
      </AppIcon>
    </div>
    <slot>
      <div
        v-if='isExpanded'
        class='w-full'>
        <div>
          <span
            :class="!optionsCheck ? 'text-color-secondary' : ''"
            :style='`color: ${textColor}`'>
            <Checkbox
              v-model='optionsCheck'
              value='autoNext'/>
            {{ t("work-flow.flow.autoNext1") }}
            <input
              v-model='modelValue.autoNext'
              :class="`bg-transparent border-bottom-1 border-none input-none ${!optionsCheck?.includes('autoNext') ? 'p-disabled' : ''} w-3rem`"
              type='number'/>
            {{ t("work-flow.flow.autoNext2") }}
          </span>
        </div>
        <div class='field'>
          <div class='align-items-center flex justify-content-between'>
            <label class='font-semibold'>
              {{ t('work-flow.flow.requiredOutcome') }}
            </label>
            <AppIcon
              v-tooltip.top='t("work-flow.flow.addRequired")'
              class='cursor-pointer'
              :fill='false'
              name='add_circle'
              size='1.5'
              @click='addRequiredOutcome'>
            </AppIcon>
          </div>
          <DataEditor
            ref='dataEditor'
            v-model='modelValue.required'>
          </DataEditor>
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, inject, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Outcome } from '@/apps/work-flow/model/flow';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import DataEditor from '@/apps/work-flow/views/config/sidebar/component/EditorFragment/DataEditor.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppColorPicker from '@/common/components/custom/AppColorPicker.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';

const props = defineProps({
  canExpand: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['delete', 'update:outcome']);

const textColor = computed(() =>
  calculateColorBasedOnBackgroundColor(modelValue.value.color || '#ffffff'),
);
const { t } = useI18n();
const modelValue = defineModel<Outcome>({ required: true });
const color = ref<string>('ffffff');
const outcome = ref<Outcome>({} as Outcome);
watch(modelValue, (value) => {
  color.value = value.color || 'ffffff';
  outcome.value = {
    label: value.label,
    name: value.name,
  } as Outcome;
}, { immediate: true });
const isExpanded = ref(false);
const optionsCheck = ref<string[]>();
watch(color, (value, oldValue) => {
  if (value != oldValue) {
    if (value.startsWith('#')) {
      modelValue.value.color = value;
    } else {
      modelValue.value.color = '#' + value;
    }
  }
});

function expand() {
  isExpanded.value = !isExpanded.value;
}

const dataEditor = ref();

function addRequiredOutcome() {
  if (dataEditor.value) {
    dataEditor.value.addFieldData();
  }
}

watch(isExpanded, (value) => {
  if (!value) {
    delete modelValue.value.autoNext;
  }
});
const usedOutcomes: ComputedRef<string[]> = inject('usedOutcomes', {} as ComputedRef<string[]>);
const actionFilter = computed(() => {
  const rs: Outcome[] = [];
  flowType.value?.actions.forEach((e) => {
    if (!usedOutcomes.value.includes(e.name)) {
      rs.push(e);
    }
  });
  return rs;
});
const flowType: Ref<FlowType | undefined> = inject(
  'flowType',
    {} as Ref<FlowType | undefined>,
);
const confirm = useConfirm();

function updateDropdown(data: any) {
  const isOutcomeUsed = usedOutcomes.value.includes(data.name);
  const isDifferentOutcome = modelValue.value.name !== data.name;

  const updateModel = () => {
    outcome.value = data;
    modelValue.value = {
      ...modelValue.value,
      name: data.name,
      label: data.label
    };
    emits('update:outcome', data);
  };

  if (isOutcomeUsed && isDifferentOutcome) {
    confirm.require({
      message: `${t('work-flow.flow.outcome')} ${t('work-flow.flow.isBeingUsed')}.
              \n ${t('common.continueProcess', {
    itemType: t('work-flow.flow.outcome'),
    itemName: modelValue.value.label
  })}`,
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: updateModel
    });
  } else {
    updateModel();
  }
}
</script>

<script lang="ts">
export default { name: 'InputExpand' };
</script>

<style lang="scss" scoped>
.disable-focus {
  box-shadow: none;
  border-color: unset;
}

input:focus {
  outline: none;
  box-shadow: none;
}

.input-none {
  :focus {
    outline: none;
    box-shadow: none;
  }
}

.input-area:hover {
  .input-icon {
    opacity: 1;
  }
}

.input-icon {
  opacity: 0;
}
</style>
