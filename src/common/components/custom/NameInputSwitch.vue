<template>
  <InputSwitch
    v-bind='$attrs'
    ref='sw'/>
</template>

<script>
export default {
  name: 'NameInputSwitch',

  props: {
    name: {
      type: String,
      default: '',
      required: false
    }
  },

  mounted() {
    let input = document.createElement('input');
    input.name = this.name;
    input.value = this.$refs.sw.$props.modelValue;
    input.hidden = true;

    this.$el.append(input);
  },

  updated() {
    let element = this.$el.querySelector(`input[name="${this.name}"]`);

    if (element) {
      element.value = this.$refs.sw.$props.modelValue;
    }
  }
};
</script>

<style scoped>

</style>