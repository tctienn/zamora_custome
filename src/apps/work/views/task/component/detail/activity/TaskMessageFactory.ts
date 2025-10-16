import { ActionType } from '@/apps/work/model/projectLog';
import type { TaskHistory } from '@/apps/work/model/workLog';
import {
  compareJsonFields,
  type Difference,
  extractJsonFields,
  getTranslation
} from '@/apps/work/views/project/component/detail/log/LogUtils';
import {
  type MessageFactory,
  type MessageLog,
  semiBoldString
} from '@/apps/work/views/project/component/detail/log/MessageFactory';
import { TaskAttributeMessageFactory } from '@/apps/work/views/task/component/detail/activity/TaskAttributeMessageFactory';

export class TaskMessageFactory implements MessageFactory {
  getLog(action: ActionType, oldValue: string | undefined, newValue: string, objectData: any): MessageLog {
    const taskHistory = objectData as TaskHistory;
    if (taskHistory.attribute) {
      const messageObject = TaskAttributeMessageFactory.getAttributeCreatorMessage(taskHistory.attribute);
      return messageObject.getLog(taskHistory);
    }
    const { actionStr, objectTypeStr, newValue: newValueData } = prepare(action, oldValue, newValue);
    let messageLog: MessageLog = { fullMessage: '' };
    switch (action) {
    case ActionType.CREATE:
    case ActionType.READ:
    case ActionType.DELETE:
      messageLog.fullMessage = `${actionStr} ${objectTypeStr} `;
      break;
    case ActionType.UPDATE: {
      const oldValueName = oldValue ? extractJsonFields(oldValue)['name'] : {};
      const diffs = compareJsonFields(oldValue || '', newValue, ['name', 'code']);
      messageLog = {
        fullMessage: buildUpdateMessageLog(actionStr, objectTypeStr, oldValueName, newValueData, diffs),
        ...diffs
      };
      break;
    }
    case ActionType.RENAME:
      break;
    case ActionType.DOWNLOAD:
      break;
    case ActionType.UPLOAD:
      break;
    case ActionType.CLONE:
      break;
    }
    return messageLog;
  }

}

export class TaskAttachmentMessageFactory implements MessageFactory {

  getLog(action: ActionType, oldValue: string | undefined, newValue: string): MessageLog {
    const messageLog: MessageLog = { fullMessage: '' };
    switch (action) {
    case ActionType.UPLOAD_ATT: {
      const attachmentName = (newValue as unknown as Record<string, never>)?.name;
      messageLog.fullMessage = `Tải lên tài liệu ${semiBoldString(attachmentName)}`;
      break;
    }
    case ActionType.DELETE_ATT: {
      const attachmentName = (oldValue as unknown as Record<string, never>)?.name;
      messageLog.fullMessage = `Xóa tài liệu ${semiBoldString(attachmentName)}`;
      break;
    }
    case ActionType.RENAME_ATT: {
      const attachmentName = (oldValue as unknown as Record<string, never>)?.name;
      messageLog.fullMessage = `Đổi tên tài liệu ${semiBoldString(attachmentName)}`;
      break;
    }
    case ActionType.DOWNLOAD_ATT: {
      const attachmentName = (oldValue as unknown as Record<string, never>)?.name;
      messageLog.fullMessage = `Tải xuống tài liệu ${semiBoldString(attachmentName)}`;
      break;
    }
    }

    return messageLog;
  }

}

export class TaskDiscussionFactory implements MessageFactory {
  getLog(action: ActionType, oldValue: string | undefined, newValue: string, objectData: TaskHistory): MessageLog {
    const messageLog: MessageLog = { fullMessage: '' };
    switch (action) {
    case ActionType.CREATE: {
      messageLog.fullMessage = `Gửi thảo luận mới: ${semiBoldString(objectData.content)}`;
      break;
    }
    case ActionType.UPDATE: {
      messageLog.fullMessage = `Chỉnh sửa thảo luận: ${semiBoldString(objectData.content)}`;
      break;
    }
    case ActionType.DELETE: {
      messageLog.fullMessage = `Xoá thảo luận: ${semiBoldString(objectData.content)}`;
      break;
    }
    case ActionType.REPLY_COMMENT: {
      messageLog.fullMessage = `Trả lời thảo luận: ${semiBoldString(objectData.content)}`;
      break;
    }
    }

    return messageLog;
  }

}

//Translate and calculate newValue
function prepare(action: ActionType, oldValue: string | undefined, newValue: string): {
  actionStr: string,
  objectTypeStr: string,
  newValue: Record<string, never>
} {
  const actionStr = getTranslation(`work.workLog.action.${action.toLowerCase()}`);
  const objectTypeStr = getTranslation('work.workLog.object.work');
  const newValueData = extractJsonFields(newValue);
  return {
    actionStr: actionStr,
    objectTypeStr: objectTypeStr,
    newValue: newValueData
  };
}

export function buildUpdateMessageLog(
  actionStr: string,
  objectTypeStr: string,
  oldValueName: Record<string, never>,
  newValueName: Record<string, never>,
  diffs: Record<string, Difference>): string {
  return `${actionStr} ${objectTypeStr.toLowerCase()}.`
    + `${Object.keys(diffs).length > 1 ? ` ${getTranslation('work.workLog.changes')}:` : ''} ${Object.values(diffs).map(e => e.message).join(', ')}`;
}