<template>
  <div
    class='border-300 border-bottom-1 flex gap-1 justify-content-between p-1 surface-0'
    style='min-height: 39px'>
    <DocOutButtonActions
      v-if='showActionButton'
      :key='docOutButtonKey'
      :doc='selectedDocument'
      :menu-actions='menuActions'/>
  </div>
  <div
    class='flex gap-2 mt-2'
    style='height: calc(100vh - 11.5rem)'>
    <div
      class='h-full overflow-x-hidden overflow-y-auto p-0'
      style='width: 36rem'>
      <slot name='list'>
        <DocOutList
          v-model:selectedDocument='selectedDocument'
          :doc-outs='docOuts'
          :loading='loading'
          :total='total'/>
      </slot>
    </div>
    <div class='col h-full overflow-x-auto p-0'>
      <div
        class='flex flex-column gap-1'
        style='height: calc(100vh - 11.5rem)'>

        <slot
          v-if='selectedDocument'
          name='preview'
          :selected-document='selectedDocument'>
          <DocOutPreview
            v-if='selectedDocument'
            :model='selectedDocument'/>
        </slot>

        <EmptyDocSelectedPreview v-else/>
      </div>
    </div>
  </div>

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
import { isDate } from 'lodash';
import { storeToRefs } from 'pinia';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import { computed, inject, markRaw, onMounted, onUnmounted, type PropType, provide, ref, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllDocType } from '@/apps/document/api/graphql/doc-type';
import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import { PRIORITIES, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocOutSearch } from '@/apps/document/model/doc/search';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import TemplateChips from '@/apps/document/views/book/component/TemplateChips.vue';
import { DocumentAction } from '@/apps/document/views/doc/doc-in/action/action';
import DocOutButtonActions from '@/apps/document/views/doc/doc-out/action/DocOutButtonActions.vue';
import DocOutList from '@/apps/document/views/doc/doc-out/list/DocOutList.vue';
import DocOutPreview from '@/apps/document/views/doc/doc-out/preview/DocOutPreview.vue';
import EmptyDocSelectedPreview from '@/apps/document/views/doc/EmptyDocSelectedPreview.vue';
import UserSelectMoreDetail from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetail.vue';
import { useDocumentActions } from '@/common/composables/useDocumentActions';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { SearchModel } from '@/common/model/search';
import { useGlobalSearchStore } from '@/common/store/search';

const props = defineProps({
  fields: {
    type: Object as PropType<any>,
    default: null,
  },
  docOuts: {
    type: Array as PropType<DocOut[]>,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  menuActions: {
    type: Array as PropType<DocumentAction[]>,
    default: () => [],
  },
  search: {
    type: Object as PropType<SearchModel>,
    default: null,
  },
  showActionButton: {
    type: Boolean,
    default: true,
  },
});
const selectedDocument = defineModel('selectedDocument', {
  type: Object as PropType<DocOut | undefined>,
  default: undefined,
});

provide('doc', selectedDocument);

watch(
  () => props.docOuts,
  (value) => {
    const find = value.find(
      (doc) =>
        doc.id === selectedDocument.value?.id
              && (doc.processId
                ? doc.processId === selectedDocument.value?.processId
                : true)
              && (doc.commentId
                ? doc.commentId === selectedDocument.value?.commentId
                : true),
    );
    if (find) {
      selectedDocument.value = find;
      return;
    }
    if (value.length > 0) {
      selectedDocument.value = value[0];
    } else {
      selectedDocument.value = undefined;
    }
  },
);
const { t } = useI18n();
const { moment } = useMoment();
const { submit, model } = storeToRefs(useGlobalSearchStore());
const { setFields } = useGlobalSearchStore();

watch(submit, () => {
  mapModel(model.value);
});

const updateSearchField = inject(
  'updateSearchField',
  (field: keyof DocOutSearch, value: any) => void {},
);

function mapModel(model: SearchModel) {
  for (const key in model) {
    if (Object.prototype.hasOwnProperty.call(model, key)) {
      const value = model[key as keyof SearchModel];
      updateSearchField(
          key as keyof DocOutSearch,
          isDate(value)
            ? moment(value).format(DateTimeFormat.ISO_LOCAL_DATE)
            : value,
      );
    }
  }
}

const searchTerm = inject('searchTerm', ref(''));
watch(searchTerm, () => {
  updateSearchField('keyword', searchTerm.value);
});
const docTypes = ref([]);
const { onResult: getDocTypeResult } = getAllDocType();
getDocTypeResult((res) => {
  docTypes.value = res.data.getAllDocType;
});
///For suggest
const { allUsers } = storeToRefs(useUserMoreInfoStore());
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const minDate = computed(() => new Date(props.search?.searchTimeFrom || 0));
const maxDate = computed(
  () => new Date(props.search?.searchTimeTo || 9999999999999),
);
const visibleDialog = ref(false);
const selectedUser = ref<(UserDeptRoleInput & { id: string; })[]>([]);
const orgOuts = ref<OrgOutInterface[]>([] as OrgOutInterface[]);
const { onResult: getOrgResult } = getOrgOut();
getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut;
});
onMounted(() => {
  const calendarProps = {
    minDate,
    maxDate,
    showIcon: true,
    iconDisplay: 'input',
    pt: {
      header: 'p-0 ',
      monthtitle: 'text-sm',
      yeartitle: 'text-sm',
      tableheadercell: 'p-0',
      tableheader: 'text-sm',
      day: 'p-0',
      daylabel: 'm-0 text-sm',
    },
  };

  if (props.fields) {
    setFields(props.fields);
  } else {
    setFields({
      quote: {
        label: t('document.doc.advancedSearch.quote'),
        type: String,
        col: 6,
      },
      priorityCode: {
        label: t('document.doc.advancedSearch.priorityCode'),
        col: 6,
        component: markRaw(Dropdown),
        props: {
          showClear: true,
          options: PRIORITIES,
          optionLabel: 'label',
          optionValue: 'value',
        },
      },
      docTypeId: {
        label: t('document.doc.advancedSearch.docType'),
        type: String,
        col: 6,
        optionsDropdown: docTypes,
        isMultiSelect: true,
      },
      docDateFrom: {
        label: t('document.doc.advancedSearch.docDateFrom'),
        col: 6,
        component: markRaw(Calendar),
        props: calendarProps,
      },
      docDateTo: {
        label: t('document.doc.advancedSearch.docDateTo'),
        col: 6,
        component: markRaw(Calendar),
        props: calendarProps,
      },
      receiveInIds: {
        label: t('Nơi nhận bên trong'),
        col: 6,
        component: markRaw(TemplateChips),
        props: {
          optionLabel: (data: any) => data.userName || data.deptName,
          optionValue: (data: any) => data.userId || data.deptId,
          options: selectedUser
        },
        listener: { click: () => visibleDialog.value = true }
      },
      receiveOutIds: {
        label: t('Nơi nhận bên ngoài'),
        col: 6,
        component: markRaw(MultiSelect),
        props: {
          'option-label': 'orgOutName',
          'option-value': 'id',
          'options': orgOuts,
          showClear: true,
          filterMatchMode: 'contains',
          filter: true
        },
      },
      handler: {
        label: t('Cán bộ xử lý'),
        type: String,
        col: 6,
      },
    });
  }
});

function saveOptionsReceiveInIds() {
  visibleDialog.value = false;
}

const docOutButtonKey = ref(0);
function handleSaveDocBack() {
  // Increment key to force re-render
  docOutButtonKey.value++;
  EventBus.emit('reload-doc-in');
}

function handleSaveDocContinue() {
  // Increment key to force re-render
  docOutButtonKey.value++;
  EventBus.emit('reload-doc-in');
}

// Initialize document actions composable
const { onSaveAndBack, onSaveAndContinue } = useDocumentActions();

// Set up event listeners
onMounted(() => {
  onSaveAndBack(handleSaveDocBack);
  onSaveAndContinue(handleSaveDocContinue);
});

// Clean up event listeners
onUnmounted(() => {
  EventBus.off('document-save-and-back', handleSaveDocBack);
  EventBus.off('document-save-and-continue', handleSaveDocContinue);
});

</script>

<style scoped></style>
