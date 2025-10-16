import { get } from 'lodash';
import ToastEventBus from 'primevue/toasteventbus';

import i18n from '@/common/i18n/index';

const { t } = i18n.global;

const SUCCESS = 'success';
const INFO = 'info';
const WARN = 'warn';
const ERROR = 'error';

export function toastInfo({
  title = t('common.result.title.info'),
  message = '',
  life = 3000
} = {}) {
  ToastEventBus.emit('add', {
    detail: message,
    life,
    severity: INFO,
    summaries: title
  });
}

export function toastError({
  title = t('common.result.title.error'),
  message = t('common.result.message.somethingWrong'),
  life = 3000
} = {}) {
  ToastEventBus.emit('add', {
    severity: ERROR,
    summaries: title,
    detail: message,
    life
  });
}

export function toastErrorData({
  title = t('common.result.title.error'),
  life = 3000,
  prefix = '',
  error = {}
} = {}) {
  const {
    message,
    code
  } = get(error, 'data', {
    message: '',
    code: ''
  });

  const detail = code ? t(`${prefix}.${code}`) : message ? message : t('common.result.message.somethingWrong');
  ToastEventBus.emit('add', {
    severity: ERROR,
    summaries: title,
    detail,
    life
  });
}

export function toastWarn({
  title = t('common.result.title.warn'),
  message = '',
  life = 3000
} = {}) {
  ToastEventBus.emit('add', {
    severity: WARN,
    summaries: title,
    detail: message,
    life
  });
}

export function toastSuccess({
  title = t('common.result.title.success'),
  message = t('common.result.message.success'),
  life = 3000
} = {}) {
  ToastEventBus.emit('add', {
    severity: SUCCESS,
    summaries: title,
    detail: message,
    life
  });
}
