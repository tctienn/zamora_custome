import type { Component } from 'vue';

import InputAreaElement from '@/apps/e-form/components/area/InputAreaElement.vue';
import DatePickerElement from '@/apps/e-form/components/date/DatePickerElement.vue';
import HeadingElement from '@/apps/e-form/components/heading/HeadingElement.vue';
import InputNumberElement from '@/apps/e-form/components/number/InputNumberElement.vue';
import InputRadioButton from '@/apps/e-form/components/radio/InputRadioButton.vue';
import InputSelectElement from '@/apps/e-form/components/select/InputSelectElement.vue';
import InputSwitchElement from '@/apps/e-form/components/switch/InputSwitchElement.vue';
import InputTextElement from '@/apps/e-form/components/text/InputTextElement.vue';

export enum ElementMode {
  CONFIG = 'CONFIG',
  EDIT = 'EDIT',
  VIEW = 'VIEW',
  PREVIEW = 'PREVIEW',
  ADVANCE = 'ADVANCE',
}

export enum ElementType {
  TEXT = 'TEXT',
  AREA = 'AREA',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT',
  CHECKBOX = 'CHECKBOX',
  SWITCH = 'SWITCH',
  RADIO = 'RADIO',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  TITLE = 'TITLE',
}

export const components: Partial<Record<ElementType, Component>> = {
  [ElementType.TEXT]: InputTextElement,
  [ElementType.AREA]: InputAreaElement,
  [ElementType.NUMBER]: InputNumberElement,
  [ElementType.SWITCH]: InputSwitchElement,
  [ElementType.SELECT]: InputSelectElement,
  [ElementType.RADIO]: InputRadioButton,
  [ElementType.TITLE]: HeadingElement,
  [ElementType.DATE]: DatePickerElement,
};
