import type { TreeNode } from 'primevue/treenode';
import type { Component, PropType, StyleValue } from 'vue';

export type SearchField<T> = {
  label: string;
  type?: PropType<T>;
  defaultValue?: T;
  optionsDropdown?: object;
  optionsTreeSelect?: TreeNode[] | any;
  isTreeSingleSelect?: boolean;
  col?: number;
  isDatePicker?: boolean;
  isCheckbox?: boolean;
  isChooseUser?: boolean;
  isMultiSelect?: boolean;
  component?: Component | keyof HTMLElementTagNameMap;
  props?: Record<string, any>;
  listener?: Record<string, (...args: any[]) => any>;
  labelStyle?: StyleValue;
  isHidden?: boolean;
  isSplitButton?: boolean;
  hasAdd?: boolean;
  selectedYear?: boolean;
  selectedEmployees?: boolean;
};
export type SearchFields = {
  [key: string]: SearchField<any>;
};

export type SearchModel = {
  [key: string]: any;
};
