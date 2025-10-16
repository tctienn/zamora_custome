import type { DirectiveBinding } from 'vue';

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const value = binding.value as { disabled: boolean, exceptSelectors: string[] };

    function disableTags() {
      const tags = ['input', 'button', 'textarea', 'select', 'div', 'span'];
      tags.forEach(tagName => {
        const nodes = el.getElementsByTagName(tagName) as HTMLCollectionOf<HTMLElement>;
        if (nodes && nodes.length) {
          for (let i = 0; i < nodes.length; i++) {
            nodes[i].setAttribute('disabled', 'true');
            nodes[i].setAttribute('tabIndex', '-1');
            nodes[i].style.pointerEvents = 'none';
          }
        }
      });
    }

    function removeDisable(exceptSelectors: string[]) {
      exceptSelectors.forEach((selector: string) => {
        const exceptChildren = el.querySelectorAll(selector) as NodeListOf<HTMLElement>;
        if (exceptChildren && exceptChildren.length) {
          for (let i = 0; i < exceptChildren.length; i++) {
            exceptChildren[i].removeAttribute('disabled');
            exceptChildren[i].removeAttribute('tabIndex');
            exceptChildren[i].style.pointerEvents = 'auto';
          }
        }
      });
    }

    if (value === undefined) {
      disableTags();
    } else {
      const { disabled, exceptSelectors } = value;
      if (disabled === undefined || disabled) {
        disableTags();
        if (exceptSelectors) {
          removeDisable(exceptSelectors);
        }
      }
    }

  }
};
  