<template>
  <div class='contract-comp pr-2 w-full'>
    <div class='flex flex-column gap-2 mb-2 pb-2 pt-0 w-full'>
      <div
        class='align-items-center border-1 border-300 border-round-sm flex justify-content-between mb-2 py-3 surface-0'
        style='height: 40px'>
        <div
          class='font-bold pl-3 text-lg text-primary'>Danh sách hợp đồng lao động
        </div>
      </div>

      <DataTable
        v-model:expandedRows='expandedRows'
        v-model:selection='selectedRow'
        data-key='id'
        :pt='{
          rowexpansioncell: {
            class: "p-0"
          }
        }'
        :row-class='getRowClass'
        row-hover
        selection-mode='single'
        show-gridlines
        :value='contracts'>
        <Column
          class='text-center'
          header='TT'
          style='width: 5%'>
          <template #body='slotProps'>
            <div
              class='align-items-center flex items-center justify-content-center'>
              {{ slotProps.index + 1 }}
            </div>
          </template>
        </Column>

        <Column
          field='code'
          header='Số hợp đồng'></Column>
        <Column
          field='type'
          header='Loại hợp đồng'></Column>
        <Column
          class='text-center'
          field='signedDate'
          header='Ngày ký'>
          <template #body='{ data: { signedDate } }'>
            {{ signedDate && moment(signedDate).format('DD/MM/YYYY') }}
          </template>
        </Column>
        <Column
          class='text-center'
          field='effectiveDate'
          header='Ngày hiệu lực'>
          <template #body='{ data: { effectiveDate } }'>
            {{ effectiveDate && moment(effectiveDate).format('DD/MM/YYYY') }}
          </template>
        </Column>
        <Column
          class='text-center'
          field='expiryDate'
          header='Ngày hết hiệu lực'>
          <template #body='{ data: { expiryDate } }'>
            {{ expiryDate && moment(expiryDate).format('DD/MM/YYYY') }}
          </template>
        </Column>
        <Column
          class='text-center'
          field='workType'
          header='Hình thức làm việc'></Column>
        <Column
          class='text-center'
          field='signatory'
          header='Người ký'></Column>
        <Column
          class='text-center'
          field='status'
          header='Trạng thái'>
          <template #body='{ data: { status } }'>
            {{ t(`hrm.contract.statusOptions.${camelcase(status)}`) }}
          </template>
        </Column>
        <template #expansion='{data}'>
          <DataTable
            :pt='{
              thead: {
                class: "hidden"
              },
            }'
            row-hover
            :show-gridlines='false'
            :value='contractAppendixes.filter((item: any) => item.contractId === data.id)'>
            <Column
              style='max-width: 3rem'>
            </Column>
            <Column
              class='text-center'
              header='TT'
              style='max-width: 3rem'>
              <template #body='{index}'>
                {{ index + 1 }}
              </template>
            </Column>
            <Column
              field='numContractAppendix'
              :header='t(`hrm.contract.numContractAppendix`)'></Column>
            <Column
              field='content'
              :header='t(`hrm.contract.content`)'></Column>
            <Column
              field='signDate'
              :header='t(`hrm.contract.signDate`)'>
              <template #body='{data}'>
                {{ data['signDate'] ? moment(data['signDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
              </template>
            </Column>
            <Column
              field='effectiveDate'
              :header='t(`hrm.contract.effectiveDate`)'>
              <template #body='{data}'>
                {{ data['effectiveDate'] ? moment(data['effectiveDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
              </template>
            </Column>
            <Column
              field='signatory'
              :header='t(`hrm.contract.signatory`)'></Column>
            <Column
              body-class='text-center'
              :header='t("hrm.contract.general.status")'>
              <template #body='{data}'>
                {{ data.status ? t(`hrm.contract.stillEffect`) : t(`hrm.contract.expire`) }}
              </template>
            </Column>
          </DataTable>
        </template>
      </DataTable>
    </div>
    <div class='flex flex-column gap-2 py-2 w-full'>
      <div
        class='align-items-center border-1 border-300 border-round-sm flex justify-content-between mb-2 py-3 surface-0'
        style='height: 40px'>
        <div
          class='font-bold pl-3 text-lg text-primary'> Danh sách {{ t(`hrm.receivingDoc.attachment`) }}
        </div>
      </div>

      <DataTable
        v-model:selection='selectedRowAttach'
        class='overflow-auto'
        row-hover
        show-gridlines
        striped-rows
        style='width: 60rem'
        :value='files'>
        <Column
          class='text-center'
          header='TT'
          style='width: 5%'>
          <template #body='slotProps'>
            <div
              class='align-items-center flex items-center justify-content-center'>
              {{ slotProps.index + 1 }}
            </div>
          </template>
        </Column>
        <Column
          field='files'
          :header='t(`hrm.receivingDoc.attachment`)'
          style='min-width: 10vw'>
          <template #body='{ data }'>
            <div
              v-if='files.length'
              class='align-items-center cursor-pointer flex gap-2'
              @click='viewDetail(data)'>
              <img
                alt=''
                class='file-extension-icon h-2rem w-2rem'
                draggable='false'
                :src='getFileIcon(data.name.split(".")[data.name.split(".").length - 1])'
                @error='handleFileImageError'/>
              <div class='align-content-center word-break-break-word'>
                {{ data.name }}
              </div>
            </div>
          </template>
        </Column>
        <Column
          class='text-center'
          field='files'
          :header='t(`hrm.receivingDoc.size`)'
          style='min-width: 7vw'>
          <template #body='{ data }'>
            <div
              v-if='files.length'>
              {{ data.size }}KB
            </div>
          </template>
        </Column>
        <Column
          class='text-center'
          :header="t('common.action')"
          style='min-width: 7vw'>
          <template #body='{ data }'>
            <ButtonIcon
              v-tooltip.top="t('common.action')"
              class='text-color'
              icon='more_vert'
              icon-size='1.4'
              rounded
              text
              @click='toggleActionMenuAttach($event, data)'/>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Menu
    ref='menuAttachRef'
    :model='menuActions'
    :popup='true'>
  </Menu>

  <DialogPreviewFile
    v-if='visiblePreviewFile'
    :name='selectedRowAttach.name'
    :url='selectedRowAttach.path'
    :visible='visiblePreviewFile'
    @hide-dialog='visiblePreviewFile = false'/>
</template>

<script lang='ts' setup>

import camelcase from 'camelcase';
import Column from 'primevue/column';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findContractByEmployeeId, getAllContractAppendixInContracts } from '@/apps/hrm/api/graphql/contract';
import { findByEmployeeIdAndType } from '@/apps/hrm/api/graphql/employee';
import { AttachmentType, type EmployeeAttachment } from '@/apps/hrm/model/attachment';
import DialogPreviewFile from '@/apps/work/views/component/DialogPreviewFile.vue';
import { DateTimeFormat } from '@/common/constants';
import { generateDownloadUrl, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
});
const { moment } = useMoment();
const { t } = useI18n();
const selectedRow = ref();
const selectedRowAttach = ref();
const menuAttachRef = ref();
const contracts = ref();
const files = ref<any[]>([]);
const visiblePreviewFile = ref(false);
const expandedRows = ref<Record<string, boolean>>({});
const contractAppendixes = ref<any>([]);

function toggleActionMenuAttach(event: Event, data: EmployeeAttachment) {
  menuAttachRef.value.toggle(event);
  selectedRowAttach.value = data;
}

const { onResult: findByEmployeeIdAndTypeResult, } =
  findByEmployeeIdAndType(
    props.employeeId,
    [AttachmentType.CONTRACT]
  );

findByEmployeeIdAndTypeResult((res) => {
  const filesRaw = res?.data?.findByEmployeeIdAndType ?? [];
  files.value = filesRaw.filter((item: any) => item.type === 'CONTRACT');
});
const { onResult: findContractByEmployeeIdResult, } = findContractByEmployeeId(props.employeeId);

findContractByEmployeeIdResult((res) => {
  contracts.value = res.data.findContractByEmployeeId;

  const ids = contracts.value?.map((item: any) => item.id);

  getAllContractAppendixInContracts(ids).onResult((res) => {
    contractAppendixes.value = res.data.getAllContractAppendixInContracts;
    const contractIds = [...new Set(contractAppendixes.value?.map((item: any) => item.contractId))];
    contractIds?.forEach((item: any) => {
      expandedRows.value[item] = true;
    });
  });
});

function viewDetail(file: EmployeeAttachment) {
  visiblePreviewFile.value = true;
  selectedRowAttach.value = file;
}

const getRowClass = (data: any) => {
  return { 'invalid-contract-row': data.status !== 'VALID' };
};

const menuActions = [
  {
    key: 'view',
    label: t('hrm.profile.fileFolder.fileActionOpen'),
    icon: 'pi pi-eye',
    command: () => {
      viewDetail(selectedRowAttach.value);
    },
  },
  {
    key: 'download',
    icon: 'pi pi-download',
    label: t('hrm.profile.fileFolder.fileActionDownload'),
    command: () => {
      console.log('download', selectedRowAttach.value);
      generateDownloadUrl(selectedRowAttach.value.path);
    },
  },

];
</script>

<style scoped>
:deep(.invalid-contract-row) {
  background-color: var(--bg-white-custom2) !important;
}
</style>