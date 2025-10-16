export const TASK_REQUIRED_FIELD = [
  'code',
  'name',
  'startTime',
];

export const TASK_OPTIONAL_FIELD = [
  'isRepeat',
  'supervisor',
  'cooperator',
  'assessorId',
  'attachments',
  'description',
  'isImportant',
  'needEvaluate',
  'remind',
  'source',
  'parentId',
  'checkLists',
  'locations',
  'taskCustomers'
];

export const TASK_FILTER_HEADER: { [key: string]: string } = {
  'expiresIn1Days': 'EXPIRES_IN_1_DAYS',
  'expiresIn3Days': 'EXPIRES_IN_3_DAYS',
  'expiresIn7Days': 'EXPIRES_IN_7_DAYS',
  'expire': 'EXPIRE',
  'done': 'DONE',
  'assign': 'ASSIGN',
  'implement': 'IMPLEMENT',
  'takePartIn': 'TAKE_PART_IN',
};

export const FIELD = 'FIELDS_TYPE';

export const PAYMENT_TYPE = 'PAYMENT_TYPE';

export const EDITABLE_FILE_TYPES = [
  'doc', 'docx', 'odt', 'csv', 'ods', 'xls', 'xlsx', 'odp', 'ppt', 'pptx'
];

export const IMAGE_FILE_TYPES_SUPPORTED = [
  'apng', 'apng', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp', 'ico', 'ico'
];

export const VIDEO_FILE_TYPES_SUPPORTED = [
  'mp4', 'webm', 'ogg'
];

export const AUDIO_FILE_TYPES_SUPPORTED = [
  'mp3', 'wav', 'ogg'
];