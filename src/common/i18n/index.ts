import { assign, camelCase, isUndefined } from 'lodash';
import { createI18n } from 'vue-i18n';

import en from './locales/en';
import vi from './locales/vi';

type IDictionary<T> = {
    [id: string]: IDictionary<T> | T;
}

function mergeI18n() {
  function cleanupKey(key: string) {
    const keys = key.split('/');
    const locale = keys[keys.length - 2];
    const prefix = keys[keys.length - 5];

    return {
      locale,
      prefix,
      path: camelCase(keys[keys.length - 1].split('.')[0])
    };
  }

  function setValueByPath<T>(obj: IDictionary<T>, path: string, value: T) {
    const a = path.split('/');
    let o = obj;
    while (a.length - 1) {
      const n = a.shift();
      if (isUndefined(n)) {
        return;
      }
      if (!(n in o)) {
        o[n] = {};
      }
      o = o[n] as IDictionary<T>;
    }
    if (a[0] === 'index') {
      assign(o, value);
    } else {
      o[a[0]] = value;
    }
  }

  const modules: any = import.meta.glob('/src/apps/**/i18n/locales/(en|vi)/*.json', { eager: true });
  const messages: IDictionary<object> = {};

  for (const key in modules) {
    const {
      locale,
      path,
      prefix
    } = cleanupKey(key);

    if (isUndefined(messages[locale])) {
      messages[locale] = {};
    }
    if (isUndefined((messages[locale] as IDictionary<object>)[prefix])) {
      (messages[locale] as IDictionary<object>)[prefix] = {};
    }

    setValueByPath((messages[locale] as IDictionary<object>)[prefix], path, modules[key].default);
  }

  return messages;
}

const messages = mergeI18n();

const {
  en: messagesEn,
  vi: messagesVi
} = messages || {};

const i18n = createI18n({
  fallbackLocale: 'vi',
  globalInjection: true,
  legacy: false,
  locale: 'vi',
  messages: {
    en: {
      ...en,
      ...messagesEn
    },
    vi: {
      ...vi,
      ...messagesVi
    }
  }
});

export default i18n;
