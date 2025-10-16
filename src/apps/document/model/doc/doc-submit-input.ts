import { camelCase } from 'lodash';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import type { DocComment } from '@/apps/document/model/comment';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { SubmitProcess } from '@/apps/document/model/process/submit';
import { createOptions } from '@/common/helpers/utils';

export type DocSubmit = {
    id?: string
    processId?: string
    commentId?: string

    fileId?: string
    docLocation?: string
    docDate?: string
    docType?: string
    about?: string
    submitToIds?: string
    submitToNames?: string
    workSummary?: string
    proposeOpinion?: string
    fileInclude?: string
    editorId?: string
    editorName?: string
    editorDeptId?: string
    editorDeptName?: string
    editorRoleId?: string
    editorRoleName?: string
    opinion1?: string
    opinion2?: string
    opinion3?: string
    opinion4?: string
    opinion5?: string
    opinion6?: string
    status?: DocSubmitStatus
    sendBackType?: string
    isDeleted?: boolean
    fromDeptPresentId?: string
    fromDeptPresentName?: string
    number?: string
    symbol?: string
    year?: number
    securityCode?: string
    dateInput?: string
    numberSubmissions?: string
    toDeptPresentId?: string
    toDeptPresentName?: string
    flowId?: string
    leaderOpinion?: string
    docOutIds?: string[]
    createdTime?: string

    process?: SubmitProcess
    comment?: DocComment
    filePresentation?: DocumentAttachment[]
    filePresentationDocSubmit?: DocumentAttachment[]
    relatedDocuments?: DocumentAttachment[]
    isDisableButtonFlow?: boolean
}

export interface DocSubmitInput {
    id: string,
    fileId: string,
    docLocation: string | null,
    docDate: Date | null,
    docType: string,
    about: string,
    submitToIds: string,
    submitToNames: string,
    workSummary: string,
    proposeOpinion: string,
    fileInclude: string,
    editorId: string,
    editorName: string,
    editorRoleId: string,
    editorRoleName: string,
    editorDeptId: string,
    editorDeptName: string,
    opinion1: string,
    opinion2: string,
    opinion3: string,
    opinion4: string,
    opinion5: string,
    opinion6: string,
    status: string,
    isDeleted: boolean,
    fromDeptPresent: any,
    fromDeptPresentId: string,
    fromDeptPresentName: string,
    number: string,
    symbol: string,
    year: Date | null | number,
    securityCode: string,
    dateInput: Date | null,
    numberSubmissions: string,
    toDeptPresent: any,
    toDeptPresentId: string,
    toDeptPresentName: string,
    flowId: string,
    leaderOpinion: string,
    docOutIds: [string],
    docOuts: [DocOut]
    filePresentation: any
    relatedDocuments: [DocumentAttachment],
    createdTime: Date,
    createdBy: string,
    isProcessing: boolean
    isTemporaryFlow: boolean
    questions: [Question]
}

export enum DocSubmitStatus {
    SOAN_THAO = 'SOAN_THAO',
    DANG_TRINH = 'DANG_TRINH',
    HOAN_THANH = 'HOAN_THANH'
}

export interface Option {
    id: string,
    label: string,
    questionId: string,
    orderNumber: number,
    otherOpinion: boolean,
    text?: string | null
}

export interface Question {
    id: string,
    label: string,
    docId: string,
    orderNumber: number
    options: Option[],
    answers?: Answer[],
    answer?: Answer,
    isYesNoQuestion: boolean
}

export interface Answer {
    id: string,
    label: string,
    questionId: string,
    userId: string,
    userName: string,
    deptId: string,
    deptName: string,
    roleId: string,
    roleName: string,
    otherOpinion: boolean,
    text: string | null
}

export enum OPTION_ADVICE {
    YES_NO_ANSWER = 'YES_NO_ANSWER', DYNAMIC_ANSWER = 'DYNAMIC_ANSWER'
}

export const OptionsAdvice = [
  {
    label: 'Nội dung với câu trả lời sẵn',
    value: 'yesNoAnswer'
  },
  {
    label: 'Nội dung và tạo câu trả lời',
    value: 'dynamicAnswer'
  }
];

// export const questionsData: Question[] = [
//   {
//     id: 'q1',
//     label: 'What is your favorite color?',
//     docId: 'doc1',
//     orderNumber: 1,
//     isYesNoQuestion: false,
//     options: [
//       {
//         id: 'o1',
//         label: 'Red',
//         questionId: 'q1',
//         orderNumber: 1,
//         otherOpinion: false,
//       },
//       {
//         id: 'o2',
//         label: 'Blue',
//         questionId: 'q1',
//         orderNumber: 2,
//         otherOpinion: false,
//       },
//       {
//         id: 'o3',
//         label: 'Other',
//         questionId: 'q1',
//         orderNumber: 3,
//         otherOpinion: true, // Cho phép nh?p ý ki?n khác
//       },
//     ],
//   },
//   {
//     id: 'q2',
//     label: 'What is your favorite food?',
//     docId: 'doc1',
//     orderNumber: 2,
//     isYesNoQuestion: false,
//     options: [
//       {
//         id: 'o4',
//         label: 'Pizza',
//         questionId: 'q2',
//         orderNumber: 1,
//         otherOpinion: false,
//       },
//       {
//         id: 'o5',
//         label: 'Burger',
//         questionId: 'q2',
//         orderNumber: 2,
//         otherOpinion: false,
//       },
//       {
//         id: 'o6',
//         label: 'Other',
//         questionId: 'q2',
//         orderNumber: 3,
//         otherOpinion: true,
//       },
//     ],
//   },
//   {
//     id: 'q3',
//     label: 'What is your favorite hobby?',
//     docId: 'doc2',
//     orderNumber: 3,
//     isYesNoQuestion: false,
//     options: [
//       {
//         id: 'o7',
//         label: 'Painting',
//         questionId: 'q3',
//         orderNumber: 1,
//         otherOpinion: false,
//       },
//       {
//         id: 'o8',
//         label: 'Playing guitar',
//         questionId: 'q3',
//         orderNumber: 2,
//         otherOpinion: false,
//       },
//       {
//         id: 'o9',
//         label: 'Other',
//         questionId: 'q3',
//         orderNumber: 3,
//         otherOpinion: true,
//       },
//     ],
//   },
//   {
//     id: 'q4',
//     label: 'Do you like a cup of tea?',
//     docId: 'doc2',
//     orderNumber: 4,
//     isYesNoQuestion: true,
//     options: [
//       {
//         id: 'o10',
//         label: 'Yes',
//         questionId: 'q4',
//         orderNumber: 1,
//         otherOpinion: false,
//       },
//       {
//         id: 'o11',
//         label: 'No',
//         questionId: 'q4',
//         orderNumber: 2,
//         otherOpinion: false,
//       },
//       {
//         id: 'o12',
//         label: 'Other',
//         questionId: 'q4',
//         orderNumber: 3,
//         otherOpinion: true,
//       },
//     ],
//   },
// ];

export const DOC_SUBMIT_STATUSES =
    createOptions(DocSubmitStatus,
      key => `document.flowAction.status.${camelCase(key)}`);
