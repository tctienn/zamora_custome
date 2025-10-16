<template>
  <VoiceInput
    v-if='speaking'
    class='inline-flex'
    @stop='recognition.stop()'/>
  <div
    v-else
    class='search-box surface-ground'>
    <span class='search-icon'>
      <i class='pi pi-search'></i>
    </span>
    <input
      v-model='model'
      class='search-input surface-ground'
      :placeholder='t("common.search")'
      type='text'
      @keyup.enter='emits("search", model)'/>
    <span
      class='clear-icon'
      @click='model=""'>
      <i class='pi pi-times'></i>
    </span>

    <span
      class='microphone-icon'
      @click='speechToText'>
      <AppIcon
        name='mic'
        size='1.5'
        text/>
    </span>
  </div>

  <div class='text-red-500'>{{ error }}</div>
</template>

<script lang='ts' setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import VoiceInput from '@/apps/search/views/VoiceInput.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const emits = defineEmits<{
  (e: 'search', value: string): void
}>();
const model = defineModel({
  type: String,
  default: ''
});
const { t } = useI18n();

const speaking = ref(false);
const error = ref('');
const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any;

function speechToText() {

  if (!SpeechRecognition) {
    error.value = 'Trình duyệt của bạn không hỗ trợ Web Speech API.';
    setTimeout(() => {
      error.value = '';
    }, 3000);
  } else {
    recognition = new SpeechRecognition();

    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      model.value = event.results[0][0].transcript;
      speaking.value = false;
    };

    recognition.onerror = (event: any) => {
      speaking.value = false;
    };

    recognition.start();
    speaking.value = true;
  }
}

</script>

<style scoped>
.search-box {
  display: inline-flex;
  align-items: center;
  border: 1px solid #ccc;
  padding: 0 10px;
  height: 40px;
  border-radius: 25px;
  width: 40rem;
}

.search-box .search-icon,
.search-box .clear-icon,
.search-box .keyboard-icon,
.search-box .microphone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  margin-left: 8px;
}

.search-box .search-icon {
  margin-left: 0;
}

.search-box .search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  margin-left: 8px;
}

.search-box .search-input::placeholder {
}

.search-box .clear-icon:hover,
.search-box .keyboard-icon:hover,
.search-box .microphone-icon:hover {
}
</style>