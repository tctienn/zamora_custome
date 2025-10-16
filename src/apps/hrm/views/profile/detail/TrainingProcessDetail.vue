<template>
  <div class='overflow-auto py-2 w-full'>
    <TrainingProcessTable
      is-detail
      :snapshot-id='snapshotId'/>
    <CertificateTable
      is-detail
      :snapshot-id='snapshotId'/>
    <div class='font-bold mt-3 pb-2 text-lg text-primary'>
      Danh sách {{ t(`hrm.receivingDoc.attachment`) }}
    </div>
    <DataTable
      v-model:selection='selectedRow'
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
            @click='toggleActionMenu($event, data)'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <Menu
    ref='menuRef'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script lang='ts' setup>

import Column from 'primevue/column';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findByEmployeeIdAndType } from '@/apps/hrm/api/graphql/employee';
import CertificateTable from '@/apps/hrm/views/profile/form/training-process/CertificateTable.vue';
import TrainingProcessTable from '@/apps/hrm/views/profile/form/training-process/TrainingProcessTable.vue';
import { generatePreviewFileUrl, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    default: null
  },
});

const { t } = useI18n();
const selectedRow = ref<any>();
const menuRef = ref();
const files = ref<any[]>([]);

function toggleActionMenu(event: Event, data: any) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const {
  onResult: findByEmployeeIdAndTypeResult,
  refetch: findByEmployeeIdAndTypeRefetch
} =
  findByEmployeeIdAndType(
    props.employeeId
  );

findByEmployeeIdAndTypeResult((res) => {
  files.value = res.data?.findByEmployeeIdAndType;
});

onMounted(() => {
  findByEmployeeIdAndTypeRefetch();
});

const menuActions = [
  {
    key: 'download',
    label: t('common.download'),
    icon: 'download',
    command: () => {

    },
  },
];

function viewDetail(file: { path: string; name: string; extension: string }) {
  if (!file?.path) {
    return;
  }

  const fileUrl = generatePreviewFileUrl(file.path);
  if (!fileUrl) {
    return;
  }
  const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
  const isViewable = viewableExtensions.includes(file.extension.toLowerCase());

  if (isViewable) {
    window.open(fileUrl, '_blank');
  } else {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
</script>

<style scoped>

</style>