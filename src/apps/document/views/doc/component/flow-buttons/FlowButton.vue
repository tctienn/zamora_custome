<template>
  <Button
    v-if='outcome && outcome.name === "NEXT"'
    :class='`border-round-sm btn-flow-doc text-900 surface-100 hover:surface-300 ` + classNameBtn'
    :disabled='disabled || (outcome && checkRequired(outcome, objectData))'
    icon='pi pi-send'
    :label='label'/>
  <Button
    v-else-if='outcome'
    :class='`border-round-sm btn-flow-doc text-900 surface-100 hover:surface-300 ` + classNameBtn'
    :disabled='disabled || (outcome && checkRequired(outcome, objectData))'
    icon='pi pi-verified'
    :label='label'/>
  <!--  <Button-->
  <!--    v-if='outcome'-->
  <!--    :disabled='disabled||checkRequired(outcome,objectData)'-->
  <!--    :label='label'-->
  <!--    :size='size'-->
  <!--    :style='{background:outcome.color,-->
  <!--             "border-color":outcome.color,-->
  <!--             color:calculateColorBasedOnBackgroundColor(outcome.color||"#000000")}'>-->
  <!--    <template #icon>-->
  <!--      <AppIcon-->
  <!--        class='align-items-center flex pr-1'-->
  <!--        name='forward_to_inbox'-->
  <!--        :size='iconSize'>-->
  <!--      </AppIcon>-->
  <!--    </template>-->
  <!--  </Button>-->
</template>

<script lang="ts" setup>
import { type FlowButtonProps } from '@/apps/document/views/doc/component/flow-buttons/flow-button-type';
import type { Outcome } from '@/apps/work-flow/model/flow';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';

withDefaults(defineProps<FlowButtonProps>(), {
  outcome: undefined,
  disabled: false,
  label: 'Nút',
  objectData: {},
  iconSize: '1',
  classNameBtn: '',
});

function checkRequired<T extends Record<string, any>>(outcome: Outcome, objectData: T) {
  if (!outcome.required) {
    return false;
  } else {
    return !outcome.required.every(e => {
      if (!e.field || !(e.field in objectData)) {
        return true;
      }
      return objectData[e.field as keyof T]?.toString() === e.value?.toString();
    });
  }
}
</script>

<style scoped>
:deep(.p-button-icon-left.pi-verified) {
  color: #3E84F6 !important;
}
:deep(.p-button-icon-left.pi-send) {
  color: #3E84F6 !important;
}
:deep(.p-button-label) {
  font-weight: 400 !important;
}
</style>