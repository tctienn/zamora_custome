import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteRecordRaw } from 'vue-router';

import {
  countCCDocs,
  countCCDocsWithPriority,
  countCommentedDocs,
  countProcessedDocs,
  countProcessingDocs,
  countProcessingWithPriority,
  countRevokedDocs,
  countWaitingCommentDocs,
  countWaitingCommentWithPriority,
  countWaitingDocs,
  countWaitingWithPriority,
} from '@/apps/document/api/graphql/doc-in';
import {
  countDocOutCommented,
  countDocOutDrafts,
  countDocOutIssued,
  countDocOutProcessing,
  countDocOutProcessingWithPriority,
  countDocOutRevoked,
  countDocOutWaitingComments,
  countDocOutWaitingCommentsWithPriority,
  countDocOutWaitingIssued,
  countDocOutWaitingProcess,
  countDocOutWaitingWithPriority,
} from '@/apps/document/api/graphql/doc-out';
import {
  countDocSubmitCommented,
  countDocSubmitDrafts,
  countDocSubmitProcessed,
  countDocSubmitProcessing,
  countDocSubmitRevoked,
  countDocSubmitWaitingComment,
  countDocSubmitWaitingProcess,
} from '@/apps/document/api/graphql/doc-submit';
import type { DocOutSearch, DocSubmitSearch, SearchModel, } from '@/apps/document/model/doc/search';
import docRoutes from '@/apps/document/router';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';

type DocInMenu = MenuItem & {
    count?: number;
    countFn?: () => Promise<number> | undefined;
    to?: { name?: string; path?: string };
    countNormal?: number;
    countExpress?: number;
    countWithPriorityFn?: () =>
        | Promise<{ countNormal?: number; countExpress?: number }>
        | undefined;
};

type DocOutMenu = DocInMenu;
type DocSubmitMenu = DocInMenu;

export function useDocInMenuConfig(search: Ref<SearchModel | undefined>) {
  const { t } = useI18n();
  const store = useDocumentRolesStore();
  const { hasDocumentPermission } = store;
  const { userDeptRole } = storeToRefs(store);
  // const thisYearSearch = {
  //   searchTimeFrom: `${ new Date().getFullYear() }-01-01T00:00:00.000`,
  //   searchTimeTo: `${ new Date().getFullYear() }-12-31T23:59:59.999`,
  // };
  const allDocInMenus = ref<DocInMenu[]>([
    {
      label: t('document.menu.docIn.receive'),
      to: { name: 'DocumentDocInReceiveManage' },
      icon: 'inbox',
      countFn() {
        const {
          load,
          refetch
        } = countWaitingDocs(
          { ...search.value, },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: { ...search.value, },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countWaitingDocs as number) || 0);
      },
      countWithPriorityFn() {
        const {
          load,
          refetch
        } = countWaitingWithPriority(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then(
          (res) => (res?.countWaitingWithPriority as object) || undefined,
        );
      },
    },
    {
      label: t('document.menu.docIn.waitingProcess'),
      to: { name: 'DocumentDocInWaitingManage' },
      icon: 'acute',
      countFn() {
        const {
          load,
          refetch
        } = countWaitingDocs(
          { ...search.value, },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: { ...search.value, },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countWaitingDocs as number) || 0);
      },
      countWithPriorityFn() {
        const {
          load,
          refetch
        } = countWaitingWithPriority(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then(
          (res) => (res?.countWaitingWithPriority as object) || undefined,
        );
      },
    },
    {
      label: t('document.menu.docIn.processing'),
      to: { name: 'DocumentDocInProcessingManage' },
      icon: 'stylus_note',
      countFn() {
        const {
          load,
          refetch
        } = countProcessingDocs(
          { ...search.value, },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: { ...search.value, },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countProcessingDocs as number) || 0);
      },
      countWithPriorityFn() {
        const {
          load,
          refetch
        } = countProcessingWithPriority(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then(
          (res) => (res?.countProcessingWithPriority as object) || undefined,
        );
      },
    },
    {
      label: t('document.menu.docIn.processing'),
      to: { name: 'DocumentDocInClerkProcessingManage' },
      icon: 'stylus_note',
      countFn() {
        const {
          load,
          refetch
        } = countProcessingDocs(
          { ...search.value, },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: { ...search.value, },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countProcessingDocs as number) || 0);
      },
    },
    {
      label: t('document.menu.docIn.processed'),
      to: { name: 'DocumentDocInProcessedManage' },
      icon: 'task_alt',
      countFn() {
        const {
          load,
          refetch
        } = countProcessedDocs(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countProcessedDocs as number) || 0);
      },
    },
    {
      label: t('document.menu.docIn.processed'),
      to: { name: 'DocumentDocInClerkProcessedManage' },
      icon: 'task_alt',
      countFn() {
        const {
          load,
          refetch
        } = countProcessedDocs(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countProcessedDocs as number) || 0);
      },
    },
    {
      label: t('document.menu.docIn.receiveToKnow'),
      to: { name: 'DocumentDocInReceiveToKnow' },
      icon: 'sell',
      countFn() {
        const {
          load,
          refetch
        } = countCCDocs(search.value, userDeptRole.value);
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countCCDocs as number) || 0);
      },
      countWithPriorityFn() {
        const {
          load,
          refetch
        } = countCCDocsWithPriority(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countCCDocsWithPriority as object) || undefined);
      },
    },
    {
      label: t('document.menu.docIn.evict'),
      to: { name: 'DocumentDocInEvictManage' },
      icon: 'undo',
      countFn() {
        const {
          load,
          refetch
        } = countRevokedDocs(
          { ...search.value, },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: { ...search.value, },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countRevokedDocs as number) || 0);
      },
    },
    {
      label: t('document.menu.docIn.waitingComment'),
      to: { name: 'DocumentDocInWaitingCommentManage' },
      icon: 'chat_bubble',
      countFn() {
        const {
          load,
          refetch
        } = countWaitingCommentDocs(
          { ...search.value, },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: { ...search.value, },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countWaitingCommentDocs as number) || 0);
      },
      countWithPriorityFn() {
        const {
          load,
          refetch
        } = countWaitingCommentWithPriority(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then(
          (res) =>
            (res?.countWaitingCommentWithPriority as object) || undefined,
        );
      },
    },
    {
      label: t('document.menu.docIn.commented'),
      to: { name: 'DocumentDocInCommentedManage' },
      icon: 'chat',
      countFn() {
        const {
          load,
          refetch
        } = countCommentedDocs(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countCommentedDocs as number) || 0);
      },
    },
  ]);

  const filteredDocInMenus = computed(() =>
    allDocInMenus.value.filter((m) => {
      if (m.to?.name) {
        const route = findRouter(docRoutes, m.to.name);
        return route?.meta?.functionMapping
          ? hasDocumentPermission(
            (route?.meta?.functionMapping as string) + '/',
          )
          : true;
      }
      return true;
    }),
  );

  function updateCount(name: string, count: number) {
    allDocInMenus.value = allDocInMenus.value.map((m) => {
      if (m.to?.name === name) {
        return {
          ...m,
          count,
        };
      }
      return m;
    });
  }

  function updateCountWithPriority(
    name: string,
    countNormal: number,
    countExpress: number,
  ) {
    allDocInMenus.value = allDocInMenus.value.map((m) => {
      if (m.to?.name === name) {
        return {
          ...m,
          countNormal,
          countExpress,
        };
      }
      return m;
    });
  }

  return {
    filteredDocInMenus,
    updateCount,
    updateCountWithPriority,
  };
}

export function useDocOutMenuConfig(search: Ref<DocOutSearch | undefined>) {
  const { t } = useI18n();
  const store = useDocumentRolesStore();
  const { userDeptRole } = storeToRefs(store);
  const { hasDocumentPermission } = store;
  const thisYearSearch = {
    searchTimeFrom: `${new Date().getFullYear()}-01-01T00:00:00.000`,
    searchTimeTo: `${new Date().getFullYear()}-12-31T23:59:59.999`,
  };
  const allDocOutMenus = ref<DocOutMenu[]>([
    {
      label: t('document.menu.docOut.draft'),
      to: { name: 'DocumentDocOutDraftManage' },
      icon: 'contract_edit',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutDrafts(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutDrafts as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.waitingProcess'),
      to: { name: 'DocumentDocOutWaitingProcessManage' },
      icon: 'acute',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutWaitingProcess(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutWaitingProcess as number) || 0);
      },
      countWithPriorityFn() {
        const {
          load,
          refetch
        } = countDocOutWaitingWithPriority(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then(
          (res) => (res?.countDocOutWaitingWithPriority as object) || undefined,
        );
      },
    },
    {
      label: t('document.menu.docOut.processing'),
      to: { name: 'DocumentDocOutProcessingManage' },
      icon: 'stylus_note',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutProcessing(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutProcessing as number) || 0);
      },
      countWithPriorityFn() {
        const {
          load,
          refetch
        } = countDocOutProcessingWithPriority(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then(
          (res) =>
            (res?.countDocOutProcessingWithPriority as object) || undefined,
        );
      },
    },
    {
      label: t('document.menu.docOut.processing'),
      to: { name: 'DocumentDocOutSpecialistProcessingManage' },
      icon: 'stylus_note',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutProcessing(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutProcessing as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.waitingProclaim'),
      to: { name: 'DocumentDocOutWaitingProclaimManage' },
      icon: 'acute',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutWaitingIssued(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutWaitingIssued as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.proclaimed'),
      to: { name: 'DocumentDocOutProclaimedManage' },
      icon: 'mark_email_read',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutIssued(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutIssued as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.evict'),
      to: { name: 'DocumentDocOutEvictManage' },
      icon: 'undo',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutRevoked(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutRevoked as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.waitingComment'),
      to: { name: 'DocumentDocOutWaitingCommentManage' },
      icon: 'mark_chat_unread',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutWaitingComments(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutWaitingComments as number) || 0);
      },
      countWithPriorityFn() {
        const {
          load,
          refetch
        } = countDocOutWaitingCommentsWithPriority(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then(
          (res) =>
            (res?.countDocOutWaitingCommentsWithPriority as object)
                        || undefined,
        );
      },
    },
    {
      label: t('document.menu.docOut.commented'),
      to: { name: 'DocumentDocOutCommentedManage' },
      icon: 'chat',
      countFn() {
        const {
          load,
          refetch
        } = countDocOutCommented(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocOutCommented as number) || 0);
      },
    },
  ]);

  const filteredDocOutMenus = computed(() =>
    allDocOutMenus.value.filter((m) => {
      if (m.to?.name) {
        const route = findRouter(docRoutes, m.to.name);
        return route?.meta?.functionMapping
          ? hasDocumentPermission(
            (route?.meta?.functionMapping as string) + '/',
          )
          : true;
      }
      return true;
    }),
  );

  function updateCount(name: string, count: number) {
    allDocOutMenus.value = allDocOutMenus.value.map((m) => {
      if (m.to?.name === name) {
        return {
          ...m,
          count,
        };
      }
      return m;
    });
  }

  function updateCountWithPriority(
    name: string,
    countNormal: number,
    countExpress: number,
  ) {
    allDocOutMenus.value = allDocOutMenus.value.map((m) => {
      if (m.to?.name === name) {
        return {
          ...m,
          countNormal,
          countExpress,
        };
      }
      return m;
    });
  }

  return {
    filteredDocOutMenus,
    updateCount,
    updateCountWithPriority,
  };
}

export function useDocSubmitMenuConfig(
  search: Ref<DocSubmitSearch | undefined>,
) {
  const { t } = useI18n();
  const store = useDocumentRolesStore();
  const { userDeptRole } = storeToRefs(store);
  const { hasDocumentPermission } = store;
  const thisYearSearch = {
    searchTimeFrom: `${new Date().getFullYear()}-01-01T00:00:00.000`,
    searchTimeTo: `${new Date().getFullYear()}-12-31T23:59:59.999`,
  };
  const allDocSubmitMenus = ref<DocSubmitMenu[]>([
    {
      label: t('document.menu.docOut.draft'),
      to: { name: 'DocumentSubmitDraftManage' },
      icon: 'contract_edit',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitDrafts(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocSubmitDrafts as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.waitingProcess'),
      to: { name: 'DocumentSubmitWaitingProcessManage' },
      icon: 'acute',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitWaitingProcess(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocSubmitWaitingProcess as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.processing'),
      to: { name: 'DocumentSubmitProcessingManage' },
      icon: 'stylus_note',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitProcessing(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocSubmitProcessing as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.processing'),
      to: { name: 'DocumentSubmitSpecialistProcessingManage' },
      icon: 'stylus_note',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitProcessing(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocSubmitProcessing as number) || 0);
      },
    },
    {
      label: t('document.menu.docIn.processed'),
      to: { name: 'DocumentSubmitProcessedManage' },
      icon: 'task_alt',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitProcessed(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocSubmitProcessed as number) || 0);
      },
    },
    {
      label: t('document.menu.docIn.processed'),
      to: { name: 'DocumentSubmitSpecialistProcessedManage' },
      icon: 'task_alt',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitProcessed(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocSubmitProcessed as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.evict'),
      to: { name: 'DocumentSubmitEvictManage' },
      icon: 'undo',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitRevoked({
          ...search.value,
          ...thisYearSearch
        },
        userDeptRole.value);
        return (load() || refetch({
          search: {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole: userDeptRole.value
        }))?.then(
          (res) => (res?.countDocSubmitRevoked as number) || 0,
        );
      },
    },
    {
      label: t('document.menu.docOut.waitingComment'),
      to: { name: 'DocumentSubmitWaitingCommentManage' },
      icon: 'mark_chat_unread',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitWaitingComment(
          {
            ...search.value,
            ...thisYearSearch
          },
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: {
                        ...search.value,
                        ...thisYearSearch
                      },
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocSubmitWaitingComment as number) || 0);
      },
    },
    {
      label: t('document.menu.docOut.commented'),
      to: { name: 'DocumentSubmitCommentedManage' },
      icon: 'chat',
      countFn() {
        const {
          load,
          refetch
        } = countDocSubmitCommented(
          search.value,
          userDeptRole.value,
        );
        return (
          load()
                    || refetch({
                      search: search.value,
                      userDeptRole: userDeptRole.value,
                    })
        )?.then((res) => (res?.countDocSubmitCommented as number) || 0);
      },
    },
  ]);
  const filteredDocSubmitMenus = computed(() =>
    allDocSubmitMenus.value.filter((m) => {
      if (m.to?.name) {
        const route = findRouter(docRoutes, m.to.name);
        return route?.meta?.functionMapping
          ? hasDocumentPermission(
            (route?.meta?.functionMapping as string) + '/',
          )
          : true;
      }
      return true;
    }),
  );

  function updateCount(name: string, count: number) {
    allDocSubmitMenus.value = allDocSubmitMenus.value.map((m) => {
      if (m.to?.name === name) {
        return {
          ...m,
          count,
        };
      }
      return m;
    });
  }

  return {
    filteredDocSubmitMenus,
    updateCount,
  };
}

export function findRouter(
  routes: RouteRecordRaw[],
  name: string,
): RouteRecordRaw | undefined {
  const find = routes.find((route) => route.name === name);
  if (find) {
    return find;
  }
  if (routes.length > 0) {
    for (const route of routes) {
      if (route.children) {
        const findChild = findRouter(route.children, name);
        if (findChild) {
          return findChild;
        }
      }
    }
  }
  return find;
}
