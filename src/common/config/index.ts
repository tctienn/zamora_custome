export default class EnvConfig {
  static get Env(): { [key: string]: string } {
    return {
      VITE_GATEWAY: '$VITE_GATEWAY',
      VITE_EDITOR_URL: '$VITE_EDITOR_URL',
      VITE_CHAT_SERVER: '$VITE_CHAT_SERVER',
    };
  }

  static value(key: string) {
    if (import.meta.env.PROD) {
      return this.Env[key];
    }
    return import.meta.env[key];
  }
}