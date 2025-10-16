<template>
  <div class='field group relative'>
    <label>{{ label }}</label>

    <!-- Nếu không có ảnh -->
    <div
      v-if='!img'
      class='align-items-center border-round cursor-pointer flex font-bold h-8rem justify-content-center surface-200 w-full'
      @click='imgRef?.click()'>
      {{ $t('common.upload') }}
    </div>

    <!-- Nếu có ảnh -->
    <div
      v-else
      class='relative w-full'>
      <img
        alt='Image'
        class='cursor-pointer img max-h-64 object-contain w-full'
        :src='img as string'
        @click='imgRef?.click()' />

      <!-- Nút xoá xuất hiện khi hover -->
      <Button
        aria-label='Cancel'
        class='absolute opacity-0 remove-btn right-1 top-1 transition-opacity z-10'
        icon='pi pi-times'
        severity='danger'
        size='small'
        @click.stop='removeImage' />
    </div>

    <input
      hidden
      :name='isImgChanged'
      :value='isImgChange' />
    <input
      ref='imgRef'
      accept='image/*'
      hidden
      :name='name'
      type='file'
      @change='changePassportPhotoImage' />

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

import { generateAvatarUrl } from '@/common/helpers/file-utils';

defineProps({
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  isImgChanged: {
    type: String,
    default: ''
  },
});

const imgRef = ref<HTMLInputElement>();
const isImgChange = ref(false);

const model = defineModel({ type: String });
const img = ref<string | ArrayBuffer | null | undefined>(model.value || '');

watch(() => model.value, (value) => {
  img.value = generateAvatarUrl(value);
  isImgChange.value = false;
}, { immediate: true });

function changePassportPhotoImage(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    isImgChange.value = true;
    createImage(file);
  }
}

function createImage(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    img.value = e.target?.result;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  img.value = null;
  isImgChange.value = true;
  if (imgRef.value) {
    imgRef.value.value = '';
  }
}
</script>

<style scoped>
.img {
  max-height: 120px;
  object-fit: contain;
}
.group {
  position: relative;
  .remove-btn {
    position: absolute;
    right: 0;
  }
}
</style>