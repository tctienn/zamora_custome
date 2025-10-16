import type { GridColumn, Scale, Task } from 'dhtmlx-gantt';
import { JSX } from 'vue/jsx-runtime';

export type GanttColumnConfig = {
  templateTSX?(task: Task, node: HTMLElement): JSX.Element
} & GridColumn

export type GanttScaleConfig = Scale