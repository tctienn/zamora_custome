<template>
  <Sidebar
    v-model:visible='visibleForm'
    v-bind='DEFAULT_SIDEBAR_CONFIG'
    :show-close-icon='false'
    style='width: 50vw'
    @hide="emits('hide-dialog')">

    <template #header>
      <div
        class='left-0 surface-0 w-full'
        style='z-index: 1000'>
        <div class='flex justify-content-between'>
          <div class='flex gap-1'>
            <ButtonIcon
              class='border-round-sm'
              icon='arrow_back'
              severity='danger'
              size='small'
              @click="emits('hide-dialog')"/>
            <div class='align-content-center font-semibold text-2xl'>
              Chi tiết phụ lục
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class='grid grid-nogutter p-2'>
      <div class='col-12 field'>
        <label>{{
          t(`hrm.contract.contractForContractAppendix`)
        }}</label>
        <span class='font-bold ml-2'> {{
          selectedContract?.code || contractsData?.find((item: Contract) => item.id === contractAppendix?.contractId)?.code
        }}</span>
      </div>

      <div class='col-6 field'>
        <label>{{
          t(`hrm.contract.numContractAppendix`)
        }}:</label>
        <span class='font-bold ml-2'> {{
          contractAppendix?.numContractAppendix
        }}</span>
      </div>

      <div class='col-6 field'>
        <label>{{
          t(`hrm.contract.signDate`)
        }}:</label>
        <span class='font-bold ml-2'> {{
          contractAppendix?.signDate ? moment(contractAppendix?.signDate).format('DD/MM/YYYY') : ''
        }}</span>
      </div>

      <div class='col-6 field'>
        <label>{{
          t(`hrm.contract.effectiveDate`)
        }}:</label>
        <span class='font-bold ml-2'> {{
          contractAppendix?.effectiveDate ? moment(contractAppendix?.effectiveDate).format('DD/MM/YYYY') : ''
        }}</span>
      </div>

      <div class='col-6 field'>
        <label>{{
          t(`hrm.contract.signatory`)
        }}:</label>
        <span class='font-bold ml-2'> {{
          contractAppendix?.signatory
        }}</span>
      </div>

      <div class='col-12 field'>
        <label>{{
          t(`hrm.contract.content`)
        }}:</label>
        <span class='font-bold ml-2'> {{
          contractAppendix.content
        }}</span>
      </div>

      <div class='col-12 field'>
        <div class='align-items-center flex justify-content-between'>
          <label>{{
            t(`hrm.contract.attachment`)
          }}</label>

        </div>
      </div>

      <div class='col-12 field'>
        <label>{{
          t(`hrm.salary.status`)
        }}:</label>
        <span class='font-bold ml-2'> {{
          contractAppendix.status ? t(`hrm.contract.stillEffect`) : t(`hrm.contract.expire`)
        }}</span>
      </div>

      <div class='col-12 field'>
        <label>{{
          t(`hrm.contract.attachment`)
        }}</label>
        <DataTable
          class='p-datatable-sm'
          responsive-layout='scroll'
          scroll-height='250px'
          scrollable
          show-gridlines
          striped-rows
          :value='contractAppendix.attachments'>
          <template #empty>
            <p class='text-center'>{{ t('common.noData') }}</p>
          </template>
          <Column
            class='text-center'
            :header='t("common.ordinalNumber")'
            style='width: 5%'>
            <template #body='{index}'>
              {{ index + 1 }}
            </template>
          </Column>
          <Column
            class='w-25rem'
            header='Tên giấy tờ'>
            <template #body='{ data }'>
              <p class='w-full'>{{ data.id ? data.fileName : data.name }}</p>
            </template>
          </Column>
          <Column
            class='w-18rem'
            :header='t(`book-ticket.bookFlight.attachment.table.fileName`)'>
            <template #body='{ data }'>
              <div
                class='align-items-center cursor-pointer flex gap-2 justify-content-start'
                @click='viewFile(data?.path)'>
                <img
                  v-if='data.name && data.id'
                  alt=''
                  class='file-extension-icon h-2rem w-2rem'
                  draggable='false'
                  :src='getFileIcon(data.name.split(".").pop())'
                  @error='handleFileImageError'/>
                <img
                  v-else-if='!data.id'
                  alt=''
                  class='file-extension-icon h-2rem w-2rem'
                  draggable='false'
                  :src='getFileIcon(data.file?.name.split(".").pop())'
                  @error='handleFileImageError'/>
                <p class='mb-0 ml-2 text-center text-green-600'>{{ data.id ? data.name : data.file?.name }}</p>
              </div>
            </template>
          </Column>
          <Column
            body-class='justify-content-center text-center'
            :header='t(`book-ticket.bookFlight.attachment.table.fileSize`)'
            style='width: 8rem'>
            <template #body='{ data }'>
              <p v-if='data.size'>
                {{ data.size ? convertFileSize(data.size) : '0Kb' }}
              </p>
              <p v-else-if='data.file?.size'>
                {{ data.file.size ? convertFileSize(data.file.size) : '0Kb' }}
              </p>
            </template>
          </Column>
        </DataTable>
      </div>

    </div>
  </Sidebar>

  <Menu
    ref='actionMenusRef'
    :contract-appendix='actionMenus'
    popup></Menu>
</template>

<script setup lang='ts'>

import { cloneDeep } from 'lodash';
import Column from 'primevue/column';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findContractAppendix } from '@/apps/hrm/api/rest/contract';
import type { Contract } from '@/apps/hrm/model/contract';
import { GATEWAY_URL } from '@/common/api/configService';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { DEFAULT_SIDEBAR_CONFIG } from '@/common/constants';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: undefined,
  },
  selectedContract: {
    type: Object as PropType<any>,
    default: undefined
  },
  contractsData: {
    type: Array as PropType<Contract[]>,
    default: () => []
  },
});
const emits = defineEmits(['hide-dialog']);
const visibleForm = ref(props.visibleDialog);
const { t } = useI18n();
const formRef = ref<HTMLFormElement>();
const contractAppendix = ref<any>({} as any);
const actionMenus = ref<MenuItem[]>([]);
const actionMenusRef = ref<InstanceType<typeof Menu>>();
const { moment } = useMoment();

if (!props.id) {
  contractAppendix.value.status = true;
  contractAppendix.value.signDate = new Date();
  contractAppendix.value.effectiveDate = new Date();
} else {
  findContractAppendix(props.id).then((res: any) => {
    contractAppendix.value = cloneDeep(res);
    contractAppendix.value.signDate = new Date(res.signDate);
    contractAppendix.value.effectiveDate = new Date(res.effectiveDate);
    contractAppendix.value.attachments = res.files;
  });
}

function viewFile(path: string) {
  window.open(
    GATEWAY_URL
    + '/files/preview/'
    + path,
  );
}
</script>

<style scoped>

</style>