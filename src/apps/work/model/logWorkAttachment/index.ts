interface Record {
    id: string;
    created_by: string;
    created_time: Date;
    last_modified_by: string;
    last_modified_time: Date;
    action: string;
    new_value: {
        fileName: string;
        size: number;
    };
    old_value: {
        fileName: string;
        size: number;
    };
    object_id: string;
    object_type: string;
    project_id: string;
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFileName(): string {
  const extensions = ['txt', 'jpg', 'png', 'pdf', 'docx'];
  const names = ['file', 'document', 'image', 'report', 'data'];
  const name = names[getRandomInt(0, names.length - 1)];
  const extension = extensions[getRandomInt(0, extensions.length - 1)];
  return `${name}_${getRandomInt(1, 100)}.${extension}`;
}

function generateRandomId(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getRandomAction(): string {
  const actions = ['open', 'download', 'upload', 'delete', 'rename'];
  return actions[getRandomInt(0, actions.length - 1)];
}

function generateRecords(count: number): Record[] {
  const records: Record[] = [];
  for (let i = 0; i < count; i++) {
    const record: Record = {
      id: generateRandomId(36),
      created_by: '651a6dffea5a6a1f1b92575c',
      created_time: new Date(),
      last_modified_by: `user_${getRandomInt(1, 10)}`,
      last_modified_time: new Date(),
      action: getRandomAction(),
      new_value: {
        fileName: getRandomFileName(),
        size: getRandomInt(100, 5000)
      },
      old_value: {
        fileName: getRandomFileName(),
        size: getRandomInt(100, 5000)
      },
      object_id: generateRandomId(36),
      object_type: `type_${getRandomInt(1, 5)}`,
      project_id: generateRandomId(36),
    };
    records.push(record);
  }
  return records;
}

export enum ObjectType {
    PROJECT = 'PROJECT',
    DISCUSSION = 'DISCUSSION',
    WORK_ATTACHMENT = 'WORK_ATTACHMENT'
}

export const records = generateRecords(50);