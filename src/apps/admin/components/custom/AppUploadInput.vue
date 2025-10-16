<template>
  <div class='align-items-center border-1 border-gray-200 border-round flex justify-content-around w-full'>
    <Button
      class='bg-transparent border-none outline-none text-black-alpha-80 w-full'
      :disabled='disableButton'
      @click='upload'>
      <div class='w-full'>
        <span v-if='!files.length && !path'>{{ field }} </span>
        <div
          v-for='file of files'
          :key='file.name'>
          <span>{{ file.name }}</span>
        </div>
        <div v-if='!files.length && path'>
          <a
            class='link'
            download
            :href='url+path'>{{ path.split('/')[path.split('/').length - 1] }}</a>
        </div>
      </div>
    </Button>
    <div>
      <Button
        class='active:outline-none bg-transparent border-none text-red-500'
        :disabled='disableButton'
        @click='removeFiles'>
        <i class='pi pi-times'></i>
      </Button>
    </div>
  </div>
  <input
    ref='fileUpload'
    :multiple='multiple'
    :name='name'
    type='file'
    v-bind='$attrs'
    @change='onUpload'>

</template>

<script>
import { GATEWAY_URL } from '@/common/api/configService';

export default {
  name: 'AppUploadInput',

  props: {
    name: {
      type: String,
      default: '',
      required: true
    },

    multiple: {
      type: Boolean,
      default: false
    },

    path: {
      type: String,
      default: '',
    },

    disableButton: {
      type: Boolean,
      default: false
    },

    field: {
      type: String,
      default: '',
      required: false
    },
  },

  emits: ['removePath'],

  data() {
    return {
      files: [],
      url: GATEWAY_URL + '/files/download/',
      hideLink: false
    };
  },

  methods: {
    upload() {
      this.$refs.fileUpload.click();
    },

    onUpload() {
      this.files = this.$refs.fileUpload.files;
      this.hideLink = true;
    },

    removeFiles() {
      this.files = [];
      this.$emit('removePath');
    }
  }

};
</script>

<style scoped>
input[type=file] {
  display: none;
}

</style>
