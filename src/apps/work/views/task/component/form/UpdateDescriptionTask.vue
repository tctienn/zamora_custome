<template>
  <Dialog
    v-model:visible='visible'
    :header='"Cập nhật mô tả, mục tiêu công việc"'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @show='showDialog'>
    <div
      class='field'>
      <label
        class='font-semibold'
        for='description'>
        {{ t('common.description') }}
      </label>
      <AppEditor
        v-model='descriptionState'
        class='w-full'
        editor-style='height: 15rem;'>
      </AppEditor>
    </div>
    <div class='field'>
      <label
        class='font-semibold'>{{ t('work.project.target') }}</label>
      <AppEditor
        v-model='targetState'
        class='w-full'
        editor-style='height: 15rem;'>
      </AppEditor>
    </div>
    <template #footer>
      <div class='flex gap-2'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='visible=false'>
        </Button>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='save'>

        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppEditor from '@/common/components/custom/AppEditor.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  description: {
    type: String,
    default: ''
  },
  target: {
    type: String,
    default: ''
  }
});

const emits = defineEmits<{
  (e: 'save', description: string, target: string): void,
}>();
const visible = defineModel<boolean>('visible', { default: false });
const descriptionState = ref<string>('');
const targetState = ref<string>('');

function showDialog() {
  descriptionState.value = props.description;
  targetState.value = props.target;
}

const { t } = useI18n();

function save() {
  emits('save', descriptionState.value, targetState.value);
  visible.value = false;
}

</script>

<style scoped>

</style>