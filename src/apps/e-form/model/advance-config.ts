import type { DataSourceConfig } from '@/apps/e-form/model/data-source';
import type { ElementGeneralConfig } from '@/apps/e-form/model/form-config';

export type InputTextAdvanceConfig = ElementGeneralConfig & {
  placeholder?: string;
  maxlength?: number;
  autocomplete?: string;
  disabled?: boolean;
  readonly?: boolean;
  inputStyle?: Record<string, string>;
}

export type InputAreaElementConfig = ElementGeneralConfig & {
  //TODO: add other properties
}

export type DatePickerElementConfig = ElementGeneralConfig & {
  //TODO: add other properties
}

export type InputNumberElementConfig = ElementGeneralConfig & {
  //TODO: add other properties
}
export type InputSelectElementConfig = ElementGeneralConfig & {
  multiple?: boolean;
  datasource?: DataSourceConfig;
}

export type InputSwitchElementConfig = ElementGeneralConfig & {
  //TODO: add other properties
}

export type InputTitleElementConfig = ElementGeneralConfig & {
  //TODO: add other properties
}

export type InputCheckboxElementConfig = ElementGeneralConfig & {
  //TODO: add other properties
}

export type InputRadioElementConfig = ElementGeneralConfig & {
  datasource?: DataSourceConfig;
}