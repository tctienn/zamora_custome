<template>
  <TreeTable
    :meta-key-selection='true'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    :row-hover='true'
    v-bind='DEFAULT_DATATABLE_CONFIG'
    :scrollable='true'
    selection-mode='single'
    :value='cateDataTree'>
    <Column
      expander
      field='code'
      :header='t(`hrm.category.code`)'
      header-class='justify-content-center'>
      <template #body='{node: data}'>
        {{ data.code }}
      </template>
    </Column>

    <Column
      field='name'
      :header='t(`hrm.category.name`)'
      header-class='justify-content-center'>
      <template #body='{node: data}'>
        {{ data.name }}
      </template>
    </Column>

    <Column
      v-if='categoryItem?.hasSetDefaultValue'
      class='justify-content-center text-center'
      field='isDefault'
      :header="t('document.book.default')"
      header-class='justify-content-center'>
      <template #body='{ node: data }'>
        <AppIcon
          v-if='data.isDefault'
          name='check'
          size='1.7'/>
      </template>
    </Column>

    <Column
      class='justify-content-center text-center'
      field='isSystem'
      :header="t('hrm.category.isSystem')"
      header-class='justify-content-center'>
      <template #body='{ node: data }'>
        <div class='flex justify-content-between'>
          <AppIcon
            v-if='data && data.isSystem'
            name='check'
            size='1.7'/>
        </div>
      </template>
    </Column>

    <Column
      v-if="userDeptRole.roleId === 'ADMIN'"
      class='justify-content-center text-center'
      field='organizationName'
      :header="t('hrm.category.organizationName')"
      header-class='justify-content-center'></Column>

    <Column
      class='justify-content-center text-center'
      field='status'
      :header="t('common.status')"
      header-class='justify-content-center'
      style='width: 20%'>
      <template #body='{ node: data }'>
        <span
          v-if='data && data.status'
          class='status-badge'
          :class="`status-${data.status ? 'active' : 'deactivate'}`">
          {{ t(`common.statuses.${data.status ? 'active' : 'deactivate'}`) }}
        </span>
      </template>
    </Column>

    <Column
      class='justify-content-center text-center'
      :header="t('common.action')"
      header-class='justify-content-center'
      style='width: 15%'>
      <template #body='{ node: data }'>
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
  </TreeTable>

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
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { deleteCategory, searchCategory, } from '@/apps/hrm/api/graphql/category';
import { CategoryList } from '@/apps/hrm/constants/category';
import DialogFormCategory from '@/apps/hrm/views/categories/conponents/DialogFormCategory.vue';
import type { IBookingCar } from '@/apps/vehicle/model/bookingCar';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
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
const cateData = ref<any[]>([]);

const categoryItem = computed(() =>
  CategoryList.find((item) => item.type === props.selectedCategory),
);

const defaultPageable = {
  page: 0,
  size: 2000,
  sort: [
    {
      property: 'orderNumber',
      direction: 'ASC',
    },
  ],
};
const pageable = reactive(defaultPageable);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const searchParams = reactive({
  userDeptRole: userDeptRole,
  type: props.selectedCategory,
  keyword: '',
  pageable: pageable,
});

const {
  onResult: searchCategoryResult,
  refetch: searchCategoryRefetch,
  load: searchCategoryLoad
} =
  searchCategory();

searchCategoryResult((res) => {
  const edges = res.data?.searchCategory.edges || [];

  cateData.value = edges.map((edge: any) => ({ ...edge.node }));
});

const cateDataTree = computed(() => {
  return buildTree(cateData.value);
});

const buildTree = (data: any[]) => {
  const map = new Map<string, any>();
  const tree: any[] = [];

  data.forEach((item) => {
    map.set(item.code, {
      ...item,
      children: []
    });
  });

  data.forEach((item) => {
    if (item.parentCode && map.has(item.parentCode)) {
      map.get(item.parentCode).children.push(map.get(item.code));
    } else {
      tree.push(map.get(item.code));
    }
  });

  return tree;
};
watch(
  () => props.selectedCategory,
  (newVal) => {
    searchParams.pageable.page = 0;
    searchParams.type = newVal;
    searchParams.keyword = '';
    searchCategoryRefetch(searchParams);
  },
);

onMounted(() => {
  searchCategoryLoad(null, searchParams);
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
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
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
