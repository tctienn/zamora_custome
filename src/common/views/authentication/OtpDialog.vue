<template>
  <Dialog
    v-model:visible='showOtpDialog'
    class='text-center'
    closable
    modal
    :show-header='false'
    @hide='resetOtp'>
    <div
      class='flex flex-row otp'
      @click='clickDialog'>
      <input
        v-for='(item, index) in otp'
        :key='index'
        :ref='el => otpCode[index] = el'
        v-model='otp[index]'
        :aria-valuetext='item'
        :autofocus='index === 0'
        class='border-bottom border-none border-surface-color font-bold h-4rem input-number m-2 outline-none text-5xl text-center w-4rem'
        :class='{"pointer-events-none": index > 0 && isEmpty(otp[index - 1])}'
        maxlength='1'
        style='caret-color: transparent;'
        @blur='onBlur'
        @focus='onFocus'
        @input='handleOtpInput'
        @keydown='onKeyDown'
        @paste='() => {}'
        @update:model-value='value => onChange(value, index)'/>
    </div>
  </Dialog>
</template>

<script setup>
import { fill, findIndex, includes, isEmpty, join, toNumber } from 'lodash';
import { reactive } from 'vue';

const props = defineProps({
  otpLength: {
    type: Number,
    default: 6
  }
});

const emits = defineEmits(['submit']);

const showOtpDialog = defineModel('showOtpDialog', {
  type: Boolean,
  default: false
});

const otp = reactive(fill(Array(props.otpLength), null));
const otpCode = reactive(fill(Array(props.otpLength), null));

function onChange (value, index) {
  otp[index] = value;

  const otpCode = join(otp, '');
  if (otpCode.length === props.otpLength) {
    emits('submit', otpCode);
    resetOtp();
  }
}

function handleOtpInput (e) {
  if (e.data && e.target.nextElementSibling) {
    e.target.nextElementSibling.focus();
  } else if (e.data == null && e.target.previousElementSibling) {
    e.target.previousElementSibling.focus();
  }
}

function onFocus (e) {
  e.target.select();
  e.target.classList.add('border-primary-color');
  e.target.classList.add('caret-border');
  e.target.classList.remove('border-surface-color');
}

function onBlur (e) {
  e.target.classList.remove('caret-border');
  if (toNumber(e.target.value)) {
    e.target.classList.add('border-primary-color');
    e.target.classList.remove('border-surface-color');
  } else {
    e.target.classList.remove('border-primary-color');
    e.target.classList.add('border-surface-color');
  }
}

function onKeyDown (e) {
  const keysAllow = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const keyCodesAllow = [8, 9];
  const {
    key,
    keyCode
  } = e;

  if (!includes(keysAllow, key) && !includes(keyCodesAllow, keyCode)) {
    e.preventDefault();
  }

  if (keyCode === 8 && isEmpty(e.target.value) && e.target.previousElementSibling) {
    e.target.previousElementSibling.focus();
    e.preventDefault();
  }
}

function resetOtp () {
  fill(otp, null);
  otpCode.forEach((e, i) => {
    if (i === 0) {
      e?.focus();
    } else {
      e?.classList.remove('border-primary-color');
      e?.classList.add('border-surface-color');
    }
  });
}

function clickDialog () {
  const index = findIndex(otp, function (o) {
    return isEmpty(o);
  });
  if (index >= 0) {
    otpCode[index].focus();
  }
}
</script>

<script>
export default { name: 'OtpDialog' };
</script>

<style scoped>
input::-moz-selection { /* Code for Firefox */
  background: transparent;
}

input::selection {
  background: transparent;
}

.border-bottom {
  border-bottom-width: 3px !important;
  border-bottom-style: solid;
}

.border-surface-color {
  border-color: var(--surface-border)
}

.border-primary-color {
  border-color: var(--primary-color)
}

.caret-border {
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    border-color: var(--surface-border);
  }
}
</style>