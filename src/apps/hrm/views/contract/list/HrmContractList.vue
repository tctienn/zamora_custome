<template>
  <div
    class='border-round h-full overflow-x-auto w-full'
    style='background-color: var(--surface-e)'>
    <TabMenu
      class='tab-menu-pagination'
      :model='menus'>
      <template #item='{item}'>
        <div
          v-ripple
          class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'>
          <a style='height: 1.5rem'>{{ item.label }}</a>
          <Badge
            v-if='item["count"]'
            :class="{
              'text-white': item['severity'] === 'secondary',
            }"
            :severity="item['severity']"
            :value='item["count"]'></Badge>
        </div>
      </template>
    </TabMenu>

    <div class='full-height-table-wrapper'>
      <HrmContractListTable
        v-if="groupField === 'all'"
        ref='childRef'
        :contracts-data='contracts'
        :employee-selected='employeeSelected'
        :loading='loading'
        :pageable='pageable'
        :size='size'
        @menu:show-action='showActionMenus'
        @menu:show-action-contract-appendix='showActionContractAppendix'
        @show:detail='showDetailContractAppendix'
        @show:sidebar="(data: any) => emits('show:detail', data)"/>
      <HrmContractListTableGroup
        v-else
        :contracts-data='contracts'
        :employee-selected='employeeSelected'
        :group-field='groupField'
        :loading='loading'
        :pageable='pageable'
        :size='size'
        @menu:show-action='showActionMenus'
        @show:sidebar="(data: any) => emits('show:detail', data)"/>
    </div>

    <HrmChangeStatusContract
      v-model:visible='setStatusVisible'
      :contract-id='currentContract.id'
      :status='currentContract.status'/>

    <DialogViewFileContract
      v-if='visibleViewFile'
      v-model='visibleViewFile'
      :contract-code='selectedContract.code'
      :contract-id='contractId'
      :file-blob='fileToView'
      :template='hdTemplate'
      :visible='visibleViewFile'
      @hide-dialog='visibleViewFile = false'/>
  </div>

  <Menu
    ref='actionMenusRef'
    :model='actionMenus'
    popup></Menu>
  <Menu
    ref='actionMenusContractAppendixRef'
    :model='actionMenusContractAppendix'
    popup></Menu>

  <HrmContractAppendixForm
    v-if='contractAppendixFormVisible'
    :id='contractAppendixId'
    :contracts-data='contracts'
    :selected-contract='selectedContract'
    :visible-dialog='contractAppendixFormVisible'
    @hide-dialog='hideDialog'/>

  <HrmContractAppendixDetail
    v-if='contractAppendixDetailVisible'
    :id='contractAppendixId'
    :contracts-data='contracts'
    :selected-contract='selectedContract'
    :visible-dialog='contractAppendixDetailVisible'
    @hide-dialog='hideDialog'/>
</template>

<script lang='ts' setup>
import camelcase from 'camelcase';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import type { PageState } from 'primevue/paginator';
import { useConfirm } from 'primevue/useconfirm';
import { inject, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import {
  countStatusContracts,
  deleteContractAppendix,
  findContractById,
  searchContracts
} from '@/apps/hrm/api/graphql/contract';
import { exportFileContractPdf } from '@/apps/hrm/api/rest/employee';
import { type Contract, type ContractFilter, ContractStatus } from '@/apps/hrm/model/contract';
import type { StatusCount } from '@/apps/hrm/model/count';
import HrmChangeStatusContract from '@/apps/hrm/views/contract/dialog/HrmChangeStatusContract.vue';
import HrmContractAppendixDetail from '@/apps/hrm/views/contract/form/HrmContractAppendixDetail.vue';
import HrmContractAppendixForm from '@/apps/hrm/views/contract/form/HrmContractAppendixForm.vue';
import DialogViewFileContract from '@/apps/hrm/views/contract/list/DialogViewFileContract.vue';
import HrmContractListTable from '@/apps/hrm/views/contract/list/HrmContractListTable.vue';
import HrmContractListTableGroup from '@/apps/hrm/views/contract/list/HrmContractListTableGroup.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { assignIfExists } from '@/common/helpers/utils';
import type { Connection } from '@/common/model/page';
import type { Pageable } from '@/common/model/query';
import { useGlobalSearchStore } from '@/common/store/search';

const props = defineProps({
  groupField: {
    type: String,
    default: 'all',
  }
});

const emits = defineEmits(['show:detail']);
const { t } = useI18n();
const { moment } = useMoment();
const visibleViewFile = ref(false);
const contractAppendixFormVisible = ref();
const contractAppendixDetailVisible = ref();
const filter = reactive<ContractFilter>({});
const fileToView = ref<Blob | null>(null);
const size = 50;
const hasPermission = usePermissionStore().hasPermission;
const selectedContract = ref();
const contractAppendixId = ref();
const pageable = reactive<Pageable>({
  page: 0,
  size
});
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());
const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const paginator = inject('pageable') as any;
let total = inject('total') as any;
const {
  result,
  loading,
  load: loadSearch,
  refetch
} = searchContracts(filter, pageable);
const contracts = ref<Contract[]>([]);
const actionMenus = ref<MenuItem[]>();
const actionMenusContractAppendix = ref<MenuItem[]>();
const childRef = ref();
const actionMenusRef = ref<InstanceType<typeof Menu>>();
const actionMenusContractAppendixRef = ref<InstanceType<typeof Menu>>();
const organizationId = inject('organizationId', ref<string>());
const initialOrganizationId = inject('initialOrganizationId', ref<string>());
const currentContract = reactive<Contract>({} as Contract);
const employeeSelected = ref<string>('');
watch(result, () => {
  total.value = (result.value?.searchContracts as Connection<Contract>)?.totalCount || 0;
});

watchEffect(() => {
  pageable.page = paginator.page;
});

watch(
  [() => loading.value, () => result.value, () => props.groupField],
  ([loadingVal, resultVal, groupField]) => {
    if (loadingVal) {
      contracts.value = [];
      return;
    }

    const items = (resultVal?.searchContracts as Connection<Contract>)?.edges?.map(e => {
      const node = e.node;
      const date = node.effectiveDate;
      const month = date ? moment(date).format('YYYY-MM') : 'Không xác định';
      return {
        ...node,
        effectiveMonth: month
      };
    }) || [];

    if (groupField) {
      contracts.value = [...items].sort((a: Contract, b: Contract) => {
        const valA = a[groupField as keyof Contract];
        const valB = b[groupField as keyof Contract];
        return (valA?.toString() ?? '').localeCompare(valB?.toString() ?? '');
      });
    } else {
      contracts.value = items;
    }
  },
  { immediate: true }
);

const setStatusVisible = ref(false);
const {
  onResult: onCountStatusResult,
  refetch: countStatusRefetch
} = countStatusContracts(organizationId.value);

const extractNameFromSearchData = (list: string[]): string[] => {
  return list.map(s => s.split('-').slice(1).join('-'));
};

watch(organizationId, (value) => {
  filter.organization = value;
  if (value) {
    loadSearch();
  }
  pageable.page = 0;
  countStatusRefetch({ organization: value });
});

watch(submit, () => {
  if (model.value.organization) {
    const orgKey = Object.keys(model.value.organization)[0];
    assignIfExists(filter, 'organization', orgKey);
    organizationId.value = orgKey;
  } else {
    organizationId.value = initialOrganizationId.value;
    filter.organization = organizationId.value;
  }

  assignIfExists(filter, 'signatory', model.value.signatory, extractNameFromSearchData);
  assignIfExists(filter, 'type', model.value.type, extractNameFromSearchData);
  assignIfExists(filter, 'jobTitle', model.value.jobTitle, extractNameFromSearchData);
  assignIfExists(filter, 'workType', model.value.workType, extractNameFromSearchData);
  assignIfExists(filter, 'position', model.value.position, extractNameFromSearchData);

  assignIfExists(filter, 'signedDateFrom', model.value.signedDateFrom);
  assignIfExists(filter, 'signedDateTo', model.value.signedDateTo);
  assignIfExists(filter, 'expiryDateFrom', model.value.expiryDateFrom);
  assignIfExists(filter, 'expiryDateTo', model.value.expiryDateTo);
  assignIfExists(filter, 'haveInsurance', model.value.haveInsurance);

  pageable.page = 0;
  loadSearch();
  countStatusRefetch({ organization: filter.organization });
});

onCountStatusResult((res) => {
  const counts = res.data.countStatusContracts as StatusCount[] || [];
  menus.forEach(m => {
    const c = counts.find(c => c.status === m['code']);
    m['count'] = c?.count || 0;
  });

  const allMenuItem = menus.find(m => m['code'] === 'all');
  if (allMenuItem) {
    allMenuItem['count'] = counts.reduce((acc, c) => acc + c.count, 0);
  }
});

const menus = reactive<MenuItem[]>(createMenus());

function createMenus(): MenuItem[] {
  const severities = ['secondary', 'success', 'danger', 'contrast'];
  const map = Object.keys(ContractStatus).map((s, index) => ({
    label: t(`hrm.contract.statusOptions.${camelcase(s)}`),
    code: s,
    command: () => {
      filter.status = ContractStatus[s as keyof typeof ContractStatus];
    },
    severity: severities[index % severities.length],
  }));
  return [
    {
      label: t('hrm.contract.statusOptions.all'),
      code: 'all',
      command: () => {
        filter.status = undefined;
      }
    },
    ...map];
}

const hdTemplate = ref();
const contractId = ref();

function printContract(id: string, template: string, fullName: string) {
  hdTemplate.value = template;
  contractId.value = id;
  exportFileContractPdf(id, template)
    .then(file => {
      openPDF(file!);
    });
}

function openPDF(file: Blob) {
  if (!(file instanceof Blob)) {
    throw new Error('Invalid file type');
  }
  fileToView.value = file;
  visibleViewFile.value = true;
}

const confirm = useConfirm();
const {
  mutate,
  onDone
} = deleteContractAppendix();

function showDetailContractAppendix(event: Event, data: any) {
  if (data.id) {
    contractAppendixId.value = data.id;
    contractAppendixDetailVisible.value = true;
  }
}

function showActionContractAppendix(event: Event, data: any) {
  actionMenusContractAppendix.value = [
    {
      label: t('common.detail'),
      icon: 'pi pi-info-circle',
      command: () => {
        if (data.id) {
          contractAppendixId.value = data.id;
          contractAppendixDetailVisible.value = true;
        }
      }
    },
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => {
        if (data.id) {
          contractAppendixId.value = data.id;
          contractAppendixFormVisible.value = true;
        }
      }
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        if (data.id) {
          deleteRow(data);
        }
      }
    }
  ];
  actionMenusContractAppendixRef.value?.toggle(event);
}

const deleteRow = (data: any) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: data.content }),
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
  toastSuccess({ message: t('common.deleteSuccess') });
  childRef.value?.refetchContractAppendix();
});

const hideDialog = () => {
  contractAppendixDetailVisible.value = false;
  contractAppendixFormVisible.value = false;
  contractAppendixId.value = undefined;
  childRef.value?.refetchContractAppendix();
  refetch();
};

function showActionMenus(event: Event, data: Contract) {
  const status = data.status;
  actionMenus.value = [
    {
      label: t('hrm.contract.actionOptions.addContractAppendix'),
      icon: 'pi pi-plus',
      command: () => {
        selectedContract.value = data;
        contractAppendixFormVisible.value = true;
      }
    },
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      visible: status === 'NOT_YET_VALID' && hasPermission('/HRM/HRM_CONTRACT_DECISION/HRM_CONTRACT/UPDATE'),
      command: () => {
        if (data.id) {
          employeeSelected.value = data.id;
          edit(data.id);
        }
      }
    },
    {
      label: t('hrm.contract.actionOptions.viewOrPrint'),
      icon: 'pi pi-print',
      command: () => {
        if (!data.hdTemplate) {
          toastError({ message: 'Loại hợp đồng này chưa có template phù hợp.' });
        } else {
          selectedContract.value = data;
          printContract(data.id ?? '', data.hdTemplate ?? '', data.code);
        }
      }
    },
    {
      label: t('hrm.contract.actionOptions.setStatus'),
      icon: 'pi pi-tag',
      command: () => openSetStatusDialog(data)
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      visible: status === 'NOT_YET_VALID' && hasPermission('/HRM/HRM_CONTRACT_DECISION/HRM_CONTRACT/DELETE'),
      command: () => {
      }
    }
  ];
  actionMenusRef.value?.toggle(event);
}

const contractEdit = inject('contractEdit', ref<Contract>());
const formVisible = inject('contractFormVisible', ref(false));
const needRefresh = inject('needRefresh', ref(false));
const searchTerm = inject('searchTerm', ref(''));

watch(() => searchTerm.value,
  (value) => {
    filter.keyword = value.trim().toLowerCase();
    if (value) {
      loadSearch();
    }
  });

function edit(id: string) {
  findContractById(id)
    .onResult(res => {
      contractEdit.value = res.data.findContractById;
    });
  formVisible.value = true;

}

function openSetStatusDialog(data: Contract) {
  Object.assign(currentContract, data);
  setStatusVisible.value = true;
}

function onPage(event: PageState) {
  pageable.page = event.page;
}

watch(needRefresh, () => {
  refetch();
  countStatusRefetch();
});

onUnmounted(() => {
  employeeSelected.value = '';
});
</script>

<style>

</style>
