<template>
  <div
    class='star-rating'
    @mouseleave='resetHover'>
    <span
      v-for='star in stars'
      :key='star'
      class='star'
      @click='setRating(star)'
      @mouseover='setHover(star)'>
      <!-- Full Star -->
      <i
        class='pi'
        :class="star <= (hoverRating || modelValue) ? 'pi-star-fill' : 'pi-star'"
        :style='{fontSize:fontSize}'></i>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { toNumber, trimEnd } from 'lodash';
import { computed, defineProps, ref } from 'vue';

// Props
const props = defineProps({
  maxStars: {
    type: Number,
    default: 5, // Default number of stars
  },
  size: {
    type: String,
    default: '1.2'
  },
  viewOnly: {
    type: Boolean,
    default: false
  },
});

const modelValue = defineModel<number>({ default: 0 });

const fontSize = computed(() => {
  return !props.size.endsWith('rem') && toNumber(trimEnd(props.size, 'rem')) > 0 ? `${props.size}rem` : props.size;
});

// Reactive Variables
const hoverRating = ref(modelValue.value);

// Computed Stars
const stars = computed(() => props.maxStars);

// Methods
const setHover = (rating: number) => {
  if (props.viewOnly) {
    return;
  }
  hoverRating.value = rating;
};

const resetHover = () => {
  hoverRating.value = modelValue.value;
};

const setRating = (rating: number) => {
  if (props.viewOnly) {
    return;
  }
  modelValue.value = rating;
};
</script>

<style scoped>
.star-rating {
  display: flex;
  gap: 4px;
  cursor: pointer;
}

.star {
  color: #ffc107; /* Highlighted color */
  transition: color 0.2s ease;
}

</style>
