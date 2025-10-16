import { ElementType } from '@/apps/e-form/components/element';
import type { ElementConfig } from '@/apps/e-form/model/form-config';

export const defaultConfigElements: Partial<Record<ElementType, ElementConfig>> = {
  [ElementType.TEXT]: {
    type: ElementType.TEXT,
    config: {
      label: 'Text',
      placeholder: 'Enter text',
    },
  },
  [ElementType.AREA]: {
    type: ElementType.AREA,
    config: {
      label: 'Area',
      placeholder: 'Enter text',
    },
  },
  [ElementType.NUMBER]: {
    type: ElementType.NUMBER,
    config: {
      label: 'Number',
      placeholder: 'Enter number',
    },
  },
  [ElementType.SWITCH]: {
    type: ElementType.SWITCH,
    config: { label: 'Switch', },
  },
  [ElementType.SELECT]: {
    type: ElementType.SELECT,
    config: {
      label: 'Select',
      datasource: {
        dataType: 'static',
        options: [{
          label: 'Option 1',
          value: 'option1'
        }, {
          label: 'Option 2',
          value: 'option2'
        }],
      },
      errorMessage: '',
    },
  },
  [ElementType.RADIO]: {
    type: ElementType.RADIO,
    config: {
      label: 'Radio',
      datasource: {
        dataType: 'static',
        options: [{
          label: 'Option 1',
          value: 'option1'
        }, {
          label: 'Option 2',
          value: 'option2'
        }],
      },
      errorMessage: '',
    },
  },
  [ElementType.TITLE]: {
    type: ElementType.TITLE,
    config: { label: 'Title', },
  },
  [ElementType.DATE]: {
    type: ElementType.DATE,
    config: {
      label: 'Date',
      placeholder: 'Enter date',
    },
  },
};
