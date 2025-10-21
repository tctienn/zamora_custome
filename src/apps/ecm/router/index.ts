import type { RouteRecordRaw } from 'vue-router';

const MY_DOCUMENT_CODE = 'ECM_PERSONAL_DOCUMENTS_MY-DOCUMENTS';
const ECM_GROUP_CODE = 'ECM_GROUP-DOCUMENTS';

/**
 * - To config a route not show in menu, set showInMenu: false
 * - To config a route not show in breadcrumb, set showInBreadcrumb: false
 */
const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/ecm/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'ECM',
      functionMapping: '/ECM'
    },
    name: 'Ecm',
    path: '/ecm',
    children: [
      {
        component: () => import('@/apps/ecm/views/components/view-file/FileViewer.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false
        },
        name: 'EcmFileViewer',
        path: 'file/:fileId',
      },
      {
        component: () => import('@/apps/ecm/views/components/view-file/ViewFileVersion.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false
        },
        name: 'ViewFileVersion',
        path: 'fileVersion/:fileId',
      },
      {
        component: () => import('@/apps/ecm/views/components/share/EcmSharedFile.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false
        },
        name: 'EcmSharedFile',
        path: 'shared-file/:fileId',
      },
      {
        component: () => import('@/apps/ecm/views/components/share/EcmSharedFolder.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false
        },
        name: 'EcmSharedFolder',
        path: 'shared-folder/:folderId',
      },
      {
        component: () => import('@/common/views/search/SearchResult.vue'),
        meta: {
          requiredAuth: true,
          icon: 'text_snippet',
          showInMenu: false
        },
        name: 'EcmSearchResult',
        path: 'search',
      },
      {
        component: () => import('@/apps/ecm/views/components/chat-attachments/ChatAttachmentViewer.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false
        },
        name: 'ChatAttachmentViewer',
        path: 'personal-documents/attachments/:attachmentId',
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'ECM_CONFIG',
          isModule: true,
          icon: 'settings',
          functionMapping: '/ECM/ECM_CONFIG'
        },
        name: 'EcmConfig',
        path: 'config',
        children: [
          {
            component: () => import('@/apps/ecm/views/group/GroupManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'group',
              showInMenu: true,
              menuCode: 'ECM_CONFIG_GROUP-MANAGER',
              functionMapping: '/ECM/ECM_CONFIG/ECM_CONFIG_GROUP-MANAGER'
            },
            name: 'EcmGroupManager',
            path: 'group-manager',
          },
          {
            component: () => import('@/apps/ecm/views/capacity/CapacityGeneral.vue'),
            meta: {
              requiredAuth: true,
              icon: 'apps',
              showInMenu: true,
              menuCode: 'ECM_CONFIG-CAPACITY',
              functionMapping: '/ECM/ECM_CONFIG/ECM_CONFIG-CAPACITY/'
            },
            name: 'EcmConfigCapacity',
            path: 'capacityConfig'
          },
          {
            component: () => import('@/apps/ecm/views/config/EcmAdminTrash.vue'),
            meta: {
              requiredAuth: true,
              icon: 'delete_forever',
              showInMenu: true,
              menuCode: 'ECM_ADMIN-TRASH',
              functionMapping: '/ECM/ECM_CONFIG/ECM_ADMIN-TRASH'
            },
            name: 'EcmAdminTrash',
            path: 'admin-trash',
          }
        ]
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'ECM_PERSONAL-DOCUMENTS',
          isModule: true,
          icon: 'clinical_notes',
          functionMapping: '/ECM/ECM_PERSONAL-DOCUMENTS'
        },
        name: 'EcmPersonalDocuments',
        path: 'personal-documents',
        children: [
          {
            component: () => import('@/apps/ecm/views/personal-documents/MyDocument.vue'),
            meta: {
              requiredAuth: true,
              icon: 'menu_book',
              showInMenu: true,
              menuCode: MY_DOCUMENT_CODE,
              functionMapping: '/ECM/ECM_PERSONAL-DOCUMENTS/ECM_PERSONAL_DOCUMENTS_MY-DOCUMENTS'
            },
            name: 'EcmPersonalDocumentsMyDocuments',
            path: 'my-documents',
          },
          {
            component: () => import('@/apps/ecm/views/personal-documents/RecentDocuments.vue'),
            meta: {
              requiredAuth: true,
              icon: 'history',
              showInMenu: true,
              menuCode: 'ECM_PERSONAL_DOCUMENTS_RECENT-DOCUMENTS',
              functionMapping: '/ECM/ECM_PERSONAL-DOCUMENTS/ECM_PERSONAL_DOCUMENTS_RECENT-DOCUMENTS'
            },
            name: 'EcmPersonalDocumentsRecentDocuments',
            path: 'recent-documents',
          },
          {
            component: () => import('@/apps/ecm/views/personal-documents/SharedDocuments.vue'),
            meta: {
              requiredAuth: true,
              icon: 'share',
              showInMenu: true,
              menuCode: 'ECM_PERSONAL_DOCUMENTS_SHARED-DOCUMENTS',
              functionMapping: '/ECM/ECM_PERSONAL-DOCUMENTS/ECM_PERSONAL_DOCUMENTS_SHARED-DOCUMENTS'
            },
            name: 'EcmPersonalDocumentsSharedDocuments',
            path: 'shared-documents',
          },
          {
            component: () => import('@/apps/ecm/views/personal-documents/PersonalAttachments.vue'),
            meta: {
              requiredAuth: true,
              icon: 'attach_file',
              showInMenu: true,
              menuCode: 'ECM_PERSONAL_DOCUMENTS_ATTACHMENTS',
              functionMapping: '/ECM/ECM_PERSONAL-DOCUMENTS/ECM_PERSONAL_DOCUMENTS_ATTACHMENTS'
            },
            name: 'EcmPersonalDocumentsAttachments',
            path: 'attachments',
          },
          {
            component: () => import('@/apps/ecm/views/personal-documents/PersonTrash.vue'),
            meta: {
              requiredAuth: true,
              icon: 'delete',
              showInMenu: true,
              menuCode: 'ECM_PERSONAL_DOCUMENTS_RECYCLE-BIN',
              functionMapping: '/ECM/ECM_PERSONAL-DOCUMENTS/ECM_PERSONAL_DOCUMENTS_RECYCLE-BIN'
            },
            name: 'EcmPersonalDocumentsRecycleBin',
            path: 'trash',
          }
        ]
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: ECM_GROUP_CODE,
          isModule: true,
          icon: 'groups',
          // functionMapping: '/ECM/ECM_GROUP-DOCUMENTS'
        },
        name: 'EcmGroup',
        path: 'group',
        children: [
          {
            path: '',
            meta: { requiredAuth: true, },
            name: 'EcmGroups',
            component: () => import('@/apps/ecm/views/group-documents/EcmGroups.vue'),
          },
          {
            path: ':id',
            meta: {
              requiredAuth: true,
              showInBreadcrumb: false,
            },
            name: 'EcmGroupMainPage',
            component: () => import('@/apps/ecm/views/group-documents/GroupMainPage.vue'),
          },
          // {
          //   path: ':id',
          //   meta: { requiredAuth: true, },
          //   name: 'EcmGroupDocument',
          //   component: () => import('@/apps/ecm/views/group-documents/GroupDocument.vue'),
          // },
          {
            path: ':id/trash',
            meta: {
              requiredAuth: true,
              showInBreadcrumb: false,
            },
            component: () => import('@/apps/ecm/views/group-documents/GroupTrash.vue'),
          }
        ]
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: ECM_GROUP_CODE,
          isModule: true,
          icon: 'groups',
          // functionMapping: '/ECM/ECM_GROUP-DOCUMENTS'
        },
        name: 'EcmAlbum',
        path: 'album',
        children: [
        
          {
            path: '',
            meta: { requiredAuth: true, },
            name: 'EcmAlbum',
            component: () => import('@/apps/ecm/views/album/AlbumManage.vue')
          },
            {
            path: ':idFolder',
            meta: { requiredAuth: true, },
            name: 'EcmAlbumDetail',
            component: () => import('@/apps/ecm/views/album/AlbumManage.vue')
          },
        ]
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'DOCUMENT',
          isModule: true,
          icon: 'business_center',
          functionMapping: '/ECM/DOCUMENT'
        },
        name: 'Document',
        path: 'document',
        children: [
          {
            component: () => import('@/apps/ecm/views/document/DocumentFromManage.vue'),
            meta: {
              requiredAuth: true,
              icon: 'arrow_forward',
              showInMenu: true,
              menuCode: 'ECM_DOCUMENT-FROM',
              functionMapping: '/ECM/DOCUMENT/ECM_DOCUMENT-FROM/'
            },
            name: 'EcmDocumentFrom',
            path: 'ecmDocumentFrom',
          },
          {
            component: () => import('@/apps/ecm/views/document/FormDocumentFrom.vue'),
            meta: {
              requiredAuth: true,
              icon: '',
              functionMapping: '/ECM/DOCUMENT/ECM_DOCUMENT-FROM/CREATE'
            },
            name: 'EcmDocumentFrom/CREATE',
            path: 'createDocumentFrom',
          },
          {
            component: () => import('@/apps/ecm/views/document/DocumentToManage.vue'),
            meta: {
              requiredAuth: true,
              icon: 'arrow_back',
              showInMenu: true,
              menuCode: 'ECM_DOCUMENT-TO',
              functionMapping: '/ECM/DOCUMENT/ECM_DOCUMENT-TO/'
            },
            name: 'EcmDocumentTo',
            path: 'ecmDocumentTo',
          },
          {
            component: () => import('@/apps/ecm/views/document/FormDocumentTo.vue'),
            meta: {
              requiredAuth: true,
              icon: '',
              functionMapping: '/ECM/DOCUMENT/ECM_DOCUMENT-TO/CREATE'
            },
            name: 'EcmDocumentTo/CREATE',
            path: 'createDocumentTo',
          },
        ]
      },
    ]
  }
];

export { routes as default, ECM_GROUP_CODE, MY_DOCUMENT_CODE };
