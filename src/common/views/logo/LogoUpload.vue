<template>
  <div class='align-items-center flex flex-column justify-content-center'>
    <label class='avatar-upload flex'>
      <img
        v-if='splitUrl !== "null" && splitUrl !== ""'
        alt='avatar'
        :src='previewImage'/>
      <img
        v-else
        alt='avatar'
        src='/images/avatar/ImageDefault.jpg'/>
      <div
        v-tooltip.top="t('common.chooseImage')"
        class='avatar-border border-3'></div>
      <i
        v-if='splitUrl && !isDetail'
        v-tooltip.top="t('common.removeImage')"
        class='pi pi-times-circle remove-avatar'
        @click='removeImage'/>
      <input
        v-if='!isDetail'
        id='image'
        ref='avatarInput'
        accept='image/*'
        :name='nameImage'
        type='file'
        @change='onFileChange'>
    </label>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

import { toastWarn } from '@/common/helpers/custom-toast-service';

export default {
  name: 'LogoUpload',

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

    isDetail: {
      type: Boolean,
      default: false
    }
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
      this.previewImage = null;
      this.$refs.avatarInput.value = '';
      this.$emit('isChange', true);
      if (this.props.name === 'background') {
        this.props.isBackgroundChange = true;
      }

      if (this.props.name === 'logo') {
        this.props.isLogoChange = true;
      }

      if (this.props.name === 'avatar') {
        this.props.isAvatarChange = true;
      }

      if (this.props.name === 'mainSign') {
        this.props.isMainSignChange = true;
      }
      if (this.props.name === 'flashingSignature') {
        this.props.isFlashingSignatureChange = true;
      }
    }
  }
};
</script>

<style scoped>
.avatar-upload {
  position: relative;
  height: 16rem;
  width: 16rem;
  cursor: pointer;
}

.avatar-upload .default-avatar {
  font-size: 10rem;
  position: absolute;
  top: 3rem;
  left: 3rem;
}

.avatar-upload .remove-avatar:hover {
  opacity: 100%;
  transition: 0.5s;
}

.avatar-upload .remove-avatar {
  position: absolute;
  font-size: 2rem;
  right: 1rem;
  opacity: 20%;
}

.avatar-upload.avatar-circle .remove-avatar {
  top: 2.5rem;
  right: 2.5rem;
}

.avatar-upload .avatar-border {
  width: 16rem;
  height: 16rem;
  position: absolute;
  top: 0;
  left: 0;
  color: #EAEDF2;
}

.avatar-upload img {
  width: 16rem;
  height: 16rem;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
}

.avatar-upload input {
  display: none;
}
</style>