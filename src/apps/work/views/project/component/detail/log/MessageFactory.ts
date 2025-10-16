import moment from 'moment';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { ActionType } from '@/apps/work/model/projectLog';
import {
  compareJsonFields,
  type Difference,
  extractJsonFields,
  getTranslation
} from '@/apps/work/views/project/component/detail/log/LogUtils';

const { usersMoreInfo } = useUserMoreInfoStore();

export interface MessageLog {
  fullMessage: string;
  action?: string;
  mainMessage?: string;

  [key: string]: Difference | string | undefined;
}

export interface MessageFactory {
  getLog(action: ActionType, oldValue: string | undefined, newValue: string, objectData?: any): MessageLog;
}

export function semiBoldString(str: string) {
  return `<span class = 'font-semibold'> ${str}</span>`;
}

function formatDate(date: string): string {
  return moment(new Date(date)).format('DD/MM/yyyy');
}

export function formatDifferenceMessages(diffs: Record<string, Difference>): void {
  ['admins', 'implementers', 'followers'].forEach(field => {
    if (diffs[field]) {
      diffs[field].message += `<b>${((diffs[field] as Difference)?.oldValue || [])?.map(e => usersMoreInfo[e]?.fullName).join(', ')}</b>`;
      diffs[field].message += ' -> ';
      diffs[field].message += `<b>${((diffs[field] as Difference)?.newValue || [])?.map(e => usersMoreInfo[e]?.fullName).join(', ')}</b>`;
    }
  });
  ['endDate', 'startDate'].forEach(field => {
    if (diffs[field]) {
      diffs[field].message += `<b>${(diffs[field] as Difference)?.oldValue ? formatDate((diffs[field] as Difference)?.oldValue || '') : 'null'}</b>`;
      diffs[field].message += ' -> ';
      diffs[field].message += `<b>${(diffs[field] as Difference)?.oldValue ? formatDate((diffs[field] as Difference)?.newValue || '') : 'null'}</b>`;
    }
  });
}

function buildUpdateMessageLog(
  actionStr: string,
  objectTypeStr: string,
  oldValueName: Record<string, never>,
  newValueName: Record<string, never>,
  diffs: Record<string, Difference>): string {
  return `${actionStr} ${objectTypeStr.toLowerCase()}.`
    + `${Object.keys(diffs).length > 1 ? ` ${getTranslation('work.projectLog.changes')}:` : ''} ${Object.values(diffs).map(e => e.message).join(', ')}`;
}

export class ProjectMessageFactory implements MessageFactory {
  getLog(action: ActionType, oldValue: string | undefined, newValue: string): MessageLog {
    const {
      actionStr,
      objectTypeStr,
      newValueName
    } = prepare(action, newValue);
    let messageLog: MessageLog = { fullMessage: '' };
    switch (action) {
    case ActionType.CREATE:
    case ActionType.READ:
    case ActionType.DELETE:
      messageLog.fullMessage = `${actionStr} ${objectTypeStr} <b>${newValueName}</b>`;
      break;
    case ActionType.UPDATE: {
      const oldValueName = oldValue ? extractJsonFields(oldValue)?.['name'] : {};
      const diffs = compareJsonFields(oldValue || '', newValue, ['name', 'code']);
      formatDifferenceMessages(diffs);
      messageLog = {
        fullMessage: buildUpdateMessageLog(actionStr, objectTypeStr, oldValueName, newValueName, diffs),
        ...diffs
      };
      break;
    }
    default:
      messageLog.fullMessage = `${actionStr} ${objectTypeStr} <b>${newValueName}</b>`;
    }
    return messageLog;
  }
}

export class DiscussionMessageFactory implements MessageFactory {
  getLog(action: ActionType, oldValue: string | undefined, newValue: string): MessageLog {
    const {
      actionStr,
      objectTypeStr,
      newValueName
    } = prepare(action, newValue);
    const messageLog: MessageLog = { fullMessage: '', };
    switch (action) {
    case ActionType.CREATE:
    case ActionType.READ:
    case ActionType.DELETE:
      messageLog.fullMessage = `${actionStr} ${objectTypeStr} ${newValueName}`;
      break;
    case ActionType.UPDATE: {
      const oldValueName = oldValue ? extractJsonFields(oldValue)['name'] : '';
      messageLog.fullMessage = `${actionStr} ${objectTypeStr} ${getTranslation('work.projectLog.from')} 
      ${oldValueName} ${getTranslation('work.projectLog.to')} ${newValueName}. ${getTranslation('work.projectLog.changes')}: ${compareJsonFields(oldValue || '', newValue)}`
      ;
      break;
    }
    default:
      messageLog.fullMessage = `${actionStr} ${objectTypeStr} ${newValueName}`;
    }
    return messageLog;
  }
}

export class ProjectAttachmentMessageFactory implements MessageFactory {
  getLog(action: ActionType, oldValue: string | undefined, newValue: string): MessageLog {
    const actionStr = getTranslation(`work.project.attachment.status.${action.toLowerCase()}`);

    const objOldValue = JSON.parse(oldValue || '');
    const objNewValue = JSON.parse(newValue);
    let mainMessage: string;
    if (action == ActionType.RENAME) {
      mainMessage = `Đổi tên tệp ${objOldValue?.['name']} thành ${objNewValue?.['name']}`;
    } else if (action == ActionType.UPLOAD) {
      mainMessage = objNewValue?.['name'];
    } else {
      mainMessage = objOldValue?.['name'];
    }

    return {
      fullMessage: actionStr + ': ' + mainMessage,
      action: actionStr,
      mainMessage: mainMessage
    };
  }
}

function prepare(action: ActionType, newValue: string) {
  const actionStr = getTranslation(`work.projectLog.action.${action.toLowerCase()}`);
  const objectTypeStr = getTranslation('work.projectLog.object.project');
  const newValueName: Record<string, never> = extractJsonFields(newValue)?.name || {};
  return {
    actionStr,
    objectTypeStr,
    newValueName
  };
}