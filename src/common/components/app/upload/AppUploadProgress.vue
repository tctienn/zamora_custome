<template>
  <Dialog
    :breakpoints="{ '960px': '50vw', '640px': '75vw' }"
    :closable='false'
    modal
    :style="{ width: '25vw' }"
    :visible='visible && displayType==="dialog"'>
    <div
      v-if='processing'
      class='align-items-center flex flex-row gap-3 justify-content-start w-full'>
      <ProgressSpinner
        class='h-2rem m-0 p-0 w-2rem'
        stroke-width='8'/>
      {{ message }}
    </div>
    <ProgressBar
      v-else
      :value='correctPercent'/>
    <template #header>
      <div class='align-items-center content-header flex flex-row justify-content-between w-full'>
        <div class='p-dialog-title'>
          {{ t('common.uploading') }}
        </div>
        <AppIcon
          class='cursor-pointer'
          name='remove'
          size='1.5'
          @click='displayType="minimize"'/>
      </div>
    </template>
  </Dialog>
  <Dialog
    class='no-footer no-header'
    :closable='false'
    :draggable='false'
    position='bottomright'
    :visible='visible && displayType==="minimize"'>
    <div
      class='cursor-pointer'
      @click='displayType="dialog"'>
      {{ message }}
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  percent: {
    type: Number,
    required: true,
    validator: (n: number) => 0 <= n && n <= 100 || n === -1
  }
});
const { t } = useI18n();
const visible = ref(false);
const displayType = ref<'dialog' | 'minimize'>('dialog');
const correctPercent = computed(() => props.percent > 0 ? Math.round(props.percent * 100) / 100 : 100);
const processing = computed(() => props.percent >= 100 || props.percent === -1);
const message = computed(() => processing.value ? `${t('common.processing')} ...` : `${t('common.uploading')}: ${correctPercent.value}%`);

function hide() {
  visible.value = false;
  displayType.value = 'dialog';
}

watch(props, (value) => {
  const { percent } = value;
  if (percent > 0 && percent < 100) {
    visible.value = true;
  }
  if (percent === -1) {
    setTimeout(hide, 500);
  }
});
</script>

<script lang='ts'>
export default { name: 'AppUploadProgress' };
</script>

<style lang='scss'>
.no-header {
  .p-dialog-header {
    display: none
  }

  .p-dialog-content {
    padding: 1rem;
    border-radius: .25rem .25rem .25rem .25rem;
  }
}

.no-footer {
  .p-dialog-footer {
    display: none;
  }
}
</style>