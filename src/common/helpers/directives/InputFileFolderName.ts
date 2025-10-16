import { trimStart } from 'lodash';

import { FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS_REGEX } from '@/common/constants';

export default {
  updated(el: HTMLInputElement) {
    const start = el.selectionStart || 0;
    const value = el.value;
    el.value = trimStart(el.value.replace(FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS_REGEX, ''), '.');
    const newStart = start > 0 ? start - 1 : start;
    el.setSelectionRange(start, el.value === value ? start : newStart);
    el.dispatchEvent(new Event('input'));
  }
};
