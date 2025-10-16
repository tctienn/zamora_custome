<template>
  <span class='font-bold text-primary text-xl'>{{
    t("document.textSymbol.textSymbol")
  }}</span>
  <Splitter
    class='mt-2'
    style='border: none; height: 86vh'>
    <SplitterPanel
      class='p-0'
      :size='10'>
      <TabMenu
        v-model:active-index='activeOrgType'
        class='w-full'
        :model='orgTypes'
        :pt="{
          action: 'p-3',
        }">
      </TabMenu>
      <Tree
        v-model:selectionKeys='selectedOrganization'
        class='overflow-auto w-full'
        :empty-message="t('common.selectEmpty')"
        input-id='organizationParent'
        selection-mode='single'
        style='height: 80vh'
        :value='organizations'>
        <template #default='slotProp'>
          <div
            :class="[
              'align-items-center',
              'flex',
              'justify-content-between',
              'edge',
            ]">
            {{ slotProp.node.label }}
          </div>
        </template>
      </Tree>
    </SplitterPanel>

    <SplitterPanel>
      <div v-if='selectedOrganization'>
        <div class='font-bold m-2'>
          {{ t("document.textSymbol.config") }}
        </div>
        <DataTable
          table-style='width: 40rem'
          :value='items'>
          <Column header='STT'>
            <template #body='{ data }'>
              <div class='flex justify-content-center'>
                <InputOtp
                  v-model='data.order'
                  :length='1'
                  @input='(event: any) => validateOrderInput(event, data)'/>
              </div>
            </template>
          </Column>
          <Column
            class='text-center'
            field='name'
            header='Nội dung'></Column>
          <Column header='Dấu ngăn cách'>
            <template #body='{ data }'>
              <div class='flex justify-content-center'>
                <InputOtp
                  v-model='data.separator'
                  :length='1'
                  @input='(event: any) => validateSeparatorInput(event, data)'/>
              </div>
            </template>
          </Column>
        </DataTable>
        <div class='font-bold m-2 mt-3'>
          {{ t("document.textSymbol.example") }}:
        </div>
        <span class='ml-2'>Số VB/Loại VB-VCB-Đơn vị soạn thảo văn bản: </span>
        <span class='font-bold'>20/BB-VCB-VP</span>

        <div class='mt-2'></div>
        <span class='ml-2'>Kết quả: </span>
        <span class='font-bold'>{{ combinedString }}</span>

        <div class='flex justify-content-center mt-2'>
          <Button
            icon='pi pi-save'
            :label="t('common.save')"
            type='submit'
            @click='save'/>
        </div>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import InputOtp from 'primevue/inputotp';
import type { MenuItem } from 'primevue/menuitem';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import {
  getTextSymbolByDeptId,
  saveTextSymbol,
} from '@/apps/document/api/graphql/text-symbol';
import { OrganizationType } from '@/apps/document/model/organization';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';

const { t } = useI18n();
const organizations = ref();
const activeOrgType = ref(0);
const selectedOrganization = ref();
const templateText = ref();

watch(selectedOrganization, () => {
  resetOrdersAndSeparators();
  const { onResult } = getTextSymbolByDeptId(
    Object.keys(selectedOrganization.value)[0],
  );
  onResult((res) => {
    const data = res.data.getTextSymbolByDeptId;
    parseAndAssignValues(data);
    generateCodeString();
  });
});

const { mutate: saveTextSymbolMutate, onDone: saveTextSymbolOnDone } =
  saveTextSymbol();

function save() {
  saveTextSymbolMutate({
    deptId: Object.keys(selectedOrganization.value)[0],
    textSymbol: templateText.value,
  });
}

saveTextSymbolOnDone(() => {
  toastSuccess({ message: t('document.textSymbol.saveOnDone') });
});

interface Item {
  id: number;
  name: string;
  code: string;
  order: string;
  separator: string;
}

const items = ref<Item[]>([
  {
    id: 1,
    name: 'Số văn bản',
    code: 'docNum',
    order: '',
    separator: '',
  },
  {
    id: 2,
    name: 'Loại văn bản',
    code: 'docType',
    order: '',
    separator: '',
  },
  {
    id: 3,
    name: 'Mã cấp trên',
    code: 'superiorCode',
    order: '',
    separator: '',
  },
  {
    id: 4,
    name: 'Mã đơn vị soạn thảo',
    code: 'deptCode',
    order: '',
    separator: '',
  },
]);

const validOrders = ['1', '2', '3', '4'];
const validSeparators = ['.', '-', '/', '_'];

const validateOrderInput = (event: Event, item: Item) => {
  const input = event.target as HTMLInputElement;
  if (!validOrders.includes(input.value)) {
    input.value = '';
    item.order = '';
  } else {
    item.order = input.value;
  }
  generateCodeString();
};

const validateSeparatorInput = (event: Event, item: Item) => {
  const input = event.target as HTMLInputElement;
  if (!validSeparators.includes(input.value)) {
    input.value = '';
    item.separator = '';
  } else {
    item.separator = input.value;
  }
  generateCodeString();
};

const combinedString = ref('');

const generateCodeString = () => {
  combinedString.value = items.value
    .filter((item) => item.order && validOrders.includes(item.order))
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((item) => `${item.name}${item.separator || ''}`)
    .join('');

  templateText.value = items.value
    .filter((item) => item.order && validOrders.includes(item.order))
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((item) => `${item.code}${item.separator || ''}`)
    .join('');
};

const parseAndAssignValues = (input: string) => {
  const parts = input.split(/([\\/\-_.])/).filter((part) => part !== '');
  let currentOrder = 1;
  const result: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      result.push(parts[i] + (parts[i + 1] || ''));
    }
  }

  result.forEach((part: any) => {
    const data = part.split(/([\\/\-_.])/).filter((p: string) => p !== '');
    const item = items.value.find((item) => item.code === data[0]);
    if (item) {
      item.order = currentOrder.toString();
      item.separator = data[1];
      currentOrder++;
    }
  });
};

const resetOrdersAndSeparators = () => {
  items.value.forEach((item) => {
    item.order = '';
    item.separator = '';
  });
};

onMounted(() => {
  fetchOrganizations(OrganizationType.ADMINISTRATIVE);
});
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
const orgTypes: MenuItem[] = [
  {
    label: t('document.book.ADMINISTRATIVE'),
    command: () => fetchOrganizations(OrganizationType.ADMINISTRATIVE),
  },
  {
    label: t('document.book.PARTY'),
    command: () => fetchOrganizations(OrganizationType.PARTY),
  },
  {
    label: t('document.book.UNION'),
    command: () => fetchOrganizations(OrganizationType.UNION),
  },
];
</script>

<style scoped></style>
