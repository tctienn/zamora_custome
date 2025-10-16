<template>
  <DynamicEFormElement
    v-model='config.config'
    :mode='ElementMode.ADVANCE'
    :type='config.type'/>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import DynamicEFormElement from '@/apps/e-form/components/DynamicEFormElement.vue';
import { ElementMode } from '@/apps/e-form/components/element';
import type { ElementConfig } from '@/apps/e-form/model/form-config';

const config = defineModel({
  type: Object as PropType<ElementConfig>,
  default: {}
});

</script>
