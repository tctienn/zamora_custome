<template>
  <div class='formgrid grid'>
    <div class='col-12 field flex flex-column items-center justify-content-between'>
      <label>Nội dung tiêu đề</label>
      <InputText v-model='field.config.text'/>
    </div>

    <div class='col-6 field'>
      <label>Kiểu tiêu đề (H tag)</label>
      <Dropdown
        v-model='field.config.tag'
        option-label='label'
        option-value='value'
        :options='headingTags'
        placeholder='Chọn H tag'/>
    </div>

    <div class='col-6 field flex flex-column'>
      <label>Căn chỉnh</label>
      <Dropdown
        v-model='field.config.align'
        :options='alignOptions'
        placeholder='Chọn căn chỉnh'/>
    </div>

    <div class='col-6 field'>
      <label>Cỡ chữ</label>
      <InputText
        v-model='field.config.fontSize'
        placeholder='Ví dụ: 1.5rem, 20px'/>
    </div>

    <div class='col-6 field flex flex-column'>
      <label>Font weight</label>
      <Dropdown
        v-model='field.config.fontWeight'
        :options='fontWeights'
        placeholder='Chọn độ đậm'/>
    </div>

    <div class='col-12 field flex flex-column'>
      <label>Màu chữ</label>
      <div class='align-items-baseline flex gap-2'>
        <ColorPicker
          v-model='field.config.color'
          format='hex'/>
        <InputText
          v-model='field.config.color'
          placeholder='Mã màu hex'/>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import ColorPicker from 'primevue/colorpicker';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { type PropType } from 'vue';

import type { ElementConfig } from '@/apps/e-form/model/form-config';

const field = defineModel('field', {
  type: Object as PropType<ElementConfig>,
  default: {
    text: '',
    tag: 'h3',
    align: 'left',
    fontSize: '1.5rem',
    color: '#000000',
    fontWeight: 'normal',
  }
});

// onMounted(() => {
//   field.value = {
//     ...props.config,
//     ...field.value
//   };
// });

const headingTags = [
  {
    label: 'H1',
    value: 'h1'
  },
  {
    label: 'H2',
    value: 'h2'
  },
  {
    label: 'H3',
    value: 'h3'
  },
  {
    label: 'H4',
    value: 'h4'
  },
  {
    label: 'H5',
    value: 'h5'
  },
  {
    label: 'H6',
    value: 'h6'
  },
];

const alignOptions = ['left', 'center', 'right'];

const fontWeights = [
  'normal',
  'bold',
  'lighter',
  'bolder',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
];

</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
