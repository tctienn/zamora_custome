<template>
  <Toolbar
    class='mb-2 p-0'
    style='min-height: 3rem'>
    <template #start>
      <div class='align-items-center flex font-bold gap-2 ml-3'>
        <AppIcon
          v-tooltip.top="t('admin.user.showFollowOrganization')"
          class='cursor-pointer'
          name='menu'
          size='1.7'
          @click='showFilter = !showFilter'/>
        {{ t('hrm.menu.hrmCategory') }}
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <ButtonIcon
          v-if='hasPermission("/HRM/HRM_TOOLS/HRM_CATEGORY/CREATE")'
          class='btn-create focus:shadow-none font-normal'
          icon='add'
          :label="t('common.create')"
          @click='showFormCreate'/>
        <ButtonIcon
          class='focus:shadow-none font-normal'
          icon='restart_alt'
          label='Refresh'
          outlined/>

      </div>
    </template>
  </Toolbar>
  <div class='flex gap-3'>
    <div
      v-if='showFilter'
      class='w-30rem'>
      <Listbox
        v-model='selectedCategory'
        filter
        :option-disabled='isDisabled'
        option-label='name'
        :options='transformCategoryList()'>
        <template #option='slotProps'>
          <div class='align-items-center flex'>
            <div class='font-semibold w-3rem'>
              {{ slotProps.index + 1 }}
            </div>
            {{ t(`hrm.category.${slotProps.option.type}`) }}
          </div>
        </template>
      </Listbox>
    </div>
    <div class='w-full'>
      <TreeTableCategory
        v-if='selectedCategory?.type === CATEGORY_TYPE.PROFESSIONAL_SKILLS'
        ref='table'
        :selected-category='selectedCategory?.type'/>
      <TreeTableCategory
        v-else-if='selectedCategory?.type === CATEGORY_TYPE.KPI_GROUP_CONFIG'
        ref='table'
        :selected-category='selectedCategory?.type'/>
      <TableCategory
        v-else
        ref='table'
        :selected-category='selectedCategory?.type'/>
    </div>
  </div>

  <DialogFormCategory
    v-if='showForm'
    :selected-category='selectedCategory.type'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { CATEGORY_TYPE, CategoryList } from '@/apps/hrm/constants/category';
import DialogFormCategory from '@/apps/hrm/views/categories/conponents/DialogFormCategory.vue';
import TableCategory from '@/apps/hrm/views/categories/conponents/TableCategory.vue';
import TreeTableCategory from '@/apps/hrm/views/categories/conponents/TreeTableCategory.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const { t } = useI18n() || {};
const showFilter = ref(true);
const showForm = ref(false);
const hasPermission = usePermissionStore().hasPermission;
const selectedCategory = ref(CategoryList[0]);

const table = ref<any>(null);

function transformCategoryList() {
  return CategoryList.map((category: any) => ({
    ...category,
    name: t(`hrm.category.${category.type}`),
  }));
}

const refetchDataTable = () => {
  if (table.value) {
    table.value.hideDialogFn();
  }
};

function showFormCreate() {
  showForm.value = true;
}

function hideDialogFn() {
  showForm.value = false;
  refetchDataTable();
}

function isDisabled(option: any) {
  return option?.type === selectedCategory.value?.type;
}
</script>

<style scoped>
:deep(.p-listbox-list-wrapper) {
  height: calc(100vh - 14rem + 6px);
  overflow: hidden !important;
}

:deep(.p-listbox-list) {
  padding: unset !important;
}

:deep(.p-listbox-list-wrapper):hover {
  height: calc(100vh - 14rem + 6px);
  overflow: auto !important;
}
</style>
