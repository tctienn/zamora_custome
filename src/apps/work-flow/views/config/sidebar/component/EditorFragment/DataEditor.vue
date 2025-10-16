<template>
  <div class='flex flex-column gap-2'>
    <div
      v-for='(value,index) in modelValue'
      :key='index'
      class='align-items-center flex justify-content-between'>
      <InputText
        v-model='modelValue[index].field'
        class='w-3'
        :placeholder='t("work-flow.flow.field")'>
      </InputText>
      <InputText
        v-model='modelValue[index].value'
        :placeholder='t("work-flow.flow.value")'>
      </InputText>
      <AppIcon
        v-tooltip.top='t("work-flow.flow.deleteRequired")'
        class='cursor-pointer'
        :fill='false'
        name='close'
        size='1.5'
        @click='removeRequiredOutcome(index)'>
      </AppIcon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Nullable } from 'primevue/ts-helpers';
import { useI18n } from 'vue-i18n';

import AppIcon from '@/common/components/app/AppIcon.vue';

const { t } = useI18n();
const modelValue = defineModel<{ field: Nullable<string>, value: Nullable<string> }[]>({
  default: [{
    field: undefined,
    value: undefined
  }],
  required: false
});
function addFieldData() {
  if (modelValue.value) {
    modelValue.value = [
      ...modelValue.value,
      {
        field: undefined,
        value: undefined
      }
    ];
  }
}
function removeRequiredOutcome(index: number) {
  modelValue.value.splice(index, 1);
}

defineExpose({ addFieldData });
</script>

<script lang="ts">
export default { name: 'DataEditor' };
</script>

<style scoped>

</style>