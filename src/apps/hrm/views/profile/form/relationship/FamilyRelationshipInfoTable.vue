<template>
  <div class='align-items-center flex flex-wrap justify-content-between pb-2 text-primary'>
    <span class='font-bold text-lg'>{{ label }}</span>
  </div>

  <DataTable
    v-model:selection='selectedRow'
    class='overflow-auto'
    row-hover
    selection-mode='single'
    style='max-height: unset'
    :value='relationships'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <Column
      class='text-center'
      frozen
      header='#'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='relationship'
      frozen
      :header='t(`hrm.relationship.relationship`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='name'
      frozen
      :header='t(`hrm.relationship.name`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='yearBirth'
      :header='t(`hrm.relationship.yearBirth`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='phone'
      :header='t(`hrm.relationship.phone`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='cccdNumber'
      :header='t(`hrm.relationship.cccdNumber`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='dateIssueCCCD'
      :header='t(`hrm.relationship.dateIssueCCCD`)'
      style='min-width: 10vw'>
      <template #body='{ data: { dateIssueCCCD } }'>
        {{ dateIssueCCCD && moment(dateIssueCCCD).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='placeIssueCCCD'
      :header='t(`hrm.relationship.placeIssueCCCD`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='taxCode'
      :header='t(`hrm.relationship.taxCode`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='hometown'
      :header='t(`hrm.relationship.hometown`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='job'
      :header='t(`hrm.relationship.job`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='workUnit'
      :header='t(`hrm.relationship.workUnit`)'
      style='min-width: 12vw'>
    </Column>
    <Column
      field='jobTitle'
      :header='t(`hrm.relationship.jobTitle`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='address'
      :header='t(`hrm.relationship.address`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      field='memberSocialWorkOrganization'
      :header='t(`hrm.relationship.isMemberSocialWorkOrganization`)'
      style='min-width: 12vw'>
    </Column>
    <Column
      class='text-center'
      field='isDependent'
      :header='t(`hrm.relationship.isDependent`)'
      style='min-width: 10vw'>
      <template #body='{ data: { isDependent } }'>
        <AppIcon
          v-if='isDependent'
          name='check'
          size='1.7'/>
      </template>
    </Column>
    <Column
      class='text-center'
      field='fromDate'
      :header='t(`hrm.relationship.fromDate`)'
      style='min-width: 10vw'>
      <template #body='{ data: { fromDate } }'>
        {{ fromDate && moment(fromDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='toDate'
      :header='t(`hrm.relationship.toDate`)'
      style='min-width: 10vw'>
      <template #body='{ data: { toDate } }'>
        {{ toDate && moment(toDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='isWorkSameOffice'
      :header='t(`hrm.relationship.isWorkSameOffice`)'
      style='min-width: 10vw'>
      <template #body='{ data: { isWorkSameOffice } }'>
        <AppIcon
          v-if='isWorkSameOffice'
          name='check'
          size='1.7'/>
      </template>
    </Column>
    <Column
      class='text-center'
      field='isDead'
      :header='t(`hrm.relationship.isDead`)'
      style='min-width: 5vw'>
      <template #body='{ data: { isDead } }'>
        <AppIcon
          v-if='isDead'
          name='check'
          size='1.7'/>
      </template>
    </Column>
    <Column
      align-frozen='right'
      body-class='surface-card p-2'
      frozen
      style='max-width: 4rem'>
      <template #body='{data}'>
        <Button
          v-if='!isEditBySelf && !profileStatus || profileStatus === "DRAFT" && isEditBySelf'
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='toggleActionMenu($event, data)'></Button>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
  </Menu>

  <RelationshipInfoForm
    v-if='showForm'
    :id='selectedRow.id'
    :snapshot-id='snapshotId'
    :type='type'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteFamilyRelationshipInfo } from '@/apps/hrm/api/graphql/employee-relationship';
import { RELATIONSHIP_TYPE } from '@/apps/hrm/constants/category';
import type { FamilyRelationshipInfo } from '@/apps/hrm/model/employee';
import RelationshipInfoForm from '@/apps/hrm/views/profile/form/relationship/RelationshipInfoForm.vue';
import type { IBookingCar } from '@/apps/vehicle/model/bookingCar';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: RELATIONSHIP_TYPE.WITH_YOURSELF
  },
  snapshotId: {
    type: String,
    default: null
  },
  data: {
    type: Array as PropType<FamilyRelationshipInfo[]>,
    default: () => []
  }
});
const { t } = useI18n();
const { moment } = useMoment();
const selectedRow = ref<FamilyRelationshipInfo>({} as FamilyRelationshipInfo);
const showForm = ref(false);
const menuRef = ref();
const confirm = useConfirm();

const relationships = computed(() => props.data);

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
      confirmDeleteRelationship();
    },
  },
];

const {
  mutate: deleteFamilyRelationshipInfoMutate,
  onDone: deleteFamilyRelationshipInfoDone,
} =
  deleteFamilyRelationshipInfo();

const confirmDeleteRelationship = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.name, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteRelationship();
    },
  });
};

const handleDeleteRelationship = () => {
  deleteFamilyRelationshipInfoMutate({ id: selectedRow.value?.id });
};

const injectedRefreshTable = inject('refreshFamilyRelationshipInfoTable', ref(false));
deleteFamilyRelationshipInfoDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  injectedRefreshTable.value = true;
});

function showFormCreate() {
  selectedRow.value = {} as FamilyRelationshipInfo;
  showForm.value = true;
}

function hideDialogFn() {
  showForm.value = false;
  injectedRefreshTable.value = true;
}

const isEditBySelf = inject('isEditBySelf', ref(false));
const profileStatus = inject('profileStatus', ref(''));
</script>

<style scoped>
:deep(.p-datatable-wrapper) {
  overflow: hidden !important;
}

:deep(.p-datatable-wrapper:hover) {
  overflow: auto !important;
}
</style>