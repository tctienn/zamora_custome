import type { DirectiveBinding } from 'vue';

interface HTMLElementWithInterval extends HTMLElement {
  scrollInterval?: number | null;
}

const textScroll = {
  mounted(el: HTMLElementWithInterval, binding: DirectiveBinding) {
    el.style.maxWidth = binding.value?.maxWidth || '200px';
    el.classList.add('overflow-hidden');
    let scrollInterval: number;

    const startScroll = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }

      let currentScroll = el.scrollLeft;
      scrollInterval = window.setInterval(() => {
        if (currentScroll < el.scrollWidth - el.clientWidth) {
          currentScroll += 1;
          el.scrollLeft = currentScroll;
        } else {
          clearInterval(scrollInterval);
        }
      }, 10);

      el.scrollInterval = scrollInterval;
    };

    const resetScroll = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }

      let currentScroll = el.scrollLeft;
      scrollInterval = window.setInterval(() => {
        if (currentScroll > 0) {
          currentScroll -= 1;
          el.scrollLeft = 0;
        } else {
          clearInterval(scrollInterval);
        }
      }, 10);

      el.scrollInterval = scrollInterval;
    };

    el.addEventListener('mouseover', startScroll);
    el.addEventListener('mouseleave', resetScroll);
  },
  unmounted(el: HTMLElementWithInterval) {
    if (el.scrollInterval) {
      clearInterval(el.scrollInterval);
    }
  },
};

export default textScroll;
