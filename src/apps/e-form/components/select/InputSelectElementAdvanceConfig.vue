<template>
  <DynamicEFormElement
    v-model='selectConfigRef.multiple'
    label='Multiple'
    :mode='ElementMode.EDIT'
    :type='ElementType.SWITCH'/>
  <DataConfig v-model='selectConfigRef.datasource'/>
</template>

<script lang='ts' setup>
import { type PropType } from 'vue';

import DataConfig from '@/apps/e-form/components/data/DataConfig.vue';
import DynamicEFormElement from '@/apps/e-form/components/DynamicEFormElement.vue';
import { ElementMode, ElementType } from '@/apps/e-form/components/element';
import type { InputSelectElementConfig } from '@/apps/e-form/model/advance-config';

const selectConfigRef = defineModel({
  type: Object as PropType<InputSelectElementConfig>,
  default: () => ({} as InputSelectElementConfig)
});
</script>
