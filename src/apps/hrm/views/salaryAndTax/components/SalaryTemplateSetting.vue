<template>
  <div class='relative'>
    <!-- Loading overlay -->
    <div
      v-if='isLoading'
      class='absolute align-items-center bg-black-alpha-30 flex h-full justify-content-center w-full z-5'
      style='top: 0; left: 0;'>
      <ProgressSpinner/>
    </div>

    <div
      class='salary-template-setting'
      style='height: calc(100vh - 6rem)'>
      <div class='flex flex-column gap-2'>
        <Toolbar
          class='mb-2 p-0 pr-1'
          style='min-height: 3rem'>
          <template #start>
            <div class='align-items-center flex font-bold gap-2 pl-2'>
              {{ t('hrm.salary.salary.templateSetting') }}
            </div>
          </template>
          <template #end>
            <ButtonGroup>
              <Button
                class='border-round-sm btn-create focus:shadow-none font-normal p-1 pr-2'
                icon='pi pi-plus'
                :label="t('common.create')"
                :loading='isLoading'
                @click='openCreateTemplateDialog'></Button>
            </ButtonGroup>
          </template>
        </Toolbar>
      </div>

      <div
        class='flex gap-2'
        style='height: calc(100vh - 9rem)'>
        <!-- Left Panel - Template List -->
        <div
          class='flex flex-column w-6'
          style='height: 100%'>
          <div class='border-round-sm card mb-2 p-0 shadow-none'>
            <div class='border-bottom-1 font-bold p-3 surface-border'>
              {{ t('hrm.salary.salary.templateList') }}
            </div>
          </div>
          <div class='flex-grow-1 surface-0'>
            <DataTable
              v-model:selection='selectedTemplate'
              class='h-full relative'
              data-key='id'
              v-bind="{
                ...DEFAULT_DATATABLE_CONFIG,
                'scroll-height': 'calc(100vh - 13rem)',
              }"
              :rows='10'
              selection-mode='single'
              :value='templates'
              @row-select='onTemplateSelect'>
              <Column
                header='STT'
                header-class='w-3rem'>
                <template #body='{ index }'>
                  <div class='flex justify-content-center'>
                    {{ index + 1 }}
                  </div>
                </template>
              </Column>
              <Column
                field='name'
                :header="t('hrm.salary.salary.templateName')"
                header-class='w-20rem'></Column>
              <Column
                field='type'
                :header="t('hrm.salary.salary.templateType')"
                header-class='w-12rem'>
                <template #body='{ data }'>
                  <span>{{ data.type ? t(`hrm.salary.salary.templateTypes.${data.type}`) : '' }}</span>
                </template>
              </Column>
              <Column
                field='description'
                :header="t('common.description')"
                header-class='w-20rem'>
                <template #body='{ data }'>
                  <div
                    v-tooltip.top='data.description'
                    class='text-overflow-ellipsis'>
                    {{ data.description }}
                  </div>
                </template>
              </Column>
              <Column
                body-class='text-center'
                field='status'
                :header="t('common.status')"
                header-class='w-10rem text-center'>
                <template #body='{ data }'>
                  <Tag
                    class='border-round-sm mx-auto'
                    :severity="data.status === 'ACTIVE' ? 'success' : 'warning'">
                    {{ data.status === 'ACTIVE' ? t('common.statuses.active') : t('common.statuses.deactivate') }}
                  </Tag>
                </template>
              </Column>
              <Column
                body-class='text-center'
                header-class='w-3rem text-center'>
                <template #body='{ data }'>
                  <ButtonIcon
                    class='justify-content-center'
                    icon='more_vert'
                    outlined
                    rounded
                    text
                    @click='toggleTemplateActionMenu($event, data)'/>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <!-- Right Panel - Template Columns -->
        <div
          class='flex flex-column w-6'
          style='height: 100%'>
          <div class='border-round-sm card mb-2 p-0 shadow-none'>
            <div class='border-bottom-1 font-bold p-3 surface-border'>
              {{ t('hrm.salary.salary.templateColumns') }}
              <span
                v-if='selectedTemplate'
                class='text-primary-500'>: {{ selectedTemplate.name }}</span>
            </div>
          </div>
          <div class='flex-grow-1 surface-0'>
            <DataTable
              v-bind="{
                ...DEFAULT_DATATABLE_CONFIG,
                'scroll-height': 'calc(100vh - 13rem)',
              }"
              :rows='10'
              :value='sortedSelectedTemplateColumns'>
              <Column
                header='STT'
                header-class='w-3rem'>
                <template #body='{ index }'>
                  <div class='flex justify-content-center'>
                    {{ index + 1 }}
                  </div>
                </template>
              </Column>
              <Column
                field='code'
                :header="t('hrm.salary.salary.columnCode')"
                header-class='w-10rem'></Column>
              <Column
                field='name'
                :header="t('hrm.salary.salary.columnName')"
                header-class='w-15rem'></Column>
              <Column
                body-class='text-center'
                field='columnType'
                :header="t('hrm.salary.salary.columnType')"
                header-class='w-10rem text-center'>
                <template #body='{ data }'>
                  <span>{{data.columnType ? t(`hrm.salary.columns.${data.columnType}`) : ""}}</span>
                </template>
              </Column>
              <Column
                body-class='text-center'
                field='dataType'
                :header="t('hrm.salary.salary.columnDataType')"
                header-class='w-10rem text-center'>
                <template #body='{ data }'>
                  <Tag
                    class='border-round-sm mx-auto'
                    :severity='getColumnTypeSeverity(data.dataType)'>
                    {{ getColumnTypeName(data.dataType) }}
                  </Tag>
                </template>
              </Column>

              <Column
                body-class='text-center'
                field='status'
                :header="t('common.status')"
                header-class='w-15rem text-center'>
                <template #body='{ data }'>
                  <Tag
                    class='border-round-sm mx-auto'
                    :severity="data.status === 'ACTIVE' ? 'success' : 'warning'">
                    {{ data.status === 'ACTIVE' ? t('common.statuses.active') : t('common.statuses.deactivate') }}
                  </Tag>
                </template>
              </Column>
              <Column header-class='w-3rem'>
                <template #body='{ data }'>
                  <ButtonIcon
                    class='justify-content-center'
                    icon='more_vert'
                    outlined
                    rounded
                    text
                    @click='toggleColumnActionMenu($event, data)'/>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Action Menu -->
    <Menu
      ref='templateMenu'
      :model='templateMenuItems'
      :popup='true'>
      <template #item='{ item }'>
        <MenuItem
          :class-icon="['mt-0 text-sm', item.icon === 'delete' ? 'text-red-300' : '']"
          :class-item="['mt-1', item.icon === 'delete' ? 'text-red-300' : '']"
          :icon='item.icon'
          :label='item.label'/>
      </template>
    </Menu>

    <!-- Column Action Menu -->
    <Menu
      ref='columnMenu'
      :model='columnMenuItems'
      :popup='true'>
      <template #item='{ item }'>
        <MenuItem
          :class-icon="['mt-0 text-sm', item.icon === 'delete' ? 'text-red-300' : '']"
          :class-item="['mt-1', item.icon === 'delete' ? 'text-red-300' : '']"
          :icon='item.icon'
          :label='item.label'/>
      </template>
    </Menu>

    <!-- Template Sidebar -->
    <TemplateSidebar
      :editing-template='editingTemplate'
      :template-form='templateForm'
      :visible='templateDialogVisible'
      @cancel='onCancelTemplate'
      @refetch='onRefetch'
      @save='onSaveTemplate'
      @update:visible='onTemplateDialogVisibleChange'/>

    <!-- Column Dialog -->
    <ColumnDialog
      :column-id='editingColumnId || undefined'
      :template-columns='selectedTemplate?.columns'
      :visible='columnDialogVisible'
      @cancel='onCancelColumn'
      @save='onSaveColumn'
      @update:visible='onColumnDialogVisibleChange'/>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// GraphQL API
import {
  addColumnTemplate,
  deleteColumnTemplate,
  deleteSalaryTemplate,
  getAllSalaryTemplates,
  saveSalaryTemplate, updateStatusColumn,
  updateStatusTemplate
} from '@/apps/hrm/api/graphql/salary';
import type { SalaryTemplate } from '@/apps/hrm/model/salary';
import ColumnDialog from '@/apps/hrm/views/salaryAndTax/components/ColumnDialog.vue';
import TemplateSidebar from '@/apps/hrm/views/salaryAndTax/components/TemplateSidebar.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';

// Interfaces
interface TemplateColumn {
  id?: string;
  templateId?: string;
  code: string;
  name: string;
  type: string;
  dataType: string;
  isTotal: string;
  orderNumber: number;
  data: string;
  status: string;
}

// Data
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

// Refs of table will be dataTable (default setting config)

// Templates data
const templates = ref<SalaryTemplate[]>([]);

// Selected template
const selectedTemplate = ref<SalaryTemplate | null>(null);

// Dialog visibility
const templateDialogVisible = ref(false);
const columnDialogVisible = ref(false);

// Form data
const templateForm = ref({
  name: '',
  description: '',
  type: '',
  status: 'ACTIVE'
});

// Note: columnForm is no longer used since ColumnDialog now fetches data by ID

// Editing flags
const editingTemplate = ref<SalaryTemplate | null>(null);
const editingColumn = ref<TemplateColumn | null>(null);
const editingColumnId = ref<string | null>(null);

// Menu refs
const templateMenu = ref();
const columnMenu = ref();

const selectedTemplateForAction = ref<SalaryTemplate | null>(null);
const selectedColumnForAction = ref<TemplateColumn | null>(null);
// Menu items
const templateMenuItems = ref<MenuItem[]>([]);

// Function to update template menu items based on selected template
function updateTemplateMenuItems() {
  if (selectedTemplateForAction.value) {
    templateMenuItems.value = [
      {
        label: t('common.edit'),
        icon: 'edit',
        command: () => {
          openEditTemplateDialog();
        }
      },
      {
        label: selectedTemplateForAction.value.status === 'ACTIVE' 
          ? t('hrm.salary.salary.deactivate') 
          : t('hrm.salary.salary.activate'),
        icon: selectedTemplateForAction.value.status === 'ACTIVE' ? 'block' : 'check_circle',
        command: () => {
          toggleTemplateStatus();
        }
      },
      {
        label: t('common.delete'),
        icon: 'delete',
        command: () => {
          onDeleteTemplate();
        }
      }
    ];
  }
}

// Column menu items (will be updated dynamically)
const columnMenuItems = ref<MenuItem[]>([]);

// Function to update column menu items based on selected column
function updateColumnMenuItems() {
  if (selectedColumnForAction.value) {
    columnMenuItems.value = [
      {
        label: t('common.edit'),
        icon: 'edit',
        command: () => {
          openEditColumnDialog();
        }
      },
      {
        label: selectedColumnForAction.value.status === 'ACTIVE' 
          ? t('hrm.salary.salary.deactivate') 
          : t('hrm.salary.salary.activate'),
        icon: selectedColumnForAction.value.status === 'ACTIVE' ? 'block' : 'check_circle',
        command: () => {
          toggleColumnStatus();
        }
      },
      {
        label: t('common.delete'),
        icon: 'delete',
        command: () => {
          onDeleteColumn();
        }
      }
    ];
  }
}

const {
  onResult: getAllSalaryTemplatesResult,
  onError: getAllSalaryTemplatesError,
  refetch: refetchAllSalaryTemplates,
  loading: getAllSalaryTemplatesLoading
} = getAllSalaryTemplates();

const {
  mutate: saveSalaryTemplateMutate,
  onDone: saveSalaryTemplateDone,
  onError: saveSalaryTemplateError,
  loading: saveSalaryTemplateLoading
} = saveSalaryTemplate();

const {
  mutate: deleteSalaryTemplateMutate,
  onDone: deleteSalaryTemplateDone,
  onError: deleteSalaryTemplateError,
  loading: deleteSalaryTemplateLoading
} = deleteSalaryTemplate();

const {
  mutate: deleteColumnMutate,
  onDone: deleteColumnDone,
  onError: deleteColumnError,
  loading: deleteColumnLoading
} = deleteColumnTemplate();

const {
  mutate: updateStatusTemplateMutate,
  onDone: updateStatusTemplateDone,
  onError: updateStatusTemplateError,
  loading: updateStatusTemplateLoading
} = updateStatusTemplate();

const {
  mutate: updateStatusColumnMutate,
  onDone: updateStatusColumnDone,
  onError: updateStatusColumnError,
  loading: updateStatusColumnLoading
} = updateStatusColumn();

const {
  mutate: addColumnTemplateMutate,
  onDone: addColumnTemplateDone,
  onError: addColumnTemplateError,
  loading: addColumnTemplateLoading
} = addColumnTemplate();

// Handle column deletion success
deleteColumnDone(() => {
  toast.add({
    severity: 'success',
    summary: t('common.success'),
    detail: t('hrm.salary.columns.deleteSuccess'),
    life: 3000
  });
  
  // Refetch all templates to ensure data consistency after deletion
  refetchAllSalaryTemplates();
});

// Handle column deletion error
deleteColumnError((error) => {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t('hrm.salary.columns.deleteError'),
    life: 3000
  });
});

// Handle template status update success
updateStatusTemplateDone(() => {
  toast.add({
    severity: 'success',
    summary: t('common.success'),
    detail: t('hrm.salary.template.statusUpdateSuccess'),
    life: 3000
  });
  
  // Refetch all templates to ensure data consistency after status update
  refetchAllSalaryTemplates();
});

// Handle template status update error
updateStatusTemplateError((error) => {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t('hrm.salary.template.statusUpdateError'),
    life: 3000
  });
});

// Handle column status update success
updateStatusColumnDone(() => {
  toast.add({
    severity: 'success',
    summary: t('common.success'),
    detail: t('hrm.salary.columns.statusUpdateSuccess'),
    life: 3000
  });
  
  // Refetch all templates to ensure data consistency after column status update
  refetchAllSalaryTemplates();
});

// Handle column status update error
updateStatusColumnError((error) => {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t('hrm.salary.columns.statusUpdateError'),
    life: 3000
  });
});

// Handle column addition success
addColumnTemplateDone((result) => {
  if (result.data && result.data.addColumnTemplate) {
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: editingColumn.value?.id ? t('hrm.salary.columns.editSuccess') : t('hrm.salary.columns.addSuccess'),
      life: 3000
    });

    // Refetch all templates to ensure data consistency after adding a column
    refetchAllSalaryTemplates();
  }
});

// Handle column addition error
addColumnTemplateError((error) => {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: editingColumn.value?.id ? t('hrm.salary.columns.addError') : t('hrm.salary.columns.addError'),
    life: 3000
  });
  console.error('Error adding column:', error);
});

// Computed
const isLoading = computed(() => {
  return getAllSalaryTemplatesLoading.value
      || saveSalaryTemplateLoading.value
      || deleteSalaryTemplateLoading.value;
});

// Computed property to return sorted columns by orderNumber
const sortedSelectedTemplateColumns = computed(() => {
  if (!selectedTemplate.value || !selectedTemplate.value.columns) {
    return [];
  }
  return [...selectedTemplate.value.columns].sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
});

getAllSalaryTemplatesResult((result) => {
  if (result.data && result.data.findTemplate) {
    const newTemplates = result.data.findTemplate;
    
    // Preserve the currently selected template by ID if it exists in the new data
    let previouslySelectedId = selectedTemplate.value?.id;
    
    templates.value = newTemplates;
    
    // Update selectedTemplate with fresh data from the new templates list if it existed before
    if (previouslySelectedId) {
      const updatedSelectedTemplate = newTemplates.find((t: any) => t.id === previouslySelectedId);
      if (updatedSelectedTemplate) {
        selectedTemplate.value = updatedSelectedTemplate;
      }
    }
    
    // Select the first template by default if no template is selected
    if (templates.value.length > 0 && !selectedTemplate.value) {
      nextTick(() => {
        selectedTemplate.value = templates.value[0];
      });
    }
  }
});

getAllSalaryTemplatesError((error) => {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t('hrm.salary.template.fetchError'),
    life: 3000
  });
  console.error('Error fetching salary templates:', error);
});

function onDeleteTemplate() {
  if (selectedTemplateForAction.value && selectedTemplateForAction.value.id) {
    confirm.require({
      message: t('hrm.salary.template.deleteConfirm'),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        deleteSalaryTemplateMutate({ id: selectedTemplateForAction.value?.id });
      },
    });
    refetchAllSalaryTemplates();

  }
}

function onDeleteColumn() {
  if (selectedColumnForAction.value && selectedColumnForAction.value.id) {
    confirm.require({
      message: t('hrm.salary.columns.deleteConfirm'),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        deleteColumnMutate({ id: selectedColumnForAction.value?.id });
      },
    });
  }
}

function handleError(summary: string, detail: string, logPrefix = '') {
  toast.add({
    severity: 'error',
    summary,
    detail,
    life: 3000
  });
}

const onRefetch = () => {
  refetchAllSalaryTemplates();
};

getAllSalaryTemplatesError((error) => {
  handleError(
    t('common.error'),
    t('hrm.salary.template.fetchError'),
    'Error fetching salary templates:'
  );
});

saveSalaryTemplateDone((result) => {
  if (result.data && result.data.saveTemplate) {
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('hrm.salary.template.saveSuccess'),
      life: 3000
    });

    // Update templates list
    const savedTemplate = result.data.saveTemplate;
    const index = templates.value.findIndex(t => t.id === savedTemplate.id);
    refetchAllSalaryTemplates();
    if (index >= 0) {
      // Update existing template
      templates.value[index] = savedTemplate;
      if (selectedTemplate.value && selectedTemplate.value.id === savedTemplate.id) {
        selectedTemplate.value = savedTemplate;
      }
    } else {
      // Add new template
      templates.value.push(savedTemplate);
      selectedTemplate.value = savedTemplate;
    }

    // templateDialogVisible.value = false;

    // Refetch all templates to ensure data consistency
    refetchAllSalaryTemplates();
  }
});

saveSalaryTemplateError((error) => {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t('hrm.salary.template.saveError'),
    life: 3000
  });
});

deleteSalaryTemplateDone(() => {
  toast.add({
    severity: 'success',
    summary: t('common.success'),
    detail: t('hrm.salary.template.deleteSuccess'),
    life: 3000
  });

  // Refetch all templates to ensure data consistency
  refetchAllSalaryTemplates();
  selectedTemplate.value = templates.value[0] || null;
});

deleteSalaryTemplateError((error) => {
  toast.add({
    severity: 'error',
    summary: t('common.error'),
    detail: t('hrm.salary.template.deleteError'),
    life: 3000
  });
});

// Methods
function onTemplateSelect(event: any) {
  selectedTemplate.value = event.data;
}

function onTemplateUnselect() {
  // Keep the first template selected if user tries to unselect
  if (templates.value.length > 0) {
    selectedTemplate.value = templates.value[0];
  }
}

function toggleTemplateActionMenu(event: Event, template: SalaryTemplate) {
  selectedTemplateForAction.value = template;
  updateTemplateMenuItems();
  templateMenu.value.toggle(event);
}

function toggleColumnActionMenu(event: Event, column: TemplateColumn) {
  selectedColumnForAction.value = column;
  updateColumnMenuItems();
  columnMenu.value.toggle(event);
}

function toggleTemplateStatus() {
  if (selectedTemplateForAction.value && selectedTemplateForAction.value.id) {
    const newStatus = selectedTemplateForAction.value.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    confirm.require({
      message: selectedTemplateForAction.value.status === 'ACTIVE' 
        ? `${t('hrm.salary.template.deactivateConfirm')}: ${selectedTemplateForAction.value.name}`
        : `${t('hrm.salary.template.activateConfirm')}: ${selectedTemplateForAction.value.name}`,
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        updateStatusTemplateMutate({ 
          id: selectedTemplateForAction.value?.id, 
          status: newStatus 
        });
      },
    });
  }
}

function toggleColumnStatus() {
  if (selectedColumnForAction.value && selectedColumnForAction.value.id) {
    const newStatus = selectedColumnForAction.value.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    confirm.require({
      message: selectedColumnForAction.value.status === 'ACTIVE'
        ? `${t('hrm.salary.columns.deactivateConfirm')}: ${selectedColumnForAction.value.name}`
        : `${t('hrm.salary.columns.activateConfirm')}: ${selectedColumnForAction.value.name}`,
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        updateStatusColumnMutate({ 
          id: selectedColumnForAction.value?.id, 
          status: newStatus 
        });
      },
    });
  }
}

function openCreateTemplateDialog() {
  // Reset the template form to initial state when creating a new template
  templateForm.value = {
    name: '',
    description: '',
    type: '',
    status: 'ACTIVE'
  };
  editingTemplate.value = null;
  templateDialogVisible.value = true;
}

function openEditTemplateDialog() {
  if (selectedTemplateForAction.value) {
    editingTemplate.value = selectedTemplateForAction.value;
    templateForm.value = {
      ...selectedTemplateForAction.value,
      type: selectedTemplateForAction.value.type || ''
    };
    templateDialogVisible.value = true;
  }
}

function openEditColumnDialog() {
  if (selectedColumnForAction.value && selectedColumnForAction.value.id) {
    editingColumn.value = selectedColumnForAction.value;
    editingColumnId.value = selectedColumnForAction.value.id; // Pass the ID for edit
    columnDialogVisible.value = true;
  }
}

function onSaveTemplate(template: any) {
  // This is a callback function after the template has been saved in TemplateSidebar
  // The API call is already handled in TemplateSidebar component
  // templateDialogVisible.value = false;
  // Refetch all templates to ensure data consistency after save operation
  refetchAllSalaryTemplates();
}

function onCancelTemplate() {
  templateDialogVisible.value = false;
}

function onSaveColumn(columnData: any) {
  // If editingColumnId is null, it means we're creating a new column
  let columnInput;
  console.log(columnData);
  if (!editingColumnId.value) {
    // Prepare the payload for adding a new column
    columnInput = {
      id: columnData.id,
      code: columnData.code,
      templateId: selectedTemplate.value?.id, // Use the currently selected template ID
      name: columnData.name,
      dataType: columnData.dataType,
      isTotal: columnData.isTotal,
      orderNumber: columnData.orderNumber || 0,
      status: columnData.status || 'ACTIVE',
      subColumns: columnData.subColumns || [],
      columnType: columnData.columnType,
      formula: columnData.formula || null,
      columnDataSystem: columnData.columnDataSystem || null
    };

  } else {
    // If editingColumnId exists, we're updating an existing column
    // For now, just refetch the data to ensure consistency
    columnInput = {
      id: columnData.id,
      code: columnData.code,
      templateId: selectedTemplate.value?.id, // Use the currently selected template ID
      name: columnData.name,
      dataType: columnData.dataType,
      isTotal: columnData.isTotal,
      orderNumber: columnData.orderNumber || 0,
      status: columnData.status || 'ACTIVE',
      subColumns: columnData.subColumns || [],
      columnType: columnData.columnType,
      formula: columnData.formula || null,
      columnDataSystem: columnData.columnDataSystem || null
    };
  }

  addColumnTemplateMutate({ payload: columnInput });
  
  columnDialogVisible.value = false;
  // Reset the editing ID after save
  editingColumnId.value = null;
}

function onCancelColumn() {
  columnDialogVisible.value = false;
  editingColumnId.value = null;
}

function onTemplateDialogVisibleChange(visible: boolean) {
  templateDialogVisible.value = visible;
  // Reset form when dialog is closed to ensure clean state
  if (!visible) {
    templateForm.value = {
      name: '',
      description: '',
      type: '',
      status: 'ACTIVE'
    };
    editingTemplate.value = null;
  }
}

function onColumnDialogVisibleChange(visible: boolean) {
  columnDialogVisible.value = visible;
  if (!visible) {
    editingColumnId.value = null;
  }
}

function getColumnTypeSeverity(type: string) {
  switch (type) {
  case 'STRING':
    return 'info';
  case 'NUMBER':
    return 'success';
  case 'DATE':
    return 'warning';
  default:
    return 'info';
  }
}

function getColumnTypeName(type: string) {
  switch (type) {
  case 'STRING':
    return t('hrm.salary.salary.columnTypes.text');
  case 'INTEGER':
    return t('hrm.salary.salary.columnTypes.number');
  case 'DATE':
    return t('hrm.salary.salary.columnTypes.date');
  default:
    return type;
  }
}

function selectFirstTemplate() {
  if (templates.value.length > 0 && !selectedTemplate.value) {
    selectedTemplate.value = templates.value[0];
  }
}

// Watch for selection changes to ensure a template is always selected
watch(selectedTemplate, (newVal) => {
  if (!newVal && templates.value.length > 0) {
    // If no template is selected, select the first one
    nextTick(() => {
      selectedTemplate.value = templates.value[0];
    });
  }
});
</script>

<style scoped>
.salary-template-setting {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.border-bottom-1 {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-paginator-bottom) {
  position: absolute;
  bottom: 20px;
  width: 100%;
}

.text-overflow-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>