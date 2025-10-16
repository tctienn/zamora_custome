import moment from 'moment/min/moment-with-locales';

import i18n from '@/common/i18n';

export default () => {
  const { locale } = i18n.global;
  moment.locale(locale.value);

  return { moment };
};