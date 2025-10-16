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
      <div class='field'>
        <label class='font-semibold'>Tên giấy tờ <span class='text-red-500'>*</span></label>
        {{attachment.id}}
        <InputText
          v-if='attachment.id'
          v-model='attachment.fileName'
          class='w-full'/>
        <InputText
          v-else
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
              v-if='attachment.id'
              class='pr-10 w-full'
              placeholder='Chọn tệp đính kèm'
              readonly
              :value="attachment.name || ''"/>
            <InputText
              v-else
              class='pr-10 w-full'
              placeholder='Chọn tệp đính kèm'
              readonly
              :value="attachment.file?.name || ''"/>
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

import type { EmployeeAttachment } from '@/apps/hrm/model/attachment';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(['update:file', 'close']);
const visible = defineModel<boolean>({ default: false });
const error = ref({
  fileName: '',
  file: ''
});
const attachment = ref({} as EmployeeAttachment);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  console.log(file, attachment.value);
  if (file) {
    attachment.value.file = file;
  }
};

watch(() => props.data, (newData) => {
  if (newData && !newData.id) {
    attachment.value.name = newData.name || '';
    attachment.value.file = newData.file || null;
  } else if(newData.id) {
    attachment.value = newData;
  }
}, { immediate: true });

const submit = () => {
  // if (!attachment.value.name) {
  //   error.value.fileName = 'Vui lòng nhập tên giấy tờ';
  // } else {
  //   error.value.fileName = '';
  // }
  if (!attachment.value.file) {
    error.value.file = 'Vui lòng chọn tệp đính kèm';
  } else {
    error.value.file = '';
  }

  if (error.value.fileName === '' && error.value.file === '') {
    emit('update:file', {
      name: attachment.value.name,
      file: attachment.value.file
    });
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
