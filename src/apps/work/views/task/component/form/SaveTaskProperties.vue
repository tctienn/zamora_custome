<template>
  <div class='flex gap-3 justify-content-between'>
    <div class='field w-6'>
      <label
        class='font-semibold'
        for='code'>
        {{ "Trọng số" }}
      </label>
      <InputNumber
        v-model='task.weight'
        class='p-component w-full'
        :max-fraction-digits='3'
        :min='0'
        mode='decimal'
        name='code'/>
    </div>

    <div
      class='field font-semibold w-6'>
      <label
        for='completionType'>
        {{ t('work.completionType') }}
      </label>
      <div>
        <Dropdown
          v-model='task.completionType'
          class='w-full'
          input-id='completionType'
          option-label='label'
          option-value='value'
          :options='completionTypeOptions'/>
      </div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { camelCase } from 'lodash';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { CompletionType, type Task } from '@/apps/work/model/task';
import { createOptions } from '@/common/helpers/utils';

const { t } = useI18n();

const task = defineModel<Task>({
  default: {
    repeatConfig: { taskId: '' },
    startTime: new Date(),
    completionType: CompletionType.AUTO,
    createdDate: new Date(),
  }
});

watch(() => task.value.completionType, (value) => {
  if (value == CompletionType.AUTO) {
    task.value.weight = 1;
  }
});

watch(() => task.value.weight, () => {
  if (task.value.completionType == CompletionType.AUTO) {
    task.value.weight = 1;
  }
});

const completionTypeOptions = createOptions(CompletionType, (_, value) => t(`work.completionTypes.${camelCase(value)}`));
</script>

<style scoped>

</style>