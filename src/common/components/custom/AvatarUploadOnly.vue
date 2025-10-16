<template>
  <div class='flex justify-content-center'>
    <label
      v-tooltip='t(tooltip)'
      class='align-items-center avatar-upload flex justify-content-center'
      :class='{"avatar-circle": shape === "circle"}'>
      <img
        v-if='previewImage'
        alt='avatar'
        :src='previewImage'
        @load='onImageLoad'/>
      <AppIcon
        v-else
        alt='avatar'
        :name='emptyImageIcon'
        :size='`${props.avatarUploadSize.emptyIconSize}`'
        style='opacity:20%'/>
      <AppIcon
        v-if='previewImage&&!viewOnly&&showRemoveButton'
        v-tooltip.top='t("common.removeAvatar")'
        class='remove-avatar text-color-secondary'
        name='cancel'
        @click='removeImage'/>

      <input
        v-if='!viewOnly'
        ref='avatarInput'
        accept='image/*'
        :name='inputName'
        type='file'
        @change='onFileChange'>
      <input
        :name='generateCheckNameByInputName?`is${upperFirst(inputName)}Change`:"isAvatarChange"'
        type='hidden'
        :value='isAvatarChange'>
    </label>
  </div>

</template>

<script setup lang='ts'>
import { upperFirst } from 'lodash';
import { computed, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '@/common/components/app/AppIcon.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

const props = defineProps({
  tooltip: {
    type: String,
    default: 'common.clickToUpdateAvatar'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  shape: {
    type: String as PropType<'circle' | 'rectangle'>,
    default: 'circle'
  },
  emptyImageIcon: {
    type: String,
    default: 'photo_camera'
  },
  inputName: {
    type: String,
    default: 'avatar'
  },
  generateCheckNameByInputName: {
    type: Boolean,
    default: false
  },
  avatarUploadSize: {
    type: Object as PropType<AvatarUploadSize>,
    default: () => ({
      width: 16.5,
      height: 16.5,
      emptyIconSize: 12,
      border: 0.25
    })
  },
  preserveAspectRatio: {
    type: Boolean,
    default: false
  },
  viewOnly: {
    type: Boolean,
    default: false
  },
  showRemoveButton: {
    type: Boolean,
    default: true
  }
});
const { t } = useI18n();
const computedSize = computed(() => {
  return {
    width: props.avatarUploadSize.width + 'rem',
    height: (props.preserveAspectRatio && naturalWidth ? naturalHeight.value * props.avatarUploadSize.width / naturalWidth.value
      : props.avatarUploadSize.height) + 'rem',
    widthImg: props.avatarUploadSize.width - 0.5 + 'rem',
    heightImg: (props.preserveAspectRatio && naturalWidth ? naturalHeight.value * props.avatarUploadSize.width / naturalWidth.value
      : props.avatarUploadSize.height) - 0.5 + 'rem',
  };
});

const previewImage = ref<string>();
const isAvatarChange = ref(false);
const avatarInput = ref();
const naturalWidth = ref<number>(0);
const naturalHeight = ref<number>(0);

onMounted(() => {
  previewImage.value = generateAvatarUrl(props.avatarUrl);
});

function onFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files?.length) {
    return;
  }
  createImage(files[0]);
  isAvatarChange.value = true;
}

function createImage(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      previewImage.value = e.target?.result?.toString();
    }
  };
  reader.readAsDataURL(file);
}

function onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement;
  naturalWidth.value = img.naturalWidth;
  naturalHeight.value = img.naturalHeight;
}

function upload() {
  avatarInput.value.click();
}

function removeImage(e: Event) {
  e.preventDefault();
  previewImage.value = '';
  avatarInput.value.value = '';
  isAvatarChange.value = true;
}

defineExpose({
  upload,
  removeImage
});

watch(props, (value) => {
  const { avatarUrl } = value;
  previewImage.value = generateAvatarUrl(avatarUrl);
});
</script>

<script lang='ts'>
interface AvatarUploadSize {
  width: number;
  height: number;
  emptyIconSize: number;
  border?: number;
}

export default { name: 'AvatarUploadOnly' };
</script>

<style scoped lang='scss'>
.avatar-upload {
  position: relative;
  width: v-bind('computedSize.width');
  height: v-bind('computedSize.height');
  cursor: pointer;

  img {
    width: v-bind('computedSize.widthImg');
    height: v-bind('computedSize.heightImg');
    object-fit: cover;
  }

  .remove-avatar {
    position: absolute;
    font-size: 2rem;
    top: 1rem;
    right: 1rem;
  }

  &.avatar-circle {
    border-radius: 50%;

    img {
      border-radius: 50%;
    }

    .remove-avatar {
      top: 2.5rem;
      right: 2.5rem;
    }
  }

  input {
    display: none;
  }
}

</style>
