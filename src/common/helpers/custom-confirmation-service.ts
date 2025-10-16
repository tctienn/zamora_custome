import ConfirmationEventBus from 'primevue/confirmationeventbus';
import type { ConfirmationOptions } from 'primevue/confirmationoptions';

export function confirm(options: ConfirmationOptions) {
  ConfirmationEventBus.emit('confirm', options);
}

export function confirmDanger(options: ConfirmationOptions) {
  ConfirmationEventBus.emit('confirm', {
    icon: 'pi pi-exclamation-triangle',
    defaultFocus: 'reject',
    ...options,
    acceptClass: 'p-button-danger',
  });
}