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
        {{ t('hrm.menu.payslipInfoTitlePage') }}
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <ButtonIcon
          class='btn-create focus:shadow-none font-normal'
          :disabled='!selectedPayslip'
          icon='add'
          :label="t('hrm.salary.createGroup')"
          @click='showPayslipInfoForm = true'/>
      </div>
    </template>
  </Toolbar>

  <div class='font-bold grid grid-nogutter'>
    <div class='align-items-center col-6 flex gap-4'>
      <div>{{ t('hrm.salary.selectPayslip') }}</div>
      <Dropdown
        v-model='selectedPayslip'
        class='p-component w-30rem'
        option-label='name'
        :options='payslips'>
      </Dropdown>
      <ButtonIcon
        class='btn-create focus:shadow-none font-normal'
        :disabled='!selectedPayslip'
        icon='edit_note'
        :label="t('hrm.salary.watchNote')"
        @click='showPayslipNote = true'/>
    </div>
    <div class='align-items-center col-6 flex'>{{ t('hrm.salary.configInfo') }}</div>
  </div>

  <div class='grid grid-nogutter mt-2'>
    <div
      class='col-6 pr-2'>
      <div
        class='border-1 border-500 border-dotted surface-card'
        style='height: 81vh'>
        <Tree
          v-model:expanded-keys='expandedKeys'
          v-model:selection-keys='selectedPayslipInfo'
          class='ecm-tree flex-grow-1 h-full overflow-y-auto'
          :meta-key-selection='true'
          selection-mode='single'
          :value='tree'>
          <template #default='{ node }'>
            <div
              class='align-items-center flex gap-2 justify-content-between overflow-auto text-color w-full'>
              <div class='align-items-center flex gap-2 label-container'>
                <div
                  class='label-truncated'
                  :class='node.data.isGroup ? "font-bold" : ""'>
                  {{ node.label }}
                </div>
              </div>

              <div class='group-btn'>
                <div class='flex gap-2'>
                  <ButtonIcon
                    v-for='(button, index) in filterButton(node.data)'
                    :key='index'
                    v-tooltip.top='button.tooltip'
                    :class="
                      button.icon === 'delete'
                        ? 'text-red-400'
                        : 'text-700 hover:text-blue-600'
                    "
                    :icon='button.icon'
                    icon-size='1.5'
                    rounded
                    text
                    @click="button.onClick(node.key || '', node.data)"/>
                </div>
              </div>
            </div>
          </template>
        </Tree>
      </div>
    </div>
    <div
      class='col-6'>
      <div
        class='border-1 border-500 border-dotted surface-card'
        style='height: 81vh'></div>
    </div>
  </div>

  <PayslipInfoForm
    v-if='showPayslipInfoForm'
    :id='showPayslipInfoId'
    :is-group='isCreateGroup'
    :selected-parent-code='selectedParentCode'
    :selected-payslip='selectedPayslip'
    :visible-dialog='showPayslipInfoForm'
    @hide-dialog='hideDialogFn'/>

  <PayslipNote
    v-if='showPayslipNote'
    :selected-payslip='selectedPayslip'
    :visible-dialog='showPayslipNote'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>

import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deletePayslipInfo, getAllPayslipInfo } from '@/apps/hrm/api/graphql/salary';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { getFetchCategory } from '@/apps/hrm/helpers/utils';
import PayslipInfoForm from '@/apps/hrm/views/salaryAndTax/payslipInfo/PayslipInfoForm.vue';
import PayslipNote from '@/apps/hrm/views/salaryAndTax/payslipInfo/PayslipNote.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { listToTree } from '@/common/helpers/utils';

const { t } = useI18n() || {};
const showFilter = ref(true);
const selectedPayslip = ref();
const showPayslipInfoForm = ref(false);
const showPayslipNote = ref(false);
const selectedPayslipInfo = ref();
const showPayslipInfoId = ref();
const expandedKeys = ref<Record<string, boolean>>({});

const payslips = ref<any>([]);
onMounted(async () => {
  payslips.value = await getFetchCategory(CATEGORY_TYPE.NAME_PAYSLIP);
  selectedPayslip.value =
    payslips.value.find((item: any) => item.isDefaultValue) || null;
});

const {
  onResult,
  refetch
} = getAllPayslipInfo(selectedPayslip.value);
const selectedParentCode = ref();

const data = ref([]);
const isCreateGroup = ref(true);

onResult((res) => {
  data.value = res.data.getAllPayslipInfo;
  expandAll();
});

watch(selectedPayslip, (newVal) => {
  refetch({ payslipCode: newVal?.code });
});

const tree = computed(() =>
  listToTree(
    data.value?.map((item: any) => ({
      key: item.id,
      label: item.code + '. ' + item.name,
      data: item,
      parentId: item.parentId,
      children: [],
    })),
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  ),
);

function expandAll() {
  const keys: Record<string, boolean> = {};
  const expand = (nodes: any[]) => {
    nodes.forEach((node) => {
      keys[node.key] = true;
      if (node.children) {
        expand(node.children);
      }
    });
  };
  expand(tree.value);
  expandedKeys.value = keys;
}

const hideDialogFn = () => {
  showPayslipNote.value = false;
  showPayslipInfoId.value = undefined;
  refetch({ payslipCode: selectedPayslip.value?.code });
  showPayslipInfoForm.value = false;
};

interface ButtonType {
  tooltip: string;
  icon: string;
  onClick: any;
}

const createNewGroup = (key: string) => {
  isCreateGroup.value = true;
  selectedParentCode.value = key;
  showPayslipInfoForm.value = true;
};

const createNewRow = (key: string) => {
  isCreateGroup.value = false;
  selectedParentCode.value = key;
  showPayslipInfoForm.value = true;
};

const updateRow = (key: string, data: any) => {
  showPayslipInfoId.value = data.id;
  showPayslipInfoForm.value = true;
};

const confirm = useConfirm();
const {
  mutate,
  onDone
} = deletePayslipInfo();

const deleteRow = (key: string, data: any) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: data.code + '. ' + data.name, }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      mutate({ id: data.id });
    },
  });
};

onDone(() => {
  refetch({ payslipCode: selectedPayslip.value?.code });
  showPayslipInfoForm.value = false;
});

const buttonIcons: ButtonType[] = [
  {
    tooltip: t('hrm.salary.createGroup'),
    icon: 'create_new_folder',
    onClick: createNewGroup,
  },
  {
    tooltip: t('hrm.salary.createRow'),
    icon: 'add',
    onClick: createNewRow,
  },
  {
    tooltip: t('common.edit'),
    icon: 'edit',
    onClick: updateRow,
  },
  {
    tooltip: t('common.delete'),
    icon: 'delete',
    onClick: deleteRow,
  }
];

const filterButton = (data: any) => {
  if (!data.isGroup) {
    return buttonIcons.slice(2);
  }
  return buttonIcons;
};
</script>

<style scoped>
:deep(.p-tree) {
  border: unset;
}

:deep(.p-treenode-label) {
  width: 100%;
  display: flex;
  overflow: hidden;

  .group-btn {
    display: none;
  }
}

:deep(.p-treenode-label):hover {
  .group-btn {
    display: flex;
  }
}

.label-container {
  flex-grow: 1;
  min-width: 0;
}

.label-truncated {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
</style>