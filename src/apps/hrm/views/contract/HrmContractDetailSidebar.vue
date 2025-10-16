<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width: 70rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          <div class='p-sidebar-header-content'>
            {{ t('hrm.contract.title') }}
          </div>
        </div>
        <Button
          class='mr-2'
          :disabled='!props.hdTemplate'
          label='Xem và in hợp đồng'
          @click='printContract(model?.id ?? "", model?.employeeId ?? "")'>
          <template #icon>
            <i class='mr-2 pi pi-print'></i>
          </template>
        </Button>
      </div>

    </template>
    <HrmContractDetail
      v-model='model'/>

    <DialogViewFileContract
      v-if='visibleViewFile'
      v-model='visibleViewFile'
      :contract-code='model?.code ?? ""'
      :contract-id='contractId'
      :file-blob='fileToView'
      :template='hdTemplate'
      :visible='visibleViewFile'
      @hide-dialog='visibleViewFile = false'/>
  </Sidebar>

</template>

<script lang='ts' setup>
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { exportFileContractPdf } from '@/apps/hrm/api/rest/employee';
import type { Contract } from '@/apps/hrm/model/contract';
import HrmContractDetail from '@/apps/hrm/views/contract/detail/HrmContractDetail.vue';
import DialogViewFileContract from '@/apps/hrm/views/contract/list/DialogViewFileContract.vue';

const props = defineProps({
  hdTemplate: {
    type: String,
    default: ''
  }
});

const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const model = defineModel({ type: Object as PropType<Contract> });
const resetData = inject('resetData', () => void {});
const visibleViewFile = ref(false);
const fileToView = ref<Blob | null>(null);
const contractId = ref();

function hideForm() {
  visible.value = false;
  resetData();
}

function openPDF(file: Blob) {
  if (!(file instanceof Blob)) {
    throw new Error('Invalid file type');
  }
  fileToView.value = file;
  visibleViewFile.value = true;
}

function printContract(id: string, fullName: string) {
  contractId.value = id;
  exportFileContractPdf(id, props.hdTemplate)
    .then(file => {
      openPDF(file!);
    });
}
</script>

<style scoped>

</style>
