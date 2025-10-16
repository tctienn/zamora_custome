import type { Outcome } from '@/apps/work-flow/model/flow';

export type FlowButtonProps = {
  outcome?: Outcome,
  objectData?: any,
  disabled?: boolean,
  label?: string,
  size?: 'small' | 'large' | undefined,
  iconSize?: string,
  classNameBtn?: string,
}

export type FlowButtonGroupProps<T extends Outcome> = {
  outcomes?: T[],
  disabledFunc?: (outcome: T) => boolean,
  visibleFunc?: (outcome: T) => Promise<boolean>,
  label?: (outcome: T) => string,
  size?: 'small' | 'large' | undefined,
  iconSize?: string,
  classNameBtn?: string,
}

export type FlowButtonGroupEmits = {
  (e: 'action', outcome: Outcome): void
}
