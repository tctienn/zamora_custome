import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/document/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      functionMapping: '/DOCUMENT/'
    },
    path: '/document',
    children: [
      {
        component: () =>
          import('@/apps/document/views/dashboard/DocumentDashboardNew.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DASHBOARD',
          icon: 'dashboard',
          showInMenu: true,
        },
        name: 'DocumentDashboard',
        path: 'dashboard',
      },

      {
        component: () =>
          import('@/apps/document/views/doc/doc-in/DocInWrapper.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DOCUMENT_DOC-IN',
          icon: 'archive',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_DOC-IN',
        },
        name: 'DocumentDocIn',
        path: 'doc-in',
        children: [
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_RECEIVE',
            },
            path: 'receive',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInReceiveDetail',
                path: 'detail/:id',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInReceiveManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_RECEIVE',
                },
                name: 'DocumentDocInReceiveManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/FormDocumentIn.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInFormDocument',
                path: 'create',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInOCR.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'OcrDocIn',
                path: 'ocr',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/FormDocumentIn.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInUpdate',
                path: 'update/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_WAITING',
            },
            path: 'waiting-process',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInWithProcessDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInWaitingDetail',
                path: 'detail/:processId',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInWaitingManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_WAITING',
                },
                name: 'DocumentDocInWaitingManage',
                path: '',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'clerk-processing',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInClerkProcessingManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_CLERK-PROCESSING',
                },
                name: 'DocumentDocInClerkProcessingManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInClerkProcessingDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'processing',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInWithProcessDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInProcessingDetail',
                path: 'detail/:processId',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInProcessingManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_PROCESSING',
                },
                name: 'DocumentDocInProcessingManage',
                path: '',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentDocInClerk',
            path: 'clerk-processed',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInClerkProcessedManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_CLERK-PROCESSED',
                },
                name: 'DocumentDocInClerkProcessedManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInClerkProcessedDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentDocInProcessed',
            path: 'processed',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInProcessedManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_PROCESSED',
                },
                name: 'DocumentDocInProcessedManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInWithProcessDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInProcessedDetail',
                path: 'detail/:processId',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'receive-to-know',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInReceiveToKnow.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInReceiveToKnow',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInReceiveToKnowDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () =>
              import(
                '@/apps/document/views/doc/doc-in/manage/DocInEvictManage.vue'
              ),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_EVICT',
            },
            name: 'DocumentDocInEvictManage',
            path: 'evict',
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'waiting-comment',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInWaitingCommentManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_WAITING-COMMENT',
                },
                name: 'DocumentDocInWaitingCommentManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInWaitingCommentDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'commented',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/manage/DocInCommentedManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-IN/DOCUMENT_DOC-IN_COMMENTED',
                },
                name: 'DocumentDocInCommentedManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-in/detail/DocumentInDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocInCommentedDetail',
                path: 'detail/:id',
              },
            ],
          },
        ],
      },

      {
        component: () =>
          import('@/apps/document/views/doc/doc-out/DocOutWrapper.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DOCUMENT_DOC-OUT',
          icon: 'open_in_browser',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_DOC-OUT',
        },
        name: 'DocumentDocOut',
        path: 'doc-out',
        children: [
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'draft',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/manage/DocOutDraftManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_DRAFT',
                },
                name: 'DocumentDocOutDraftManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/DocumentOutDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutDraftDetail',
                path: 'detail/:id',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/FormDocumentOut.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: true,
                },
                name: 'DocumentDocOutFormDocument',
                path: 'create',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/FormDocumentOut.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutUpdate',
                path: 'update/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'waiting-process',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/manage/DocOutWaitingProcessManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_WAITING-PROCESS',
                },
                name: 'DocumentDocOutWaitingProcessManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/DocumentOutWithProcessDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutWaitingProcessDetail',
                path: 'detail/:processId',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'specialist-processing',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/manage/DocOutSpecialistProcessingManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_SPECIALIST-PROCESSING',
                },
                name: 'DocumentDocOutSpecialistProcessingManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/DocumentOutDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocOutSpecialistProcessingDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'processing',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/manage/DocOutProcessingManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_PROCESSING',
                },
                name: 'DocumentDocOutProcessingManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/DocumentOutWithProcessDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutProcessingDetail',
                path: 'detail/:processId',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'waiting-proclaim',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/manage/DocOutWaitingProclaimManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_WAITING-PROCLAIM',
                },
                name: 'DocumentDocOutWaitingProclaimManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/PromulgateDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutWaitingProclaimDetail',
                path: 'detail/:id',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/PromulgateForm.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: true,
                },
                name: 'DocumentDocOutFormPromulgate',
                path: 'create',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/PromulgateForm.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutProclaimedUpdate',
                path: 'update/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'proclaimed',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/manage/DocOutProclaimedManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_PROCLAIMED',
                },
                name: 'DocumentDocOutProclaimedManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/PromulgateDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutProclaimedDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () =>
              import(
                '@/apps/document/views/doc/doc-out/manage/DocOutReceiveToKnowManage.vue'
              ),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_RECEIVE-TO-KNOW',
            },
            name: 'DocumentDocOutReceiveToKnowManage',
            path: 'receive-to-know',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/doc/doc-out/manage/DocOutEvictManage.vue'
              ),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_EVICT',
            },
            name: 'DocumentDocOutEvictManage',
            path: 'evict',
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'waiting-comment',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/manage/DocOutWaitingCommentManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_WAITING-COMMENT',
                },
                name: 'DocumentDocOutWaitingCommentManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/DocumentOutDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutWaitingCommentDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            path: 'commented',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/manage/DocOutCommentedManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_DOC-OUT/DOCUMENT_DOC-OUT_COMMENTED',
                },
                name: 'DocumentDocOutCommentedManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/doc-out/detail/DocumentOutDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentDocOutCommentedDetail',
                path: 'detail/:id',
              },
            ],
          },
        ],
      },

      {
        component: () =>
          import('@/apps/document/views/doc/submit/DocSubmitWrapper.vue'),
        meta: {
          requiredAuth: true,
          icon: 'assignment',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_SUBMIT',
        },
        name: 'DocumentSubmit',
        path: 'submit',
        children: [
          {
            path: '',
            redirect: { name: 'DocumentSubmitDraftManage' }
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentSubmitDraft',
            path: 'draft',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/manage/DocSubmitDraftManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_DRAFT',
                },
                name: 'DocumentSubmitDraftManage',
                path: '',
              },
              {
                component: () =>
                  import('@/apps/document/views/doc/submit/SubmitForm.vue'),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'CreateDocumentSubmitForm',
                path: 'create',
              },
              {
                component: () =>
                  import('@/apps/document/views/doc/submit/SubmitForm.vue'),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'UpdateDocumentSubmitForm',
                path: 'update/:id',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/DocSubmitDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentSubmitDraftDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentSubmitWaitingProcess',
            path: 'waiting-process',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/manage/DocSubmitWaitingProcessManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_WAITING-PROCESS',
                },
                name: 'DocumentSubmitWaitingProcessManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/DocSubmitProcessDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentSubmitWaitingProcessDetail',
                path: 'detail/:processId',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentSubmitProcessing',
            path: 'processing',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/manage/DocSubmitProcessingManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_PROCESSING',
                },
                name: 'DocumentSubmitProcessingManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/DocSubmitProcessDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentSubmitProcessingDetail',
                path: 'detail/:processId',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentSubmitSpecialistProcessing',
            path: 'specialist-processing',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/manage/DocSubmitSpecialistProcessingManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_SPECIALIST-PROCESSING',
                },
                name: 'DocumentSubmitSpecialistProcessingManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/DocSubmitDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentSubmitSpecialistProcessingDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentSubmitProcessed',
            path: 'processed',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/manage/DocSubmitProcessedManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_PROCESSED',
                },
                name: 'DocumentSubmitProcessedManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/DocSubmitProcessDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentSubmitProcessedDetail',
                path: 'detail/:processId',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentSubmitSpecialistProcessed',
            path: 'specialist-processed',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/manage/DocSubmitSpecialistProcessedManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_SPECIALIST-PROCESSED',
                },
                name: 'DocumentSubmitSpecialistProcessedManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/DocSubmitDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentSubmitSpecialistProcessedDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () =>
              import(
                '@/apps/document/views/doc/submit/manage/DocSubmitEvictManage.vue'
              ),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping:
                '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_EVICT',
            },
            name: 'DocumentSubmitEvictManage',
            path: 'evict',
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentSubmitWaitingComment',
            path: 'waiting-comment',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/manage/DocSubmitWaitingCommentManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_WAITING-COMMENT',
                },
                name: 'DocumentSubmitWaitingCommentManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/DocSubmitDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentSubmitWaitingCommentDetail',
                path: 'detail/:id',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentSubmitCommented',
            path: 'commented',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/manage/DocSubmitCommentedManage.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_SUBMIT/DOCUMENT_SUBMIT_COMMENTED',
                },
                name: 'DocumentSubmitCommentedManage',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/doc/submit/DocSubmitDetail.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  showInMenu: false,
                },
                name: 'DocumentSubmitCommentedDetail',
                path: 'detail/:id',
              },
            ],
          },
        ],
      },

      {
        component: () => import('@/apps/document/views/file/FileManager.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DOCUMENT_FILE',
          icon: 'folder',
          showInMenu: true,
        },
        name: 'DocumentFile',
        path: 'file',
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          menuCode: 'DOCUMENT_ADMIN_MANAGE',
          functionMapping: '/DOCUMENT/DOCUMENT_ADMIN_MANAGE',
          icon: 'archive',
          showInMenu: true,
        },
        name: 'AdminDocManager',
        path: 'admin-manage',
        children: [
          {
            component: () =>
              import(
                '@/apps/document/views/doc/admin-action/AdminDocInManager.vue'
              ),
            meta: {
              menuCode: 'DOCUMENT_ADMIN_MANAGE_ACTION',
              functionMapping:
                '/DOCUMENT/DOCUMENT_ADMIN_MANAGE/DOCUMENT_ADMIN_MANAGE_ACTION',
              requiredAuth: true,
              showInMenu: false,
            },
            name: 'AdminDocList',
            path: '',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/doc/admin-action/AdminDocInDetail.vue'
              ),
            meta: {
              // requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentAdminDocInDetail',
            path: 'detail/:id',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/doc/admin-action/AdminFormDocumentIn.vue'
              ),
            meta: {
              // requiredAuth: true,
              showInMenu: false,
            },
            name: 'DocumentAdminDocInUpdate',
            path: 'update/:id',
          },
        ],
      },

      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DOCUMENT_PROFILE',
          icon: 'photo_library',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_PROFILE',
        },
        name: 'DocumentProfile',
        path: 'profile',
      },

      {
        component: () => import('@/apps/document/views/report/ReportView.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DOCUMENT_REPORT',
          icon: 'insert_chart',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_REPORT',
        },
        name: 'DocumentReport',
        path: 'report',
        children: [],
      },

      {
        component: () => import('@/apps/document/views/book/BookView.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DOCUMENT_LOOKUP',
          icon: 'quick_reference_all',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_LOOKUP',
        },
        name: 'DocumentLookup',
        path: 'lookup',
        children: [
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            path: 'doc-in',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-in/DocInLookup.vue'
                  ),
                name: 'DocInLookup',
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_LOOKUP/DOCUMENT_LOOKUP_DOC-IN',
                },
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-in/detail/DocInLookupDetailDoc.vue'
                  ),
                name: 'DocInLookupDoc',
                path: 'detail/:id',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-in/detail/DocInLookupDetailProcess.vue'
                  ),
                name: 'DocInLookupProcess',
                path: 'detail/process/:processId',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            name: '',
            path: 'doc-out',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-out/DocOutLookup.vue'
                  ),
                name: 'DocOutLookup',
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_LOOKUP/DOCUMENT_LOOKUP_DOC-OUT',
                },
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-out/detail/DocOutLookupDetailDoc.vue'
                  ),
                name: 'DocOutLookupDoc',
                path: 'detail/:id',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-out/detail/DocOutLookupDetailProcess.vue'
                  ),
                name: 'DocOutLookupProcess',
                path: 'detail/process/:processId',
              },
            ],
          },
          {
            component: () => import('@/common/components/app/AppIndex.vue'),
            path: 'doc-submit',
            children: [
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-submit/DocSubmitLookup.vue'
                  ),
                meta: {
                  requiredAuth: true,
                  functionMapping:
                    '/DOCUMENT/DOCUMENT_LOOKUP/DOCUMENT_LOOKUP_DOC-SUBMIT',
                },
                name: 'DocSubmitLookup',
                path: '',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-submit/detail/DocSubmitLookupDetailDoc.vue'
                  ),
                name: 'DocSubmitLookupDoc',
                path: 'detail/:id',
              },
              {
                component: () =>
                  import(
                    '@/apps/document/views/book/component/doc-submit/detail/DocSubmitLookupDetailProcess.vue'
                  ),
                name: 'DocSubmitLookupProcess',
                path: 'detail/process/:processId',
              },
            ],
          },
        ],
      },

      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DOCUMENT_CATEGORY',
          icon: 'list',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_CATEGORY',
        },
        name: 'DocumentCategory',
        path: 'category',
        children: [
          {
            component: () =>
              import(
                '@/apps/document/views/categories/groupReceivingDocuments/GroupReceivingDocumentsManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_PARTY-POSITION',
              showInMenu: true,
            },
            name: 'DocumentCategoryGroupReceivingDocuments',
            path: 'group-receiving-documents',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/categories/partyPosition/PartyPositionManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_PARTY-POSITION',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_PARTY-POSITION',
            },
            name: 'DocumentCategoryPartyPosition',
            path: 'party-position',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/categories/docType/DocTypeManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_DOC-TYPE',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_DOC-TYPE',
            },
            name: 'DocumentCategoryDocType',
            path: 'document-type',
          },
          {
            component: () =>
              import('@/apps/document/views/categories/field/FieldManager.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_FIELD',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_FIELD',
            },
            name: 'DocumentCategoryField',
            path: 'field',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/categories/receivingMethod/ReceivingMethodManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_RECEIVING_METHOD',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_RECEIVING_METHOD',
            },
            name: 'DocumentCategoryReceivingMethod',
            path: 'receiving-method',
          },
          // {
          //   component: () =>
          //     import('@/apps/document/views/categories/book/BookManager.vue'),
          //   meta: {
          //     requiredAuth: true,
          //     menuCode: 'DOCUMENT_CATEGORY_BOOK',
          //     showInMenu: true,
          //     functionMapping:
          //       '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_BOOK',
          //   },
          //   name: 'DocumentCategoryBook',
          //   path: 'book',
          // },
          {
            component: () =>
              import(
                '@/apps/document/views/categories/orgOut/OrgOutManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_ORG_OUT',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_ORG_OUT',
            },
            name: 'DocumentCategoryOrgOut',
            path: 'org-out',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/categories/orgInterconnected/OrgInterconnectedManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_ORG_INTERCONNECTED',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_ORG_INTERCONNECTED',
            },
            name: 'DocumentCategoryOrgInterconnected',
            path: 'org-interconnected',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/categories/restDay/RestDayManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_REST_DAY',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_REST_DAY',
            },
            name: 'DocumentCategoryRestDay',
            path: 'rest-day',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/categories/placeOfEstablishment/PlaceOfEstablishmentManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_PLACE_OF_ESTABLISHMENT',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_CATEGORY/DOCUMENT_CATEGORY_PLACE_OF_ESTABLISHMENT',
            },
            name: 'DocumentCategoryPlaceOfEstablishment',
            path: 'place-of-establishment',
          },
          {
            component: () =>
              import(
                '@/apps/document/views/categories/fileType/FileTypeManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_CATEGORY_FILE_TYPE',
              showInMenu: true,
            },
            name: 'DocumentCategoryFileType',
            path: 'file-type',
          },
        ],
      },

      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DOCUMENT_ADMIN',
          icon: 'settings',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_ADMIN',
        },
        name: 'DocumentAdmin',
        path: 'admin',
        children: [
          {
            component: () =>
              import(
                '@/apps/document/views/organization/OrganizationManager.vue'
              ),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_ADMIN_ORGANIZATION',
              icon: 'corporate_fare',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_ADMIN/DOCUMENT_ADMIN_ORGANIZATION',
            },
            name: 'DocumentAdminOrganization',
            path: 'organization',
          },
          {
            component: () =>
              import('@/apps/document/views/admin/GeneralSettings.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_ADMIN_GENERAL_SETTINGS',
              icon: 'settings',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_ADMIN/DOCUMENT_ADMIN_GENERAL-CONFIG',
            },
            name: 'DocumentAdminGeneralSettings',
            path: 'general-settings',
          },
          {
            component: () =>
              import('@/apps/document/views/admin/DefaultFlowSetting.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_ADMIN_DEFAULT_FLOW_SETTING',
              icon: 'settings',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_ADMIN/DOCUMENT_ADMIN_DEFAULT-FLOW',
            },
            name: 'DocumentAdminDefaultFlowSetting',
            path: 'default-flow-settings',
          },
          {
            component: () =>
              import('@/apps/document/views/admin/OCRConfig.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'DOCUMENT_ADMIN_OCR_CONFIG',
              icon: 'settings',
              showInMenu: true,
            },
            name: 'DocumentAdminOCRConfig',
            path: 'ocr-config',
          },
        ],
      },

      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          icon: 'tune',
          showInMenu: true,
          functionMapping: '/DOCUMENT/DOCUMENT_DECLARE',
        },
        name: 'DocumentDeclare',
        path: 'declare',
        children: [
          {
            component: () =>
              import('@/apps/document/views/categories/book/BookManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'menu_book',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DECLARE/DOCUMENT_DECLARE_BOOK',
            },
            name: 'DocumentDeclareBook',
            path: 'book',
          },
          {
            component: () =>
              import('@/apps/document/views/admin/BookNumReserve.vue'),
            meta: {
              requiredAuth: true,
              icon: 'settings',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DECLARE/DOCUMENT_DECLARE_BOOK-NUM-RESERVE',
            },
            name: 'DocumentDeclareBookNumReserve',
            path: 'book-num-reserve',
          },
          {
            component: () =>
              import('@/apps/document/views/admin/DocTemplateManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'description',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DECLARE/DOCUMENT_DECLARE_FORM',
            },
            name: 'DocumentDeclareDocTemplateManager',
            path: 'doc-template-manager',
          },
          {
            component: () =>
              import('@/apps/document/views/admin/TextSymbolManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'description',
              showInMenu: true,
              functionMapping:
                '/DOCUMENT/DOCUMENT_DECLARE/DOCUMENT_DECLARE_FORM',
            },
            name: 'DocumentDeclareTextSymbolManager',
            path: 'text-symbol-manager',
          },
        ],
      },
    ],
  },
];

export default routes;
