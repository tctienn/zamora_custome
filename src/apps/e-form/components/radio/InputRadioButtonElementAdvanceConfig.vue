<template>
  <DataConfig v-model='radioConfigRef.datasource'/>
</template>

<script lang='ts' setup>
import { type PropType } from 'vue';

import DataConfig from '@/apps/e-form/components/data/DataConfig.vue';
import type { InputRadioElementConfig } from '@/apps/e-form/model/advance-config';

const radioConfigRef = defineModel({
  type: Object as PropType<InputRadioElementConfig>,
  default: () => ({} as InputRadioElementConfig)
});
</script>
