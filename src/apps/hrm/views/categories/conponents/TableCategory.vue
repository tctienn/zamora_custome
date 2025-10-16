<template>
  <DataTable
    v-model:selection='selectedRow'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    :value='cateData'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <Column
      class='text-center'
      header='TT'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='code'
      :header="
        t(`hrm.category.code`) + ' ' + t(`hrm.category.${selectedCategory}`)
      "></Column>

    <Column
      field='name'
      :header="
        t(`hrm.category.name`) + ' ' + t(`hrm.category.${selectedCategory}`)
      "></Column>

    <Column
      v-if='categoryItem?.hasSetDefaultValue'
      class='text-center'
      field='isDefault'
      :header="t('document.book.default')">
      <template #body='{ data: { isDefaultValue } }'>
        <AppIcon
          v-if='isDefaultValue'
          name='check'
          size='1.7'/>
      </template>
    </Column>

    <Column
      class='text-center'
      field='isSystem'
      :header="t('hrm.category.isSystem')">
      <template #body='{ data: { isSystem } }'>
        <AppIcon
          v-if='isSystem'
          name='check'
          size='1.7'/>
      </template>
    </Column>

    <Column
      v-if='userDeptRole.roleId === "ADMIN"'
      class='text-center'
      field='organizationName'
      :header="t('hrm.category.organizationName')">
    </Column>

    <Column
      class='text-center'
      field='status'
      :header="t('common.status')"
      style='width: 20%'>
      <template #body='{ data: { status } }'>
        <span
          class='status-badge'
          :class="`status-${status ? 'active' : 'deactivate'}`">{{
            t(`common.statuses.${status ? 'active' : 'deactivate'}`)
          }}</span>
      </template>
    </Column>

    <Column
      class='text-center'
      :header="t('common.action')"
      style='width: 15%'>
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.top="t('common.action')"
          class='text-color'
          icon='more_horiz'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu($event, data)'/>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
  </Menu>

  <DialogFormCategory
    v-if='showForm'
    :code='selectedRow.code'
    :selected-category='selectedCategory'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>
import { throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { deleteCategory, searchCategory, } from '@/apps/hrm/api/graphql/category';
import { CategoryList } from '@/apps/hrm/constants/category';
import DialogFormCategory from '@/apps/hrm/views/categories/conponents/DialogFormCategory.vue';
import type { IBookingCar } from '@/apps/vehicle/model/bookingCar';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  selectedCategory: {
    type: String,
    required: true,
  },
});
const showForm = ref(false);
const menuRef = ref();
const { t } = useI18n() || {};
const selectedRow = ref();
const hasPermission = usePermissionStore().hasPermission;
const canLoadMore = ref(true);
const isLoadMore = ref(false);
const cateData = ref<any[]>([]);

const categoryItem = computed(() =>
  CategoryList.find((item) => item.type === props.selectedCategory),
);

const defaultPageable = {
  page: 0,
  size: 20,
  sort: [
    {
      property: 'orderNumber',
      direction: 'ASC',
    },
  ],
};
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const searchParams = reactive({
  userDeptRole: userDeptRole,
  type: props.selectedCategory,
  keyword: '',
  pageable: defaultPageable,
});

const {
  onResult: searchCategoryResult,
  refetch: searchCategoryRefetch,
  load: searchCategoryLoad
} =
  searchCategory();

searchCategoryResult((res) => {
  if (res.loading) {
    return;
  }
  const edges = res.data?.searchCategory.edges || [];
  if (isLoadMore.value) {
    cateData.value = [
      ...cateData.value,
      ...edges.map((edge: any) => ({ ...edge.node })),
    ];
  } else {
    cateData.value = edges.map((edge: any) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

const searchTerm = inject('searchTerm', ref(''));

watch(searchTerm, (newValue) => {
  searchParams.pageable.page = 0;
  searchParams.keyword = newValue;
  searchCategoryRefetch(searchParams);
});

watch(
  () => props.selectedCategory,
  (newVal) => {
    searchParams.pageable.page = 0;
    searchParams.type = newVal;
    searchParams.keyword = '';
    searchCategoryRefetch(searchParams);
  },
);

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 100 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    searchParams.pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scrollend', throttle(scrollEvent, 1000));
  }
}

onMounted(() => {
  searchCategoryLoad(null, searchParams);
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

function toggleActionMenu(event: Event, data: IBookingCar) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const menuActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    visible: hasPermission('/HRM/HRM_TOOLS/HRM_CATEGORY/UPDATE'),
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    visible: hasPermission('/HRM/HRM_TOOLS/HRM_CATEGORY/DELETE'),
    icon: 'pi pi-trash',
    command: () => {
      confirmDeleteCategory();
    },
  },
];

const {
  mutate: deleteCategoryMutate,
  onDone: deleteCategoryOnDone
} =
  deleteCategory();
const confirm = useConfirm();
const confirmDeleteCategory = () => {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t(`hrm.category.${props.selectedCategory}`),
      itemName: selectedRow.value?.name,
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: t('common.cancel'),
    accept: () => {
      deleteCategoryMutate({
        userDeptRole: userDeptRole.value,
        type: props.selectedCategory,
        code: selectedRow.value?.code,
      });
    },
  });
};

deleteCategoryOnDone(() => {
  searchParams.pageable.page = 0;
  toastSuccess({ message: t('Xóa thành công') });
  searchCategoryRefetch(searchParams);
});

function hideDialogFn() {
  showForm.value = false;
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  searchCategoryRefetch(searchParams);
}

defineExpose({ hideDialogFn });
</script>

<style scoped></style>
