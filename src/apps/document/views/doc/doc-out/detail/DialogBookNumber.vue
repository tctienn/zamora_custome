<template>
  <Dialog
    v-if='bookNum'
    v-model:visible='visibleDialog'
    :header="'Danh sách đăng ký giữ số'"
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 50vw'
    @hide="emits('hide-dialog')">
    <div class='flex flex-column gap-3'>
      <div class='flex gap-2'>
        <label>Số văn bản: </label>
        <div class='font-semibold'>
          {{ bookNum.bookInfo?.bookName }}
        </div>
      </div>

      <div class='flex gap-2'>
        <div class='col-1 p-0'>
          <label>Số đã giữ: </label>
        </div>
        <div class='font-semibold gap-2 grid grid-nogutter w-full'>
          <div
            v-for='item of bookNum.bookNumbers'
            :key='item'
            class='col-3 flex gap-1'>
            <RadioButton
              v-model='chooseNumber'
              aria-checked='true'
              input-id='radiobutton1'
              name='number'
              :value='item'/>
            <div class='align-content-center'>{{ item }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='saveNumber'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BookNumReserve } from '@/apps/document/model/bookNumReserve';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  bookId: {
    type: String,
    default: null
  },
  requestUserId: {
    type: String,
    default: null
  },
  bookNumReserve: {
    type: Object as PropType<BookNumReserve>,
    default: null
  }
});
const emits = defineEmits(['hide-dialog', 'save-number']);
const { t } = useI18n();
const bookNum = ref<BookNumReserve>(props.bookNumReserve);
const chooseNumber = ref();
const visibleDialog = ref(props.visible);
const numbReserves = ref<string[]>();

function saveNumber() {
  emits('save-number', chooseNumber.value);
  emits('hide-dialog');
}

</script>

<script lang="ts">
export default { name: 'DialogBookNumber' };
</script>

<style scoped>

</style>