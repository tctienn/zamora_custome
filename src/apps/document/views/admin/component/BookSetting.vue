<template>
  <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
    <span class='font-bold text-primary text-xl'>{{
      t("document.generalSetting.generalSetting")
    }}</span>
  </div>
  <div class='mt-2'>
    <span class='font-bold'>1. {{ t("document.generalSetting.settingBook") }}</span>
    <span>{{ t("document.generalSetting.settingBookDescription") }}</span>
  </div>
  <div class='col-12'>
    <div class='flex gap-8'>
      <div class='align-items-center flex gap-2'>
        <RadioButton
          v-model='structureType'
          value='ADMINISTRATIVE'/>
        <span>{{ t("document.book.ADMINISTRATIVE") }}</span>
      </div>
      <div class='align-items-center flex gap-2'>
        <RadioButton
          v-model='structureType'
          value='PARTY'/>
        <span>{{ t("document.book.PARTY") }}</span>
      </div>
      <div class='align-items-center flex gap-2'>
        <RadioButton
          v-model='structureType'
          value='UNION'/>
        <span>{{ t("document.book.UNION") }}</span>
      </div>
    </div>
  </div>
  <div class='gap-3 grid'>
    <div class='col-4'>
      <div class='align-items-center flex justify-content-between mb-2'>
        <span>{{ t("document.generalSetting.chooseOrgParent") }}</span>
        <ButtonIcon
          icon='add'
          icon-size='1'
          @click='showDialogChooseOrgParent'/>
      </div>
      <OrderList
        v-model='orgParents'
        data-key='id'
        :meta-key-selection='true'
        :selection='org'
        @selection-change='onSelectionChange'>
        <template #item='slotProps'>
          <div
            class='align-items-center flex gap-3 justify-content-between p-2 row-item'>
            <div class='flex gap-4'>
              <div class='w-1rem'>{{ slotProps.index + 1 }}</div>
              <span>{{ findOrgById(slotProps.item) }}</span>
            </div>
            <ButtonIcon
              class='icon-delete'
              icon='delete'
              icon-size='1'
              outlined
              @click='handleDeleteOrgParent(slotProps.item)'/>
          </div>
        </template>
      </OrderList>
    </div>
    <div class='col-4'>
      <div class='align-items-center flex justify-content-between mb-2'>
        <span>{{ t("document.generalSetting.chooseOrg") }}</span>
        <ButtonIcon
          icon='add'
          icon-size='1'
          @click='showDialogChooseOrg'/>
      </div>
      <div class='container-list'>
        <div
          v-for='(item, index) in listOrgChild'
          :key='index'
          class='hover:surface-100'
          style='padding: 0 1rem'>
          <div
            class='align-items-center flex gap-3 justify-content-between p-2 row-item'>
            <div class='flex gap-4'>
              <div class='w-1rem'>{{ index + 1 }}</div>
              <span>{{ findOrgById(item) }}</span>
            </div>
            <ButtonIcon
              class='icon-delete'
              icon='delete'
              icon-size='1'
              outlined
              @click='handleDeleteOrgChild(item)'/>
          </div>
        </div>
      </div>
    </div>
  </div>
  <DialogChooseOrg
    v-if='orgDialogVisible'
    :is-choose-parent-org='isChooseParentOrg'
    :list-org-child='listOrgChild'
    :org='org[0]'
    :org-dialog-visible='orgDialogVisible'
    :type='structureType'
    @hide-dialog='hideDialogChooseOrg'
    @reload='reload'/>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import { useConfirm } from 'primevue/useconfirm';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import {
  deleteOrgChild,
  deleteOrgParent,
  getAllOrgConfig,
  getOrgChildrenByOrgId,
} from '@/apps/document/api/graphql/org-config';
import { getAllOrg } from '@/apps/document/api/graphql/organization';
import { OrganizationType } from '@/apps/document/model/organization';
import DialogChooseOrg from '@/apps/document/views/admin/component/DialogChooseOrg.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';

const { t } = useI18n();
const structureType = ref(OrganizationType.ADMINISTRATIVE);
const orgParents = ref<any[]>([]);
const orgDialogVisible = ref(false);
const listAllOrg = ref<any[]>([]);
const listOrg = ref<any[]>([]);
const isChooseParentOrg = ref(true);
const org = ref([]);
const listOrgChild = ref<any>([]);
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
const { onResult: getAllOrgResult } = getAllOrg();
const { onResult: orgConfigResult, refetch: orgConfigRefetch } =
    getAllOrgConfig(structureType.value);
const {
  load: loadOrgChild,
  refetch: orgChildrefetch,
  onResult: orgChildResult,
} = getOrgChildrenByOrgId();
loadOrgChild();
orgChildResult((res) => {
  const data = get(res, 'data.getOrgChildrenByOrgId');
  listOrgChild.value = data
    .filter((item: any) => item.orgChildId !== null && item.orgChildId !== '')
    .map((item: any) => item.orgChildId);
});
Promise.all([
  getAllOrganizationResult((response) => {
    const allOrganizations = get(response, 'data.allOrganizationPublic', []);
    listOrg.value = [...listOrg.value, ...allOrganizations];
  }),
  getAllOrgResult((response) => {
    const allOrgs = get(response, 'data.getAll', []);
    listOrg.value = [...listOrg.value, ...allOrgs];
  }),
]).then(() => {
  orgConfigResult((res) => {
    const data = get(res, 'data.getAllOrgConfig');
    listAllOrg.value = data;
    orgParents.value = Array.from(
      new Set(data?.map((org: any) => org.orgParentId)),
    );
  });
});

watch(structureType, (newValue) => {
  orgConfigRefetch({ type: newValue });
  listOrgChild.value = [];
});

const { mutate: deleteOrgParentMutate, onDone: deleteOrgParentDone } =
    deleteOrgParent();
const { mutate: deleteOrgChildMutate, onDone: deleteOrgChildDone } =
    deleteOrgChild();
const confirm = useConfirm();

const onSelectionChange = (e: any) => {
  org.value = e.value;
  orgChildrefetch({ id: org.value[0] });
};

function handleDeleteOrgParent(id: string) {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: '',
      itemName: findOrgById(id),
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteOrgParentMutate({ orgParentId: id });
    },
  });
}

function handleDeleteOrgChild(id: string) {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: '',
      itemName: findOrgById(id),
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteOrgChildMutate({
        orgParentId: org.value[0],
        orgChildId: id,
      });
    },
  });
}

deleteOrgParentDone(() => {
  reload();
});

deleteOrgChildDone(() => {
  orgChildrefetch({ id: org.value[0] });
});

function reload() {
  orgConfigRefetch();
  listOrgChild.value = [];
}

function hideDialogChooseOrg() {
  orgDialogVisible.value = false;
  reload();
  orgChildrefetch({ id: org.value[0] });
}

function showDialogChooseOrgParent() {
  orgDialogVisible.value = true;
  isChooseParentOrg.value = true;
}

function showDialogChooseOrg() {
  orgDialogVisible.value = true;
  isChooseParentOrg.value = false;
}

function findOrgById(id: string) {
  return listOrg.value.find((obj) => obj.id === id)?.name;
}
</script>

<style scoped>
:deep(.p-button) {
  padding: 0.5rem 0.5rem;
}

:deep(.p-orderlist-controls) {
  display: none;
}

:deep(.p-orderlist .p-orderlist-list .p-orderlist-item) {
  padding: 0 1rem;
}

.icon-delete {
  visibility: hidden;
}

.row-item:hover {
  .icon-delete {
    visibility: visible;
  }
}

.container-list {
  border: 1px solid var(--surface-border);
  background-color: var(--surface-card);
  padding: 0.75rem 0;
  border-radius: 6px;
  transition: background-color 0.2s,
  color 0.2s,
  border-color 0.2s,
  box-shadow 0.2s;
  outline-color: transparent;
  min-height: 12rem;
  max-height: 24rem;
}
</style>
