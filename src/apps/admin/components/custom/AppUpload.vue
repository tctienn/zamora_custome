<template>

  <Button
    class='w-8rem'
    :disabled='disableButton'
    :label='$t("common.upload")'
    @click='upload'/>
  <input
    v-bind='$attrs'
    ref='fileUpload'
    :multiple='multiple'
    :name='name'
    type='file'
    @change='onUpload'>

  <div v-if='showNameFile'>
    <div
      v-for='file of files'
      :key='file.name'>
      {{ file.name }}
    </div>
  </div>

  <div>
    <a
      v-if='path'
      class='link'
      download
      :hidden='hideLink'
      :href='url+path'>{{ path.split('/')[path.split('/').length - 1] }}</a>
  </div>

</template>

<script>

import { GATEWAY_URL } from '@/common/api/configService';

export default {
  name: 'AppUpload',

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
      required: true
    },

    showNameFile: {
      type: Boolean,
      default: false
    },

    disableButton: {
      type: Boolean,
      default: false
    }
  },

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
  }

};
</script>

<style scoped>
input[type=file] {
  display: none;
}

</style>