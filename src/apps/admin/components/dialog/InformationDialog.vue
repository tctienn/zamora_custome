<template>
  <Dialog
    v-model:visible='visible'
    class='text-center w-3'
    :closable='true'
    dismissable-mask
    modal
    :show-header='false'
    @hide='hide'>
    <div class='align-content-center flex flex-column justify-content-center p-8'>
      <AppIcon
        :class='type === ACTION_RESULT.SUCCESS ? "text-green-600" : "text-red-600"'
        :name='type === ACTION_RESULT.SUCCESS ? "check_circle" : "cancel"'
        size='5'/>
      <label class='font-bold text-2xl'>
        {{ t(title) }}
      </label>
      <label class='text-xl'>
        {{ t(message) }}
      </label>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ACTION_RESULT } from '@/common/constants';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  hide: {
    type: Function,
    default: () => void {}
  }
});

const { t } = useI18n() || {};

const visible = ref(props.show);
</script>

<script>
export default { name: 'InformationDialog' };
</script>