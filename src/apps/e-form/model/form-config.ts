import { ElementType } from '@/apps/e-form/components/element';
import type {
  DatePickerElementConfig,
  InputAreaElementConfig,
  InputCheckboxElementConfig,
  InputNumberElementConfig,
  InputRadioElementConfig,
  InputSelectElementConfig,
  InputSwitchElementConfig,
  InputTextAdvanceConfig,
  InputTitleElementConfig
} from '@/apps/e-form/model/advance-config';

export type ResizeInfo = {
  startX: number;
  index: number;
  startWidth: number;
  startSpan: number;
};

export type EFormConfigModel = {
  elements?: ElementConfig[];
  relationships?: RelationshipsConfig;
}

export type RelationshipsConfig = {
  [key: string]: RelationshipActionConfig[];
}

export type RelationshipActionConfig = {
  type: 'show' | 'hide' | 'enable' | 'disable';
  condition: ConditionConfig;
};

export type ConditionConfig =
  | SimpleCondition
  | CompositeCondition;

export type CompositeCondition = {
  logic: 'AND' | 'OR';
  conditions: ConditionConfig[];
};

export type SimpleCondition = {
  target?: string;
  operator: 'exists' | 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
  value?: any;
}

export type ElementConfig =
  InputTextConfig
  | InputAreaConfig
  | InputNumberConfig
  | InputDateConfig
  | InputSelectConfig
  | InputSwitchConfig
  | InputTitleConfig
  | InputCheckboxConfig
  | InputRadioConfig;

export type InputTextConfig = {
  type: ElementType.TEXT;
  config: InputTextAdvanceConfig;
}

export type InputAreaConfig = {
  type: ElementType.AREA;
  config: InputAreaElementConfig;
}

export type InputNumberConfig = {
  type: ElementType.NUMBER;
  config: InputNumberElementConfig;
}

export type InputDateConfig = {
  type: ElementType.DATE;
  config: DatePickerElementConfig;
}

export type InputSelectConfig = {
  type: ElementType.SELECT;
  config: InputSelectElementConfig;
}

export type InputSwitchConfig = {
  type: ElementType.SWITCH;
  config: InputSwitchElementConfig;
}

export type InputTitleConfig = {
  type: ElementType.TITLE;
  config: InputTitleElementConfig;
}

export type InputCheckboxConfig = {
  type: ElementType.CHECKBOX;
  config: InputCheckboxElementConfig;
}

export type InputRadioConfig = {
  type: ElementType.RADIO;
  config: InputRadioElementConfig;
}

export type ElementGeneralConfig = {
  name?: string;
  span?: number;
  label?: string;
  validations?: ValidationRule[];
  [key: string]: any;
}

export type ValidationRule = {
  type: ValidationRuleType;
  value?: any;
  errorMessage?: string;
};

export type ValidationRuleType = typeof VALIDATION_RULE_TYPES[number];

export const VALIDATION_RULE_TYPES = [
  'required',
  'minLength',
  'maxLength',
  'min',
  'max',
  'regex',
  'sameAs',
  'before',
  'after',
];

export const VALIDATION_RULE_MAPPING: Partial<Record<ElementType, ValidationRuleType[]>> = {
  [ElementType.TEXT]: [
    'required',
    'minLength',
    'maxLength',
    'regex',
    'sameAs'
  ],
  [ElementType.AREA]: [
    'required',
    'minLength',
    'maxLength',
    'regex',
    'sameAs'
  ],
  [ElementType.NUMBER]: [
    'required',
    'min',
    'max',
    'sameAs'
  ],
  [ElementType.DATE]: [
    'required',
    'before',
    'after',
    'sameAs'
  ],
  [ElementType.SELECT]: [
    'required',
    'sameAs'
  ],
  [ElementType.SWITCH]: [
    'required',
    'sameAs'
  ],
  [ElementType.TITLE]: [],
  [ElementType.CHECKBOX]: [
    'required',
    'sameAs'
  ],
  [ElementType.RADIO]: [
    'required',
    'sameAs'
  ],
  [ElementType.FILE]: [
    'required',
  ],
  [ElementType.IMAGE]: [
    'required',
  ],
};

export interface TextareaElementConfig {
  rows: number;
  maxlength: number;
  autoResize: boolean;
  placeholder: string;
}

export const requiredNames: ElementType[] = [ElementType.TEXT, ElementType.AREA, ElementType.SELECT, ElementType.RADIO, ElementType.SWITCH,
  ElementType.NUMBER, ElementType.DATE, ElementType.CHECKBOX, ElementType.FILE];

export const hasPlaceholder: ElementType[] = [ElementType.TEXT, ElementType.AREA, ElementType.SELECT, ElementType.DATE, ElementType.NUMBER];

export const dontHaveValue: ElementType[] = [ElementType.TITLE];

export const haveValue: ElementType[] = Object.values(ElementType).filter(
  (type): type is ElementType => !dontHaveValue.includes(type as ElementType)
);