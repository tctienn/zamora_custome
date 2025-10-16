export default {
  mounted(el: HTMLElement) {
    const input = el.querySelector('input') as HTMLInputElement | null;
    if (input) {
      input.addEventListener('keydown', (event) => {
        const key = event.key;
        const isValidKey =
          /[\p{L}\p{N}_-·]/u.test(key)
          || key === 'Backspace'
          || key === 'ArrowLeft'
          || key === 'ArrowRight'
          || key === 'Delete';

        if (!isValidKey) {
          event.preventDefault();
        }
      });

      input.addEventListener('input', () => {
        const upperCasedValue = input.value.toUpperCase();

        if (input.value !== upperCasedValue) {
          input.value = upperCasedValue;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }
  },
};
