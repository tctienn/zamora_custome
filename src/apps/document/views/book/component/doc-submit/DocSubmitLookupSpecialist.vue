<template>
  <DocSubmitManageWrapper
    v-model:selected-document='selectedDocument'
    :doc-outs='docSubmits'
    :fields='searchFields'
    :loading='loading'
    :menu-actions='documentActions'
    :total='total'>
    <template #list>
      <DocSubmitEditorList
        v-model:selected-document='selectedDocument'
        :doc-submits='docSubmits'
        :loading='loading'
        :total='total'/>
    </template>
  </DocSubmitManageWrapper>
  <Dialog
    v-model:visible='visibleDialog'
    :header='"Chọn người/phòng ban"'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @click.stop>
    <UserSelectMoreDetail
      v-model='selectedUser'
      class='w-full'
      display-mode='tree'
      :org-type='userDeptRole.type'
      :remove-empty-dep='false'
      selection-mode='multiple'
      style='height: 70vh'
      :users='allUsers'/>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click='visibleDialog = false'/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='saveOptionsReceiveInIds'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import type { AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent } from 'primevue/autocomplete';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import { computed, inject, markRaw, onMounted, type PropType, provide, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { searchAllDocSubmit } from '@/apps/document/api/graphql/doc-submit';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import { getListDocSubmitAboutByKeyWord } from '@/apps/document/api/graphql/searchAdvanced';
import { isDate } from '@/apps/document/helpers/composable/utils';
import { modelSearchFieldSubmitKey } from '@/apps/document/helpers/injectionKeys';
import { SECURITIES, TYPE_PRESENTATION, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOC_SUBMIT_STATUSES, type DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { DocSubmitSearch } from '@/apps/document/model/doc/search';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocSubmitEditorList from '@/apps/document/views/doc/submit/list/DocSubmitEditorList.vue';
import DocSubmitManageWrapper from '@/apps/document/views/doc/submit/manage/DocSubmitManageWrapper.vue';
import UserSelectMoreDetail from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetail.vue';
import AutoCompleteEmptyTemplate from '@/common/components/app/search/AutoCompleteEmptyTemplate.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Edge } from '@/common/model/page';
import { Direction, type Order, type Pageable } from '@/common/model/query';
import type { SearchFields } from '@/common/model/search';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const documentActions = [
  DocumentAction.COPY,
  DocumentAction.PROCLAIM,
  DocumentAction.ASK_FOR_OPINION,
  DocumentAction.CREATE_DRAFT,
];
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocSubmit | undefined>,
  default: undefined,
});
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
});
const search = reactive<DocSubmitSearch>({});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { allUsers } = storeToRefs(useUserMoreInfoStore());
const { fetchAllUsers } = useUserMoreInfoStore();
const {
  result: resultDoc,
  loading,
  load,
  refetch,
} = searchAllDocSubmit(search, userDeptRole.value, pageable);

const docSubmits = computed(() =>
  resultDoc.value?.searchAllDocSubmit.edges.map((edge: Edge<DocSubmit>) => {
    return edge.node;
  }),
);
const total = computed(() => resultDoc.value?.searchAllDocSubmit.totalCount);
const updateCount = inject('updateCount', (countField: string, count: number) => void {});
watch(total, (value) => {
  updateCount('countDocSubmit', value);
});

function updateSearchField(field: keyof DocSubmitSearch, value: any) {
  search[field] = value;
}

function updatePageable(page: number) {
  pageable.page = page;
}

function updateOrder(orders: Order[]) {
  pageable.sort = orders;
}

function goToDetailRoute(router: Router, docSubmit: DocSubmit) {
  router.push({
    name: 'DocSubmitLookupDoc',
    params: { id: docSubmit.id }

  });
}

provide(modelSearchFieldSubmitKey, search);
provide('updateSearchField', updateSearchField);
provide('updatePageable', updatePageable);
provide('updateOrder', updateOrder);
provide('goToDetailRoute', goToDetailRoute);
provide('afterAction', () => refetch());
provide('isFlowFinish', true);
provide<Order[]>('sortFields', [
  {
    property: 'createdTime',
    direction: Direction.DESC,
  }
]);
///For suggest
const visibleDialog = ref(false);
const selectedUser = ref<(UserDeptRoleInput & { id: string; })[]>([]);
const { moment } = useMoment();
const searchTerm = inject('searchTerm', ref(''));
watch(searchTerm, () => {
  updateSearchField('keyword', searchTerm.value);
});
const { submit, model } = storeToRefs(useGlobalSearchStore());
watch(submit, () => {
  mapModel(model.value);
});

function mapModel(model: DocSubmitSearch) {
  const keys = Object.keys(model);
  if (keys.length === 0) {
    Object.keys(search).forEach(key => {
      if (!['searchTimeFrom', 'searchTimeTo'].includes(key)) {
        delete search[key as keyof DocSubmitSearch];
      }
    });
  }
  for (const key in model) {
    if (Object.prototype.hasOwnProperty.call(model, key)) {
      const value = model[key as keyof DocSubmitSearch];
      updateSearchField(
          key as keyof DocSubmitSearch,
          isDate(value)
            ? moment(value).format(DateTimeFormat.ISO_LOCAL_DATE)
            : value,
      );
    }
  }
}
const minDate = computed(() => new Date(search?.searchTimeFrom || 0));
const maxDate = computed(() => new Date(search?.searchTimeTo || 999999999));

type About = {
  about: string
}
const suggestAbouts = ref<About[]>([]);
const pageAbout = reactive<Pageable>({
  page: 0,
  size: 99999999
});
const {
  load: loadAbout,
  refetch: refetchAbout,
  onResult: onResultAbout,
} = getListDocSubmitAboutByKeyWord(model.value.publisherName, pageAbout);
onResultAbout((res) => {
  if (res) {
    suggestAbouts.value = res.data?.getListDocSubmitAboutByKeyWord
      ?.edges.map((e: Edge<About>) => e.node);
  }
});

const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const { onResult: getOrgResult } = getOrgOut();
getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut;
});

const calendarProps = {
  minDate,
  maxDate,
  showIcon: true,
  iconDisplay: 'input',
};

const autoCompleteListeners = (field: string) => ({
  'item-select': (event: AutoCompleteItemSelectEvent) => {
    model.value[field] = event.value[field];
  },
  complete: (event: AutoCompleteCompleteEvent) => {
    const keyword = event.query.trim();
    loadFunctionForField(field, {
      keyword,
      page: getPageForField(field)
    })
    || refetchFunctionForField(field, {
      keyword,
      page: getPageForField(field)
    });
  },
});
const searchFields = ref<SearchFields>({
  status: {
    label: t('document.doc.advancedSearch.status'),
    col: 6,
    component: markRaw(Dropdown),
    props: {
      pt: { input: 'font-semibold' },
      showClear: true,
      options: DOC_SUBMIT_STATUSES,
      optionLabel: (data: Record<string, any>) => t(data?.label || ''),
      optionValue: 'value',
    },
    labelStyle: { 'font-weight': 600 },
  },
  docType: {
    label: t('document.doc.advancedSearch.docTypeSubmit'),
    col: 6,
    optionsDropdown: TYPE_PRESENTATION.map(e => ({
      name: e.label,
      id: e.value
    })),
    isMultiSelect: true,
  },
  about: {
    label: t('document.doc.advancedSearch.about'),
    col: 12,
    component: markRaw(AutoCompleteEmptyTemplate),
    props: {
      suggestions: suggestAbouts,
      completeOnFocus: true,
      autoOptionFocus: true,
      optionLabel: 'about',
      delay: 500,
      pt: { input: 'w-full', }
    },
    listener: autoCompleteListeners('about'),
  },
  // issuerDeptId: {
  //   label: 'Đơn vị ban hành',
  //   col: 6,
  //   component: markRaw(OrganizationTree),
  //   props: {
  //     'org-type': userDeptRole.value.type,
  //     'selection-mode': 'single',
  //     filter: true
  //   },
  // },
  securityCodes: {
    label: t('document.doc.advancedSearch.securityCode'),
    col: 6,
    component: markRaw(Dropdown),
    props: {
      showClear: true,
      options: SECURITIES,
      optionLabel: 'label',
      optionValue: 'value',
    },
  },
  createDateFrom: {
    label: t('Ngày tạo (Từ ngày)'),
    col: 6,
    component: markRaw(Calendar),
    props: calendarProps,
  },
  createDateTo: {
    label: t('Ngày tạo (Đến ngày)'),
    col: 6,
    component: markRaw(Calendar),
    props: calendarProps,
  },
  // receiveInIds: {
  //   label: t('Nơi nhận bên trong'),
  //   col: 6,
  //   component: markRaw(TemplateChips),
  //   props: {
  //     optionLabel: (data: any) => data.userName || data.deptName,
  //     optionValue: (data: any) => data.userId || data.deptId,
  //     options: selectedUser
  //   },
  //   listener: { click: () => visibleDialog.value = true }
  // },
  // receiveOutIds: {
  //   label: t('Nơi nhận bên ngoài'),
  //   col: 6,
  //   component: markRaw(MultiSelect),
  //   props: {
  //     'option-label': 'orgOutName',
  //     'option-value': 'id',
  //     'options': orgOuts,
  //     showClear: true,
  //     filter: true
  //   },
  // },
  //
  // handler: {
  //   label: t('document.doc.advancedSearch.handler'),
  //   type: String,
  //   col: 6,
  // },
  // signerName: {
  //   label: t('document.doc.advancedSearch.signer'),
  //   col: 6,
  //   component: markRaw(AutoCompleteEmptyTemplate),
  //   props: {
  //     suggestions: suggestSigners,
  //     completeOnFocus: true,
  //     autoOptionFocus: true,
  //     optionLabel: 'signerName',
  //     delay: 500,
  //     pt: { input: 'w-full', }
  //   },
  //   listener: autoCompleteListeners('signerName'),
  // },
  //
  // areaId: {
  //   label: t('document.doc.advancedSearch.area'),
  //   type: String,
  //   col: 6,
  //   optionsDropdown: fields,
  //   isMultiSelect: true,
  // },

});
onMounted(() => {
  load();
  fetchAllUsers();
});

function loadFunctionForField(field: string, params: any) {
  switch (field) {
  case 'about':
    return loadAbout(null, params);
  }
}

function refetchFunctionForField(field: string, params: any) {
  switch (field) {
  case 'about':
    return refetchAbout(params);
  }
}

function getPageForField(field: string) {
  switch (field) {
  case 'about':
    return pageAbout;
  }
}

function saveOptionsReceiveInIds() {
  model.value.receiveInIds = selectedUser.value.map(e => e.userId || e.deptId || undefined).filter(e => e);
  visibleDialog.value = false;
}
</script>

<style scoped>

</style>