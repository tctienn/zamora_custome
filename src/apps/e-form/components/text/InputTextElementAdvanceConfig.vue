<template>
  <div
    class='flex flex-column gap-3'>
    <div class='field'>
      <label>Placeholder</label>
      <InputText v-model='field.placeholder'/>
    </div>

    <div class='field'>
      <label>Input Style</label>
      <Textarea
        id='input-style'
        v-model='inputStyleRaw'
        auto-resize
        class='w-full'
        placeholder='e.g. { "fontSize": "16px", "color": "red" }'
        rows='3'/>
    </div>

    <div class='field'>
      <label>Max Length</label>
      <InputNumber
        v-model='field.maxlength'
        :min='1'
        show-buttons/>
    </div>

    <div class='field'>
      <label>Autocomplete</label>
      <Dropdown
        v-model='field.autocomplete'
        :options='autocompleteOptions'
        placeholder='Select autocomplete'/>
    </div>

    <div class='field-checkbox'>
      <Checkbox
        v-model='field.disabled'
        :binary='true'
        input-id='disabled'/>
      <label for='disabled'>Disabled</label>
    </div>

    <div class='field-checkbox'>
      <Checkbox
        v-model='field.readonly'
        :binary='true'
        input-id='readonly'/>
      <label for='readonly'>Readonly</label>
    </div>
  </div>
</template>

<script lang='ts' setup>
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { type PropType, ref, watch } from 'vue';

import type { InputTextAdvanceConfig } from '@/apps/e-form/model/advance-config';

const field = defineModel({
  type: Object as PropType<InputTextAdvanceConfig>,
  default: () => ({
    placeholder: '',
    maxlength: undefined,
    autocomplete: '',
    disabled: false,
    readonly: false
  })
});
const inputStyleRaw = ref<string>('');
const autocompleteOptions = [
  'on',
  'off',
  'name',
  'email',
  'username',
  'new-password',
  'current-password',
];

watch(() => inputStyleRaw.value, (val) => {
  try {
    field.value.config.inputStyle = JSON.parse(val);
  } catch (e) {
    // handle invalid JSON input
  }
});

</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
