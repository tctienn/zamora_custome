<template>

  <DataTable
    group-rows-by='group'
    :loading='getPropertyLoading'
    row-group-mode='subheader'
    sort-field='group'
    :total-records='totalRecords'
    :value='properties'
    v-bind='DEFAULT_DATATABLE_CONFIG'
    @page='onPage($event)'
    @sort='onSort($event)'>
    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <div class='align-items-center column-gap-2 flex flex-row'>
          <ButtonIcon
            v-tooltip.top='t("common.create")'
            class='text-white'
            icon='add_circle'
            rounded
            text
            @click='showPropertyFormDialog'/>

          <span class='font-bold text-primary text-white text-xl'>{{
            t('admin.objectTemplate.property.tableTitle')
          }}: {{ t('admin.objectTemplate.objectName') }} {{ object.name }}</span>
        </div>

        <div class='search-input-wrapper'>
          <AppIcon
            name='search'
            size='1.5'/>
          <InputText
            v-model='searchKeyword'
            :placeholder='t("common.search")'
            @keyup.enter='searchDatatable'/>
        </div>
      </div>
    </template>

    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', { itemType: toLower(t('admin.objectTemplate.property.objectName')) })
      }}</span>
    </template>

    <Column
      field='ordinalNumber'
      :header='t("common.ordinalNumber")'>
      <template #body='slotProps'>
        <span>{{ slotProps.index + 1 + pageable.page * pageable.size }}</span>
      </template>
    </Column>

    <Column
      field='fieldName'
      :header='t("admin.objectTemplate.property.fieldName")'
      :sortable='true'></Column>

    <Column
      field='name'
      :header='t("admin.objectTemplate.property.name")'
      :sortable='true'></Column>

    <Column
      field='dataType'
      :header='t("admin.objectTemplate.property.dataType")'
      :sortable='true'>
    </Column>

    <Column
      field='referenceData'
      :header='t("admin.objectTemplate.property.referenceData")'
      :sortable='true'></Column>

    <Column
      field='type'
      :header='t("admin.objectTemplate.property.type.title")'
      :sortable='true'>
    </Column>

    <Column
      field='defaultValue'
      :header='t("admin.objectTemplate.property.defaultValue")'
      :sortable='true'>
    </Column>

    <Column
      field='group'
      :header='t("admin.objectTemplate.property.group")'
      :sortable='true'>
    </Column>

    <Column
      field='status'
      :header='t("common.status")'
      :sortable='true'>
      <template #body='{data: {status}}'>
        <span
          class='status-badge'
          :class='`status-${toLower(status)}`'>{{ status ? t(`common.statuses.${toLower(status)}`) : '' }}</span>
      </template>
    </Column>

    <Column
      class='text-center'
      :header='t("common.action")'>
      <template #body='{data}'>
        <ButtonIcon
          v-tooltip.top='t("common.action")'
          class='text-color'
          icon='list'
          rounded
          text
          @click='toggleActionMenu({event : $event, data : data})'/>
      </template>
    </Column>

    <template #groupheader='slotProps'>
      <div class='flex font-bold justify-content-start w-full'>
        {{ t('admin.objectTemplate.property.group') }}: {{ slotProps.data.group }}
      </div>
    </template>
  </DataTable>

  <Menu
    ref='menuAction'
    :model='isPropertyFromAdmin?menuActionsForGlobal:menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <PropertyForm
    v-if='propertyFormVisible'
    :is-view='isView'
    :item='property'
    :object-id='object.id'
    :visible-dialog='propertyFormVisible'
    @hide-dialog='hidePropertyFormDialog'
    @reload='reload'/>

</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, orderBy, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { deletePropertyGraphql, getObjectGraphql } from '@/apps/admin/api/graphql/object-graphql-api';
import type { ObjectInterface } from '@/apps/admin/model/object';
import { ObjectImpl } from '@/apps/admin/model/object';
import type { PropertyInterface } from '@/apps/admin/model/object/Property';
import { Property, PropertyType } from '@/apps/admin/model/object/Property';
import PropertyForm from '@/apps/admin/views/object/property/PropertyForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastError, toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import { convertAlias } from '@/common/helpers/utils';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const route = useRoute();

const { objectId } = route.query;

const searchKeyword = ref('');
const totalRecords = ref(0);
const getPropertyLoading = ref(true);
const object = reactive<ObjectInterface>(new ObjectImpl());
const properties = ref<PropertyInterface[]>([]);
let allProperties: Property[] = [];
const property = ref<PropertyInterface>(new Property());
const propertyFormVisible = ref(false);
const isView = ref(false);
const isPropertyFromAdmin = ref(false);

const {
  onResult: getObjectResult,
  onError: getObjectError,
  refetch: getObjectRefetch
} = getObjectGraphql(objectId as string);

getObjectResult((response) => {
  assign(object, get(response, 'data.getObjectTemplateById', { properties: [] }));

  totalRecords.value = object.properties.length;
  properties.value = orderBy(object.properties, ['fieldName', 'desc']);
  allProperties = object.properties;
  getPropertyLoading.value = false;
});

getObjectError((error: object) => {
  getPropertyLoading.value = false;
  toastErrorData({
    prefix: 'property.errors',
    error
  });
});

function searchDatatable() {
  const aliasKeyword = convertAlias(searchKeyword.value);
  properties.value = allProperties.filter(item => {
    return convertAlias(item.fieldName).includes(aliasKeyword)
      || convertAlias(item.name).includes(aliasKeyword);
  });
}

function reload(objectProperties: Property[] = []) {
  if (objectProperties && objectProperties.length) {
    properties.value = objectProperties;
    allProperties = objectProperties;
  } else {
    getObjectRefetch({ id: objectId as string });
  }
}

function showPropertyFormDialog() {
  propertyFormVisible.value = true;
  isView.value = false;
  assign(properties.value, new Property());
}

function editProperty() {
  propertyFormVisible.value = true;
  isView.value = false;
}

function viewProperty() {
  propertyFormVisible.value = true;
  isView.value = true;
}

function hidePropertyFormDialog() {
  propertyFormVisible.value = false;
  assign(property.value, new Property());
}

const menuAction = ref();

const menuActionsForGlobal = [
  {
    label: t('common.detail'),
    icon: 'visibility',
    command: () => {
      viewProperty();
    }
  }
];

const menuActions = [
  {
    label: t('common.detail'),
    icon: 'visibility',
    command: () => {
      viewProperty();
    }
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editProperty();
    }
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteProperty();
    }
  }
];

function toggleActionMenu({
  event,
  data
}: { event: Event, data: PropertyInterface }) {
  menuAction.value.toggle(event);
  property.value = cloneDeep(data);
  isPropertyFromAdmin.value = data.type === PropertyType.GLOBAL;
}

const {
  mutate: deletePropertyMutate,
  onDone: deletePropertyDone,
  onError: deletePropertyError
} = deletePropertyGraphql();

const confirm = useConfirm();

function deleteProperty() {
  if (property.value.type === PropertyType.PRIVATE) {
    confirm.require({
      message: t('common.confirmDelete', {
        itemType: t('admin.objectTemplate.property.objectName'),
        itemName: property.value.name
      }),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: t('common.delete'),
      acceptClass: 'p-button-danger',
      accept: () => {
        deletePropertyMutate({
          objectId: object.id,
          propertyFieldName: property.value.fieldName
        });
      }
    });
  } else {
    toastError({ message: t('admin.objectTemplate.property.errors.deleteFieldGlobal') });
  }
}

deletePropertyDone((response) => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.objectTemplate.property.propertyName'),
      itemName: property.value.name
    })
  });
  confirm.close();
  reload(get(response, 'data.deleteObjectProperty', []));
  property.value = new Property();
});

deletePropertyError((error) => {
  toastErrorData({ error });
});

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'code',
      direction: Direction.ASC
    }
  ]
});

const searchParams = reactive({
  keyword: '',
  pageable: pageable
});

function onPage(event: { page: number, rows: number }) {
  const {
    page,
    rows
  } = event;
  assign(pageable, {
    page,
    size: rows,
  });
  assign(searchParams, pageable);
  reload();
}

function onSort(event: DataTableSortEvent) {
  const {
    sortField,
    sortOrder
  } = event;
  assign(pageable, {
    page: 0,
    sort: [
      {
        property: sortField,
        direction: sortOrder === 1 ? 'ASC' : 'DESC'
      }
    ]

  });
  assign(searchParams, pageable);
  reload();
}

</script>

<script lang='ts'>
export default { name: 'PropertyManager' };
</script>