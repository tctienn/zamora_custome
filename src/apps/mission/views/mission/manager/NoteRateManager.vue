<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <div class='font-bold'>
            {{ t('mission.mission.title.listNote') }}
          </div>
        </div>
      </template>

      <template #end>
        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            :label='t("common.viewBy")'
            severity='secondary'
            @click='viewTypeRef?.toggle'>
            <template #icon>
              <i
                class='pi pi-list'
                style='margin-top: 1px'></i>
              <i class='flex-order-2 mt-1 pi pi-angle-down'/>
            </template>
          </Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-import'
            label='Import'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-export'
            label='Export'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-cog'
            :label='t("common.setting")'
            severity='secondary'></Button>
        </div>
      </template>
    </Toolbar>
  </div>
  <div class='border-1 border-300 border-round-sm flex gap-2 mt-2 p-2 surface-0'>
    <NamedInputCalendar
      v-model='yearModel'
      class='w-14rem'
      date-format='yy'
      icon-display='input'
      :select-other-months='true'
      show-icon
      view='year'/>
    <Dropdown
      v-model='searchNoteRate.month'
      class='w-14rem'
      option-disabled='disabled'
      option-label='label'
      option-value='value'
      :options='monthOptions'
      placeholder='Chọn tháng'
      show-clear>
    </Dropdown>
  </div>
  <NotesList
    :loading='loadingNote'
    :note-data='filteredNoteData'
    @refresh='refetchNote'/>

  <Paginator
    :class='{ hidden: !totalNote }'
    current-page-report-template='{first}-{last}/{totalRecords}'
    :pt="{
      root: {
        class: 'border-noround-top'
      },
      paginatorwrapper: {
        class: 'custom-paginator-wrapper fix-center'
      },
    }"
    :rows='pageableNotes.size'
    template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
    :total-records='totalNote'
    @page='onPage'/>

  <Menu
    ref='viewTypeRef'
    :model='viewTypeMenu'
    popup>

    <template #item='itemProp'>
      <div class='cursor-pointer flex gap-1 p-2'>
        <AppIcon
          class='mr-2'
          name='check'
          size='1.5'
          :style='{opacity:viewType==itemProp.item.key?1:0,
                   color: viewType == itemProp.item.key ? "#0d99ff" : ""}'/>

        <div
          :style='{color: viewType == itemProp.item.key ? "#0d99ff" : ""}'>
          {{ itemProp.item.label }}
        </div>
      </div>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { PageState } from 'primevue/paginator';
import type { TreeNode } from 'primevue/treenode';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { getJobEvaluationListGraphql } from '@/apps/mission/api/graphql/mission';
import type { PersonalInterface } from '@/apps/mission/model/job/job';
import { type NoteInterface, type SearchNoteInput } from '@/apps/mission/model/mission/mission';
import { getAllUserMoreInfoGraphql } from '@/common/api/graphql/user-graphql';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { useGlobalSearchStore } from '@/common/store/search';

import NotesList from '../component/NotesList.vue';

const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const totalNote = ref<number>(0);
type ViewType = 'list' | 'kanban' | 'group' | 'type';
const viewType = ref<ViewType>('list');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const { t } = useI18n();
const showRow = ref<string>('list');
const noteData = ref<NoteInterface[]>([]);
const filteredNoteData = computed(() => {
  if (model.value.hostUnit) {
    const hostUnitId = Object.keys(model.value.hostUnit)[0];
    return noteData.value.filter(({ handlerOrganizationId }) => handlerOrganizationId === hostUnitId);
  }
  return noteData.value;
});
const personalOption = ref<PersonalInterface[]>([]);
const yearModel = ref<Date | null>(new Date);
const tree = ref<TreeNode[]>([]);
const store = useUserMoreInfoStore();
store.fetchAllUsers();

const searchNoteRate = ref<SearchNoteInput>({
  handlerId: null,
  month: null,
  year: 2025
});

const pageableNotes = ref({
  page: 0,
  size: 50
});

const {
  onResult: onNoteResult,
  load: loadNote,
  loading: loadingNote,
  refetch: refetchNote,
} = getJobEvaluationListGraphql();

function fetchData() {
  loadNote(undefined, {
    jobEvaluationSearchInput: searchNoteRate.value,
    pageable: pageableNotes.value
  });
}

onNoteResult((res) => {
  console.log(res.data.getJobEvaluationList.content);
  noteData.value = res.data.getJobEvaluationList.content;
  totalNote.value = res.data.getJobEvaluationList.totalRecords;
});

fetchData();

watch(submit, () => {
  console.log(model.value);
  
  searchNoteRate.value.handlerId = model.value.handlerId;
  refetchNote({
    jobEvaluationSearchInput: searchNoteRate.value,
    pageable: pageableNotes.value
  });
});

watch(yearModel, (newYear) => {
  if (newYear) {
    searchNoteRate.value.year = moment(newYear).year();
    pageableNotes.value.page = 0; 
  }
});

watch(() => searchNoteRate.value.month, (newMonth) => {
  if (newMonth) {
    searchNoteRate.value.month = Number(newMonth);
    pageableNotes.value.page = 0;
  }
});
const viewTypeMenu = ref([
  {
    label: 'Danh sách',
    key: 'list',
    command: () => {
      viewType.value = 'list';
      showRow.value = 'list';
    },
  }, {
    label: 'Kanban',
    key: 'kanban',
    command: () => {
      viewType.value = 'kanban';
      showRow.value = 'kanban';
    },
  }, {
    label: 'Nhóm nhiệm vụ',
    key: 'group',
    command: () => {
      viewType.value = 'group';
      showRow.value = 'group';
    },
  }, {
    label: 'Loại nhiệm vụ',
    key: 'type',
    command: () => {
      viewType.value = 'type';
      showRow.value = 'type';
    },
  }
]);

const onPage = (event: PageState) => {
  pageableNotes.value.page = event.page;
  pageableNotes.value.size = event.rows;
  fetchData();
};

setFields({
  handlerId: {
    label: 'Chuyên viên',
    col: 6,
    optionsDropdown: personalOption,
  },
  hostUnit: {
    label: 'Đơn vị',
    col: 6,
    optionsTreeSelect: tree,
    isTreeSingleSelect: true,
  },
});

getAllUserMoreInfoGraphql().onResult(res => {
  personalOption.value = get(res, 'data.getAllUserMoreInfo').map((user: { id: string; fullName: string }) => {
    return {
      id: user.id,
      name: user.fullName
    };
  });
  ;
});

const monthOptions = computed(() => {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return months.map((month, index) => {
    const monthValue = index + 1;
    return {
      label: month,
      value: monthValue
    };
  });
});

getAllOrganizationPublicGraphql().onResult((res) => {
  tree.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
});
</script>

<style scoped>
:deep(.p-paginator) {
  border: unset;
  padding: unset;
}

.custom-paginator-wrapper {
  display: flex;
  height: 40px;
  align-items: center;
  overflow: hidden;
}

:deep(.p-paginator-page-options) {
  display: flex;
  align-items: center;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  height: 2rem;
  min-width: 2rem;
  border-radius: 6px;
}
:deep(.p-paginator .p-paginator-first) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-prev) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-next) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-last) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2rem;
  height: 2rem;
}

:deep(.p-paginator .p-dropdown) {
  height: 2rem;

}

.p-toolbar{
  min-height: 42px;
}
.btn-create, .btn-import, .btn-filter, .btn-export {
  max-height: 37px;
}
</style>