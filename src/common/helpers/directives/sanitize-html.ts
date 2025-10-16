import DOMPurify from 'dompurify';
import type { DirectiveBinding } from 'vue';

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    el.innerHTML = DOMPurify.sanitize(binding.value);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    el.innerHTML = DOMPurify.sanitize(binding.value);
  }
};