export * from './error-codes';
export * from './file-filter';

export const SCROLL_END_THRESHOLD = 0.2;

export const SORTING_STORAGE_OPTIONS = [
  {
    column: 'name',
    direction: 'asc'
  },
  {
    column: 'name',
    direction: 'desc'
  },
  {
    column: 'lastModifiedAt',
    direction: 'asc'
  },
  {
    column: 'lastModifiedAt',
    direction: 'desc'
  },
];

export const PERSON_SORTING_STORAGE_OPTIONS = [
  {
    column: 'isImportant',
    direction: 'desc'
  },
  {
    column: 'isImportant',
    direction: 'asc'
  },
  {
    column: 'isShare',
    direction: 'desc'
  },
  {
    column: 'isShare',
    direction: 'asc'
  },
];

export const FILTER_STORAGE_FILE_TYPES = [
  'document', 'sheet', 'slideshow', 'pdf', 'image', 'audio', 'video', 'compress'
];

export const FILTER_STORAGE_LAST_MODIFIED = [
  {
    value: 1,
    label: 'today'
  },
  {
    value: 7,
    label: 'last7Days'
  },
  {
    value: 30,
    label: 'last30Days'
  },
];

export const FILTER_SHARE = [
  'shared', 'notShare'
];

export const FILE_TYPES_CREATABLE = [
  {
    type: 'document',
    extension: '.docx'
  },
  {
    type: 'sheet',
    extension: '.xlsx'
  },
  {
    type: 'slideshow',
    extension: '.pptx'
  },
  {
    type: 'text',
    extension: '.txt'
  }
];

export const EDITABLE_FILE_TYPES = [
  'doc', 'docx', 'odt', 'csv', 'ods', 'xls', 'xlsx', 'odp', 'ppt', 'pptx', 'txt'
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

export const ECM_GROUP_MENU_WIDGETS = [
  {
    label: 'ecm.group.widgets.note',
    icon: 'sticky_note',
    key: 'note',
    component: 'EcmGroupNote',
    order: 1,
    visible: true,
    recordNumber: 3
  },
  {
    label: 'ecm.group.widgets.topic',
    icon: 'forum',
    key: 'topic',
    component: 'EcmGroupTopic',
    order: 2,
    visible: true,
    recordNumber: 3
  },
  {
    label: 'ecm.group.widgets.event',
    icon: 'calendar_month',
    key: 'event',
    component: 'EcmGroupEvent',
    order: 3,
    visible: true,
    recordNumber: 3
  }
];

export const COMMENT_WIDGETS = [
  {
    label: 'ecm.group.widgets.note',
    icon: 'forum',
    key: 'comment',
    component: 'CommentFileGroup',
    order: 1,
    visible: true
  }
];