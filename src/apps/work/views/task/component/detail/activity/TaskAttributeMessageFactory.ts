import { ActionType } from '@/apps/work/model/projectLog';
import { TaskAttribute, type TaskHistory } from '@/apps/work/model/workLog';
import { compareJsonFields } from '@/apps/work/views/project/component/detail/log/LogUtils';
import { type MessageLog, semiBoldString } from '@/apps/work/views/project/component/detail/log/MessageFactory';
import { buildUpdateMessageLog } from '@/apps/work/views/task/component/detail/activity/TaskMessageFactory';

export interface ITaskAttributeMessage {
  getLog(taskHistory: TaskHistory): MessageLog;
}

export interface ITaskAttributeMessageStatic {
  getInstance(): ITaskAttributeMessage;
}

class CheckListGroupMessage implements ITaskAttributeMessage {
  private static instance: ITaskAttributeMessage = new CheckListGroupMessage();

  public static getInstance(): CheckListGroupMessage {
    return this.instance as CheckListGroupMessage;
  }

  public getLog(taskHistory: TaskHistory): MessageLog {
    let messageLog: MessageLog = { fullMessage: '' };
    const newValue = (taskHistory.newValue as unknown as Record<string, never>);
    const oldValue = (taskHistory.oldValue as unknown as Record<string, never>);
    switch (taskHistory.action) {
    case ActionType.CREATE:
      messageLog.fullMessage = `Tạo mới nhóm checklist ${semiBoldString(newValue?.name)}`;
      break;
    case ActionType.UPDATE: {
      const diffs = compareJsonFields(oldValue || '', newValue, ['name'], key => `work.task.attribute.checkListGroup.${key}`);
      messageLog = {
        fullMessage: buildUpdateMessageLog('Cập nhật', 'nhóm checklist', {}, {}, diffs),
        ...diffs
      };
      // messageLog.fullMessage = `Cập nhật nhóm checklist ${semiBoldString(newValue?.name)}`;
      break;
    }
    case ActionType.DELETE:
      messageLog.fullMessage = `Xóa nhóm checklist ${semiBoldString(oldValue?.name)}`;
      break;
    }
    return messageLog;
  }
}

class CheckListMessage implements ITaskAttributeMessage {
  private static instance: ITaskAttributeMessage = new CheckListMessage();

  public static getInstance(): CheckListMessage {
    return this.instance as CheckListMessage;
  }

  public getLog(taskHistory: TaskHistory): MessageLog {
    let messageLog: MessageLog = { fullMessage: '' };
    const newValue = (taskHistory.newValue as unknown as Record<string, never>);
    const oldValue = (taskHistory.oldValue as unknown as Record<string, never>);
    switch (taskHistory.action) {
    case ActionType.CREATE:
      messageLog.fullMessage = `Tạo mới checklist ${semiBoldString(newValue?.name)}`;
      break;
    case ActionType.UPDATE: {
      const diffs = compareJsonFields(oldValue || '', newValue, ['name'], key => `work.task.attribute.checkList.${key}`);
      messageLog = {
        fullMessage: buildUpdateMessageLog('Cập nhật', 'nhóm checklist', {}, {}, diffs),
        ...diffs
      };
      // messageLog.fullMessage = `Cập nhật nhóm checklist ${semiBoldString(newValue?.name)}`;
      break;
    }
    case ActionType.DELETE:
      messageLog.fullMessage = `Xóa checklist ${semiBoldString(oldValue?.name)}`;
      break;
    }
    return messageLog;
  }
}

class ReportMessage implements ITaskAttributeMessage {
  private static instance: ITaskAttributeMessage = new ReportMessage();

  public static getInstance(): ReportMessage {
    return this.instance as ReportMessage;
  }

  public getLog(taskHistory: TaskHistory): MessageLog {
    const messageLog: MessageLog = { fullMessage: '' };
    switch (taskHistory.action) {
    case ActionType.CREATE:
      messageLog.fullMessage = 'Thêm báo cáo ' + (taskHistory?.content ? ' với lời nhắn' + `${semiBoldString(taskHistory?.content || '')}` : '');
      break;
    case ActionType.UPDATE:
      messageLog.fullMessage = 'Cập nhật tiến độ' + (taskHistory?.content ? ' với lời nhắn' + `${semiBoldString(taskHistory?.content || '')}` : '');
      break;
    }
    return messageLog;
  }
}

class EvaluationMessage implements ITaskAttributeMessage {
  private static instance: ITaskAttributeMessage = new ReportMessage();

  public static getInstance(): ReportMessage {
    return this.instance as ReportMessage;
  }

  public getLog(taskHistory: TaskHistory): MessageLog {
    const messageLog: MessageLog = { fullMessage: '' };
    switch (taskHistory.action) {
    case ActionType.CREATE:
      messageLog.fullMessage = 'Thêm đánh giá ' + (taskHistory?.content ? 'với lời nhắn' + `${semiBoldString(taskHistory?.content || '')}` : '');
      break;
    }
    return messageLog;
  }
}

export class TaskAttributeMessageFactory {
  public static mapAttribute: Record<TaskAttribute, ITaskAttributeMessageStatic> = {
    CHECK_LIST: CheckListMessage,
    CHECK_LIST_GROUP: CheckListGroupMessage,
    //TODO: Implement each
    DEADLINE: CheckListGroupMessage,
    EVALUATION: EvaluationMessage,
    EXPENSE: CheckListGroupMessage,
    LABEL: CheckListGroupMessage,
    LOCATION: CheckListGroupMessage,
    REPEAT: CheckListGroupMessage,
    RESULT: CheckListGroupMessage,
    SETTING: CheckListGroupMessage,
    STATUS: CheckListGroupMessage,
    REPORT: ReportMessage,
  };

  public static getAttributeCreatorMessage(attribute: TaskAttribute): ITaskAttributeMessage {
    const messageClass = TaskAttributeMessageFactory.mapAttribute[attribute];
    return messageClass.getInstance();
  }
}
