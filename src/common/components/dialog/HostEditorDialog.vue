<template>
  <Dialog
    v-model:visible='visible'
    :header='header || t("common.edit")'
    maximizable
    modal
    :pt='{
      header: {
        class: "py-2"
      },
      content: {
        class: "p-0 frame-wrapper relative",
      },
    }'
    style='width: 98%'>
    <form
      ref='formRef'
      :action='editorUrl'
      method='post'
      target='office_frame'>
      <input
        name='access_token'
        type='hidden'
        :value='authentication'/>
    </form>
  </Dialog>

</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserStore } from '@/common/store/user';

defineProps({
  editorUrl: {
    type: String,
    required: true,
  },
  header: {
    type: String,
    default: '',
  },
});
const { t } = useI18n();
const visible = defineModel('visible', {
  type: Boolean,
  default: false,
});
const { authentication } = storeToRefs(useUserStore());
const formRef = ref<HTMLFormElement | null>(null);
watch(visible, (value) => {
  if (value) {
    nextTick(createEditor);
  } else {
    const wrapper = document.querySelector('.frame-wrapper');
    if (wrapper) {
      wrapper.querySelector('.office-frame')?.remove();
    }
  }
});

function createEditor() {
  if (formRef.value) {
    const officeFrame = document.createElement('iframe');
    officeFrame.name = 'office_frame';
    officeFrame.id = 'office_frame';
    officeFrame.className = 'office-frame';
    officeFrame.classList.add('w-full', 'h-full', 'border-none');
    officeFrame.style.minHeight = '82vh';

    officeFrame.title = 'Office Frame';
    officeFrame.setAttribute('allowfullscreen', 'true');

    officeFrame.setAttribute('sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox allow-downloads allow-modals');
    officeFrame.setAttribute('allow', 'autoplay camera microphone display-capture');

    document.querySelector('.frame-wrapper')?.appendChild(officeFrame);

    formRef.value.submit();
  }
}

</script>

<style scoped>
</style>