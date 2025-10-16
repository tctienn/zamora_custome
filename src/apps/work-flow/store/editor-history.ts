import { defineStore } from 'pinia';

export const useHistoryStore = defineStore('history', () => {
  const mementos: any[] = [];
  let allowBackup = true;

  function backup(state: any) {
    if (allowBackup) {
      const item = JSON.parse(JSON.stringify(state));
      if (mementos.length === 0 || item !== JSON.parse(JSON.stringify(mementos[mementos.length - 1]))) {
        mementos.push(item);
        allowBackup = false;
      }
    }

    setTimeout(() => allowBackup = true, 1000);
  }

  function undo() {
    return mementos.pop();
  }

  return {
    backup,
    undo,
  };
});