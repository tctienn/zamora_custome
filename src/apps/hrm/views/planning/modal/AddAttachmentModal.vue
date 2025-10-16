<template>
  <Dialog
    v-model:visible='visible'
    class='overflow-hidden w-4'
    header='Thêm tệp đính kèm'
    modal
    :pt="{
      content: {
        class: 'w-full h-full'
      }
    }"
    @hide='handleClose'>
    <div class='flex flex-column gap-3'>
      <!-- Tên giấy tờ -->
      <div class='field'>
        <label class='font-semibold'>Trích yếu<span class='text-red-500'>*</span></label>
        <InputText
          v-model='attachment.name'
          class='w-full'/>
        <span
          v-show='error.fileName'
          class='text-red-300'>{{ error.fileName }}</span>
      </div>

      <!-- Upload tệp -->
      <div class='field'>
        <label class='font-semibold'>Tệp đính kèm <span class='text-red-500'>*</span></label>
        <div class='relative'>
          <IconField>
            <InputText
              class='pr-10 w-full'
              placeholder='Chọn tệp đính kèm'
              readonly
              :value='attachment.file?.name'/>
            <InputIcon class='absolute pi pi-upload pointer-events-none right-2 text-gray-500 top-2.5'/>
          </IconField>
          <span
            v-show='error.file'
            class='text-red-300'>{{ error.file }}</span>
          <!-- File input nằm chồng lên để click được -->
          <input
            accept='.pdf,.doc,.docx'
            class='absolute cursor-pointer h-3rem inset-0 opacity-0 top-0 w-30rem'
            type='file'
            @change='handleFileChange'/>
        </div>
      </div>

      <small class='text-gray-500'>Ghi chú: chỉ tải file có định dạng <strong>.PDF, DOC</strong></small>
    </div>

    <template #footer>
      <Button
        class='border-round-sm'
        icon='pi pi-times'
        label='Hủy'
        severity='danger'
        @click='handleClose'/>
      <Button
        class='border-round-sm'
        icon='pi pi-check'
        label='Đồng ý'
        @click='submit'/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(['update:file', 'close']);
const visible = defineModel<boolean>('visible', { default: false });
const error = ref({
  fileName: '',
  file: ''
});
const attachment = ref({
  name: '',
  file: null as File | null,
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    attachment.value.file = file;
  }
};

watch(() => props.data, (newData) => {
  if (newData) {
    attachment.value.name = newData.name || '';
    attachment.value.file = newData.file || null;
  }
}, { immediate: true });

const submit = () => {
  if (!attachment.value.name) {
    error.value.fileName = 'Vui lòng nhập tên giấy tờ';
  } else {
    error.value.fileName = '';
  }
  if (!attachment.value.file) {
    error.value.file = 'Vui lòng chọn tệp đính kèm';
  } else {
    error.value.file = '';
  }

  if (error.value.fileName === '' && error.value.file === '') {
    console.log('submit');
    emit('update:file', attachment.value);
  }
};
const handleClose = () => {
  emit('close');
  attachment.value = {
    name: '',
    file: null
  };
  error.value = {
    fileName: '',
    file: ''
  };
};
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
}
</style>
