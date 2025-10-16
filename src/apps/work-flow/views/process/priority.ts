import { useI18n } from 'vue-i18n';

import { Priority } from '@/apps/work-flow/model/process/work';

type PriorityDisplay = {
  label: string;
  value: Priority;
  icon: string;
  iconClass?: string;
};

export const priorites = (): PriorityDisplay[] => {
  const { t } = useI18n();
  return [
    {
      label: t('work-flow.process.priority.low'),
      value: Priority.LOW,
      icon: 'stat_minus_1',
      iconClass: 'text-blue-500'
    },
    {
      label: t('work-flow.process.priority.medium'),
      value: Priority.MEDIUM,
      icon: 'remove',
      iconClass: 'text-yellow-500'
    },
    {
      label: t('work-flow.process.priority.high'),
      value: Priority.HIGH,
      icon: 'stat_1',
      iconClass: 'text-red-500'
    }
  ];
};

export function getPriorityDisplay(priority?: Priority): PriorityDisplay | undefined {
  return priorites().find(p => p.value === priority);
}