export default {
  mounted(el: HTMLElement) {
    const span = document.createElement('span');
    span.className = 'required-mark';
    const asterisk = document.createTextNode('*');
    span.appendChild(asterisk);
    el.appendChild(span);
  },
};
  