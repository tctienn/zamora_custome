const trimEvent = function (el: HTMLInputElement) {
  if (el) {
    const start = el.selectionStart;
    el.value = el.value.trim();
    el.setSelectionRange(start, start);
    el.dispatchEvent(new Event('input'));
  }
};

export default {

  mounted(el: HTMLInputElement) {
    el.addEventListener('blur', () => trimEvent(el)
    );
  },

  unmounted(el: HTMLInputElement) {
    el.removeEventListener('blur', () => trimEvent(el));
  },
};
