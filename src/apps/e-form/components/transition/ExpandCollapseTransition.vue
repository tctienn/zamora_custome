<template>
  <transition
    @enter='enter'
    @leave='leave'>
    <div
      v-show='show'
      class='overflow-hidden'>
      <slot/>
    </div>
  </transition>
</template>

<script setup>

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  duration: {
    type: Number,
    default: 300,
  },
  withOpacity: {
    type: Boolean,
    default: false
  },
});

function enter(el) {
  el.style.height = '0';
  if (props.withOpacity) {
    el.style.opacity = '0';
  }

  void el.offsetHeight;

  el.style.transition = `height ${ props.duration }ms ease${ props.withOpacity ? `, opacity ${ props.duration }ms ease` : '' }`;
  el.style.height = el.scrollHeight + 'px';
  if (props.withOpacity) {
    el.style.opacity = '1';
  }
}

function leave(el) {
  el.style.height = el.scrollHeight + 'px';
  if (props.withOpacity) {
    el.style.opacity = '1';
  }

  void el.offsetHeight;

  el.style.transition = `height ${ props.duration }ms ease${ props.withOpacity ? `, opacity ${ props.duration }ms ease` : '' }`;
  el.style.height = '0';
  if (props.withOpacity) {
    el.style.opacity = '0';
  }
}
</script>

<style scoped>
</style>
