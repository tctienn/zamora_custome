import i18n from '@/common/i18n/index';
import type { Pageable } from '@/common/model/query';

const { t } = i18n.global;
export const APP_NAME = 'Zamora';
export * from './actions';
export * from './error-codes';
export const ADMIN = 'ADMIN';
export const ECM_APP_CODE = 'ecm';
export const SEARCH_KEYWORD_MIN_LENGTH = 3;
export const CHARACTER_LENGTH_SHOW_MORE = 255;
export const UNREAD_NOTIFICATION = 9;
export const UNREAD_MESSAGE = 9;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE: Pageable = {
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
};
export const DEFAULT_MAX_PAGE_SIZE = 999;
export const DEFAULT_CHAT_LOAD_MESSAGE_SIZE = 25;
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
export const DEFAULT_PAGINATOR_TEMPLATE =
  'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown';
export const DEFAULT_SCROLL_HEIGHT = 'calc(100vh - 9rem)';

export const DEFAULT_DATATABLE_CONFIG = {
  'current-page-report-template': t('common.resultPagination', {
    first: '{first}',
    last: '{last}',
    totalRecords: '{totalRecords}',
  }),
  ref: 'dataTable',
  'paginator-template': DEFAULT_PAGINATOR_TEMPLATE,
  rows: DEFAULT_PAGE_SIZE,
  'rows-per-page-options': DEFAULT_PAGE_SIZE_OPTIONS,
  'show-gridlines': false,
  lazy: true,
  'scroll-height': DEFAULT_SCROLL_HEIGHT,
  scrollable: true,
  stripedRows: false,
  'row-hover': true,
  class: 'h-full',
  //'table-class': 'border-round'
};

export const DEFAULT_DIALOG_CONFIG = {
  style: { width: '50vw' },
  breakpoints: {
    '960px': '75vw',
    '640px': '90vw',
  },
  modal: true,
  'dismissable-mask': false,
  maximizable: true,
};

export const DEFAULT_SIDEBAR_CONFIG = {
  style: { width: '50vw' },
  breakpoints: {
    '960px': '75vw',
    '640px': '90vw',
  },
  dismissable: false,
  'block-scroll': true,
  position: 'right' as const
};

export const MAIN_DASHBOARD_WIDGET_NUMBER = 6;
export const SIDEBAR_DASHBOARD_WIDGET_NUMBER = 4;

export const EMAIL_SERVER_PROTOCOLS = {
  WEB_MAIL: 'WEB_MAIL',
  SMTP: 'SMTP',
  IMAP: 'IMAP',
  POP3: 'POP3',
};

export const DEFAULT_EDITOR_TOOLBARS = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  ['link', 'image'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];

export const ACTION_RESULT = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

export const LOGIN = {
  LOGIN_FAILED_ALLOW: 3,
  CAPTCHA_INVALID_ALLOW: 10,
};

export const STATUSES = {
  ACTIVE: 'active',
  DEACTIVATE: 'deactivate',
  DELETED: 'deleted',
};

export const ACTIVITY_STATUSES = {
  ACTIVE: 'ACTIVE',
  DEACTIVATE: 'DEACTIVATE',
};

export const CONFIG_WORK_STATUSES = {
  START: 'START',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  STOPPED: 'STOPPED',
};

export const WORKING_TIME = {
  FULL: 'FULL',
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  ON_LEAVE: 'ON_LEAVE',
};

export const WORK_SHIFT = {
  PART_OFFICE_SHIFT: 'PART_OFFICE_SHIFT',
  NIGHT_SHIFT: 'NIGHT_SHIFT',
  BROKEN_SHIFT: 'BROKEN_SHIFT',
};

export const GROUP_TYPE = {
  GROUP_SYSTEM: 'GROUP_SYSTEM',
  GROUP_RESOURCES: 'GROUP_RESOURCES',
  GROUP_EMAIL: 'GROUP_EMAIL',
};

export const TYPE_PRIVACY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  LIMIT: 'LIMIT',
};

export const FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS_REGEX = /[\\/:*?"<>|]/g;

export const FILE_FOLDER_NAME_NOT_ALLOW_CHARACTERS = '\\ / : * ? " < > |';

export const AVATAR_COLOURS = [
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#16a085',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
  '#2c3e50',
  '#f1c40f',
  '#e67e22',
  '#e74c3c',
  '#95a5a6',
  '#f39c12',
  '#d35400',
  '#c0392b',
  '#bdc3c7',
  '#7f8c8d',
];

export const FILE_TYPES: Map<string, string[]> = new Map([
  ['document', ['doc', 'docx', 'odt']],
  ['sheet', ['csv', 'ods', 'xls', 'xlsx']],
  ['slideshow', ['odp', 'ppt', 'pptx']],
  ['pdf', ['pdf']],
  [
    'image',
    [
      'jpg',
      'jpeg',
      'jpe',
      'jif',
      'jfif',
      'jfi',
      'png',
      'gif',
      'webp',
      'tiff',
      'tif',
      'psd',
      'raw',
      'arw',
      'cr2',
      'nrw',
      'k25',
      'bmp',
      'dib',
      'heif',
      'heic',
      'ind',
      'indd',
      'indt',
      'jp2',
      'j2k',
      'jpf',
      'jpx',
      'jpm',
      'mj2',
      'svg',
      'svgz',
      'ai',
      'eps',
    ],
  ],
  [
    'audio',
    ['pcm', 'wav', 'wav', 'mp3', 'aac', 'ogg', 'wma', 'flac', 'flac', 'wma'],
  ],
  [
    'video',
    [
      'mp4',
      'mov',
      'avi',
      'flv',
      'mkv',
      'wmv',
      'avchd',
      'webm',
      'h264',
      'mpeg-4',
    ],
  ],
  ['compress', ['zip', 'rar', 'arj', 'tar', 'gz', 'tgz']],
]);

export enum DateTimeFormat {
  ISO_LOCAL_DATE_TIME = 'YYYY-MM-DDTHH:mm:ss',
  ISO_LOCAL_DATE = 'YYYY-MM-DD',
  DATE_READABLE = 'DD/MM/YYYY',
  DATE_TIME_READABLE = 'HH:mm DD/MM/YYYY',
  ISO_LOCAL_YEAR = 'YYYY',
}

export const GRID_RESPONSIVE_CLASSES_MAX_9 =
  'col-num-4 sm:col-num-5 md:col-num-6 lg:col-num-6 xl:col-num-7 xxl:col-num-8 xxxl:col-num-9';
export const GRID_RESPONSIVE_CLASSES_MAX_8 =
  'col-num-3 sm:col-num-4 md:col-num-5 lg:col-num-5 xl:col-num-6 xxl:col-num-7 xxxl:col-num-8';
export const GRID_RESPONSIVE_CLASSES_MAX_7 =
  'col-num-2 sm:col-num-3 md:col-num-4 lg:col-num-4 xl:col-num-5 xxl:col-num-6 xxxl:col-num-7';
export const GRID_RESPONSIVE_CLASSES_MAX_6 =
  'col-num-2 sm:col-num-3 md:col-num-4 lg:col-num-3 xl:col-num-4 xxl:col-num-5 xxxl:col-num-6';
export const GRID_RESPONSIVE_CLASSES_MAX_5 =
  'col-num-1 sm:col-num-2 md:col-num-3 lg:col-num-2 xl:col-num-3 xxl:col-num-4 xxxl:col-num-5';
