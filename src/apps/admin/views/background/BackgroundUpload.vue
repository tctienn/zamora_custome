<template>
  <div
    class='flex justify-content-center'>
    <label
      class='avatar-upload border-3 border-gray-300 flex justify-content-center'>
      <img
        v-if='splitUrl !== "null" && splitUrl !== ""'
        v-tooltip.top="t('common.chooseImage')"
        alt='avatar'
        :src='previewImage'/>
      <img
        v-else
        v-tooltip.top="t('common.chooseImage')"
        alt='avatar'
        src='/images/avatar/ImageDefault.jpg'/>
      <i
        v-if='splitUrl !== "null" && splitUrl !== ""'
        v-tooltip.top="t('common.removeImage')"
        class='pi pi-times-circle remove-avatar'
        @click='removeImage'/>
      <input
        id='image'
        ref='avatarInput'
        accept='image/*'
        :name='nameImage'
        type='file'
        @change='onFileChange'>
    </label>

    <!--    <div class='flex flex-row mt-2 w-full'>-->
    <!--      <Button-->
    <!--        v-tooltip.top="t('update')"-->
    <!--        class='flex-1 flex-basis-0 flex-grow-1 justify-content-center ml-5 mr-1 p-button-outlined w-auto'-->
    <!--        @click='$refs.avatarInput.click()'>-->
    <!--        {{ t('common.update') }}-->
    <!--      </Button>-->
    <!--      <Button-->
    <!--        v-tooltip.top="t('common.removeAvatar')"-->
    <!--        class='flex-1 flex-basis-0 flex-grow-1 justify-content-center ml-1 mr-5 p-button-outlined p-button-secondary w-auto'-->
    <!--        @click='removeImage'>-->
    <!--        {{ t('common.remove') }}-->
    <!--      </Button>-->
    <!--    </div>-->

  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

import { toastWarn } from '@/common/helpers/custom-toast-service';

export default {
  name: 'BackgroundUpload',

  props: {
    avatarUrl: {
      type: String,
      default: ''
    },

    nameImage: {
      type: String,
      default: ''
    },

    shape: {
      type: String,
      default: 'circle'
    },

    icon: {
      type: String,
      default: 'pi-user'
    },
  },

  emits: ['isChange'],

  setup() {
    const { t } = useI18n();
    return { t };
  },

  data() {
    return {
      previewImage: null,
      splitPreviewImage: ''
    };
  },

  computed: {
    splitUrl() {
      if (this.previewImage) {
        return this.previewImage.split('/')[this.previewImage.split('/').length - 1];
      } else {
        return '';
      }
    }
  },

  watch: {
    avatarUrl: function (newValue) {
      this.previewImage = newValue;
    }
  },

  created() {
    this.previewImage = this.avatarUrl;
  },

  mounted() {
    this.previewImage = this.avatarUrl;
  },

  methods: {
    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        return;
      }
      this.createImage(files[0]);
      this.$emit('isChange', true);
    },

    createImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target.result;
        const img = new Image();
        img.onload = () => {
          console.log('this.props?.nameImage', this.nameImage);
          if ((img.width < 1440 || img.height < 810) && this.nameImage === 'background') {
            toastWarn({ message: 'Bạn phải chọn ảnh kích thước có chiều rộng lớn hơn 1440 và chiều dài lớn hơn 810' });
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    },

    removeImage(e) {
      e.preventDefault();
      this.$emit('isChange', true);
      this.previewImage = null;
      this.$refs.avatarInput.value = '';
      if (this.props.name === 'background') {
        this.props.isBackgroundChange = true;
      }

      if (this.props.name === 'logo') {
        this.props.isLogoChange = true;
      }
    }
  }
};
</script>

<style>
.avatar-upload {
  position: relative;
  cursor: pointer;
}

.avatar-upload .remove-avatar:hover {
  opacity: 100%;
  transition: 0.5s;
}

.avatar-upload .remove-avatar {
  position: absolute;
  font-size: 2rem;
  top: 1rem;
  right: 1rem;
  opacity: 20%;
}

.avatar-upload img {
  height: 16rem;
  object-fit: cover;
}

.avatar-upload input {
  display: none;
}
</style>