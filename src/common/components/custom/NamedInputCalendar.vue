<template>
  <div class='flex gap-1'>
    <Calendar
      v-bind='$attrs'
      ref='cal'
      :date-format='dateFormat'
      :min-date='computedMinDate'
      :pt="{
        root: {
          style: {
            'display': $props.isHidden ? 'none' : 'flex'
          }
        }
      }"
      :view='view'/>
    <slot name='additional'></slot>
  </div>
</template>

<script>
import moment from 'moment';
import { computed } from 'vue';

export default {
  name: 'NamedInputCalendar',

  props: {
    name: {
      type: String,
      default: '',
      required: true
    },

    inputFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    },

    isHidden: {
      type: Boolean,
      default: false
    },
    
    dateFormat: {
      type: String,
      default: 'dd/mm/yy'
    },

    view: {
      type: String,
      default: 'date'
    },

    minDate: {
      type: String,
      default: ''
    }
  },

  setup(props) {
    const computedMinDate = computed(() => {
      return props.minDate ? new Date(props.minDate) : null;
    });
    return { computedMinDate };
  },
 
  mounted() {

    // if (!this.$refs.cal.$el.querySelector('input')) {
    let input = document.createElement('input');
    input.type = 'hidden';
    input.name = this.name;
    input.classList.add('custom-calendar');
    this.$refs.cal.$el.append(input);
    // }

    if (this.$refs.cal.$props.modelValue) {
      input.value = this.formatDate(this.$refs.cal.$props.modelValue);
    }
  },

  updated() {
    this.$refs.cal.$el.querySelector('.custom-calendar').value = this.formatDate(this.$refs.cal.$props.modelValue);
  },

  methods: {
    formatDate(date) {
      if (date) {
        const m = moment(date);
        return m.format(this.inputFormat);
      }
      return '';
    }
  }

};
</script>

<style scoped>

</style>