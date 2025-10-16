<template>
  <div class='mt-2'>
    <span class='font-bold'>3. {{ t("document.generalSetting.leaderOrgSummaryConfig") }}:
    </span>
    <span>{{ t("document.generalSetting.desLeaderOrgSummaryConfig") }}</span>
  </div>
  <div class='col-12'>
    <div class='flex justify-content-between'>
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

      <ButtonIcon
        icon='add'
        icon-size='1'
        @click='onAddClick'/>
    </div>
  </div>
  <DataTable :value='listClericalCharged'>
    <Column
      class='text-center'
      header='#'
      style='max-width: 5%'>
      <template #body='slotProps'>
        {{ slotProps.index + 1 }}
      </template>
    </Column>
    <Column
      field='userId'
      header='Tên lãnh đạo'
      style='width: 35%'>
      <template #body='slotProps'>
        <Dropdown
          v-model='slotProps.data.userId'
          :button-select-user='false'
          class='w-full'
          name='userId'
          option-label='fullName'
          option-value='id'
          :options='filteredClerical'
          :placeholder="'Chọn'"
          :pt="{
            input: {
              class: 'px-3 py-0 flex align-items-center',
              style: 'min-height: 37px',
            },
          }">
          <template #value='slotProps'>
            <AppUser
              v-if='slotProps.value'
              avatar-size='2'
              name-visible
              :user-id='slotProps.value'/>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>
          <template #option='slotProps'>
            <AppUser
              avatar-size='2.5'
              info-visible
              :infos="['positionName', 'departments']"
              name-visible
              :user-id='slotProps.option.id'></AppUser>
          </template>
        </Dropdown>
      </template>
    </Column>
    <Column
      field='deptIds'
      header='Đơn vị'
      style='width: 45%'>
      <template #body='slotProps'>
        <TreeSelect
          v-model='slotProps.data.deptId'
          class='w-full'
          :empty-message="t('common.selectEmpty')"
          :filter='true'
          input-id='organizationParent'
          :options='organizations'>
        </TreeSelect>
      </template>
    </Column>
    <Column
      class='text-center'
      :header="t('common.action')"
      style='max-width: 10%'>
      <template #body='slotProps'>
        <ButtonIcon
          v-tooltip.top="t('common.delete')"
          icon='delete'
          icon-size='1.7'
          rounded
          text
          @click='removeRow(slotProps.index, slotProps.data)'/>
      </template>
    </Column>
  </DataTable>
  <div class='flex justify-content-center mt-2 w-full'>
    <Button
      label='Lưu thiết lập'
      @click='submit'/>
  </div>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getUsersByRole } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import {
  deleteLeaderOrgSummaryConfig,
  getAllLeaderOrgSummaryConfigs,
  saveLeaderOrgSummaryConfig,
} from '@/apps/document/api/graphql/leader-org-summary-config';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import { getAllUserOrganization } from '@/apps/document/api/graphql/userOrganization';
import type { LeaderOrgSummaryConfig } from '@/apps/document/model/leaderOrgSummaryConfig';
import { OrganizationType } from '@/apps/document/model/organization';
import { RoleType } from '@/apps/document/model/permission';
import AppUser from '@/common/components/app/AppUser.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';

const { t } = useI18n();
const structureType = ref(OrganizationType.ADMINISTRATIVE);
const listClericalCharged = ref<LeaderOrgSummaryConfig[]>([]);
const clerical = ref();

function onAddClick() {
  listClericalCharged.value.push({
    id: undefined,
    userId: '',
    deptId: undefined,
  });
}

const {
  onResult: getAllLeaderOrgSummaryConfigsByOrgTypeOnResult,
  refetch: getAllLeaderOrgSummaryConfigsByOrgTypeRefetch,
} = getAllLeaderOrgSummaryConfigs(structureType.value);

getAllLeaderOrgSummaryConfigsByOrgTypeOnResult((res) => {
  listClericalCharged.value = [];
  const data = res?.data?.getAllLeaderOrgSummaryConfigs;
  data.forEach((item: any) => {
    listClericalCharged.value.push({
      id: item.id,
      userId: item.userId,
      deptId: { [item.deptId]: true },
    });
  });
});

function reload() {
  getAllLeaderOrgSummaryConfigsByOrgTypeRefetch({ orgType: structureType.value, });
}

const userIdList = computed(() => {
  return listClericalCharged.value.map((item) => item.userId);
});

const filteredClerical = computed(() => {
  return clerical.value?.filter(
    (item: any) => !userIdList.value.includes(item.id.toString()),
  );
});

const {
  mutate: saveLeaderOrgSummaryConfigMutate,
  onDone: saveLeaderOrgSummaryConfigOnDone,
} = saveLeaderOrgSummaryConfig();

function submit() {
  const data = listClericalCharged.value.map((item) => ({
    ...item,
    deptId: Object.keys(item.deptId)[0],
  }));
  saveLeaderOrgSummaryConfigMutate({
    data: {
      list: data,
      orgType: structureType.value,
    },
  });
}

saveLeaderOrgSummaryConfigOnDone(() => {
  toastSuccess({ message: t('Lưu thành công.') });
  reload();
});

const { onResult: getUsersByRoleResult, refetch: getUsersByRoleRefetch } =
    getUsersByRole(RoleType.LANH_DAO);
getUsersByRoleResult((res) => {
  clerical.value = res.data.findByRole;
});

const organizations = ref([]);
const fetchOrganizations = (type: string) => {
  if (type === OrganizationType.ADMINISTRATIVE) {
    const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
    getAllOrganizationResult((response) => {
      const data = get(response, 'data.allOrganizationPublic', []);
      organizations.value = listToTree(
        data.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.code,
          parentId: organization.parentCode,
          children: [],
        })),
        {
          id: 'data',
          parentId: 'parentId',
          children: 'children',
        },
      );
    });
  } else {
    const { onResult: getOrganizationResult } = getByTypeGraphql(type);
    getOrganizationResult((res) => {
      const data = res.data.getByType;
      organizations.value = listToTree(
        data.map((organization: OrganizationInterface) => ({
          key: organization.id,
          label: organization.name,
          data: organization.id,
          parentId: organization.parentId,
          children: [],
        })),
        {
          id: 'key',
          parentId: 'parentId',
          children: 'children',
        },
      );
    });
  }
};

const {
  mutate: deleteLeaderOrgSummaryConfigMutate,
  onDone: deleteLeaderOrgSummaryConfigDone,
} = deleteLeaderOrgSummaryConfig();
const confirm = useConfirm();

function handleDeleteClericalCharged(index: number, id: string) {
  confirm.require({
    message: t('document.clericalCharged.confirmDelete'),
    header: t('common.confirm'),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteLeaderOrgSummaryConfigMutate({ id: id });
      listClericalCharged.value.splice(index, 1);
    },
  });
}

deleteLeaderOrgSummaryConfigDone(() => {
  toastSuccess({ message: t('document.clericalCharged.deleteDone') });
});

onMounted(() => {
  fetchOrganizations(structureType.value);
});
watch(structureType, (newValue) => {
  fetchOrganizations(newValue);
  listClericalCharged.value = [];
  getAllLeaderOrgSummaryConfigsByOrgTypeRefetch({ orgType: structureType.value, });
  if (newValue === OrganizationType.ADMINISTRATIVE) {
    getUsersByRoleRefetch();
  }
  if (newValue === OrganizationType.PARTY) {
    getAllUserOrganization().onResult((param1) => {
      const data = get(param1, 'data.getAllUserOrganization', []);
      clerical.value = data.filter(
        (item: any) => item.role === RoleType.LANH_DAO,
      );
      clerical.value = clerical.value.map((item: any) => {
        return {
          ...item,
          id: item.userId,
        };
      });
    });
  }
});

function removeRow(index: number, data: any) {
  handleDeleteClericalCharged(index, data.id);
}
</script>

<style scoped></style>
