<template>
  <div
    style='height: calc(100vh - 6rem)'>
    <div class='flex flex-column gap-2'>
      <Toolbar
        class='mb-2 p-0'
        style='min-height: 3rem'>
        <template #start>
          <div class='align-items-center flex font-semibold gap-2 pl-2'>
            Danh sách đào tạo
          </div>
        </template>
        <template #end>
          <div class='btn-group-toolbar flex gap-1 mr-1'>
            <SplitButton
              v-if='hasPermission("/HRM/HRM_DEVELOPMENT/HRM_TRAINING/CREATE")'
              class='btn-create focus:shadow-none font-medium'
              :label='t("common.create")'
              :model='optionCreate'
              style='border-radius: 0'>
              <template #icon>
                <i
                  class='mr-2 pi pi-plus'
                  style='margin-top: 1px'></i>
              </template>
            </SplitButton>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-filter'
              :label='t("common.filter")'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-file-import'
              :label='t("common.import")'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-file-export'
              :label='t("common.export")'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none font-normal hover:surface-200'
              icon='pi pi-cog'
              :label='t("common.setting")'
              severity='secondary'></Button>
          </div>
        </template>
      </Toolbar>
    </div>

    <div class='flex-grow-1'>
      <TabMenu :model='menus'>
        <template #item='{item}'>
          <div
            v-ripple
            class='flex gap-2 p-menuitem-link p-ripple px-3 py-2'
            @click='changeTab(item.key ?? "ALL")'>
            <a style='height: 1.5rem'>{{ item.label }}</a>
            <Badge
              :style='{background: item["color"]}'
              :value='item["count"]'></Badge>
          </div>
        </template>
      </TabMenu>
      <DataTable
        v-bind='DEFAULT_DATATABLE_CONFIG'
        group-rows-by='key'
        row-group-mode='rowspan'
        row-hover
        scroll-height='calc(100vh - 12rem)'
        scrollable
        sort-mode='single'
        :value='trainings'>
        <template #empty>
          <span class='block font-bold text-600 text-center'>{{
            t('common.emptyRecords', { itemType: 'khóa đào tạo' })
          }}</span>
        </template>
        <Column
          header='STT'
          header-class='w-1rem'>
          <template #body='{ index }'>
            <div class='flex justify-content-center'>
              {{ index + 1 }}
            </div>
          </template>
        </Column>

        <Column
          field='createdBy'
          header='Người tạo'
          header-class='w-8rem'>
          <template #body='{data: {createdBy}}'>
            <div class='flex justify-content-center'>
              <AppUser
                :user-id='createdBy'/>
            </div>
          </template>
        </Column>

        <Column
          field='proposeName'
          header='Tên đề xuất'
          header-class='w-30rem'/>

        <Column
          field='form'
          header='Hình thức'
          header-class='w-10rem'>
          <template #body='{data: {isOnline, isOffline}}'>
            <div class='flex justify-content-center'>
              {{
                [isOnline ? 'Online' : '', isOffline ? 'Offline' : '']
                  .filter(Boolean)
                  .join(', ')
              }}
            </div>
          </template>
        </Column>

        <Column
          field='takeCharge'
          header='Phụ trách'
          header-class='w-12rem'>
          <template #body='{data: {takeCharge}}'>
            <AppGroupAvatar
              v-if='takeCharge'
              avatar-size='2.5'
              :user-ids='takeCharge?.map((t: any) => t.userId)'/>
          </template>
        </Column>

        <Column
          field='follow'
          header='Theo dõi'
          header-class='w-12rem'>
          <template #body='{data: {follow}}'>
            <AppGroupAvatar
              v-if='follow'
              avatar-size='2.5'
              :user-ids='follow?.map((t: any) => t.userId)'/>
          </template>
        </Column>

        <Column
          field='fromDate'
          header='Từ ngày'
          header-class='w-10rem'>
          <template #body='{data: {fromDate}}'>
            <div class='flex justify-content-center'>
              {{ fromDate ? moment(fromDate).format('DD-MM-YYYY') : '' }}
            </div>
          </template>
        </Column>

        <Column
          field='toDate'
          header='Đến ngày'
          header-class='w-10rem'>
          <template #body='{data: {toDate}}'>
            <div class='flex justify-content-center'>
              {{ toDate ? moment(toDate).format('DD-MM-YYYY') : '' }}
            </div>
          </template>
        </Column>

        <Column
          field='numbStudent'
          header='Số học viên'
          header-class='w-8rem'>
          <template #body='{data: {numbStudent}}'>
            <div class='flex justify-content-center'>
              {{ numbStudent }}
            </div>
          </template>
        </Column>

        <Column
          field='status'
          header='Trạng thái'
          header-class='w-10rem'>
          <template #body='{data: {status}}'>
            <div class='flex justify-content-center'>
              {{ getProposeStatusLabel(status) }}
            </div>
          </template>
        </Column>

        <Column
          field='createdTime'
          header='Ngày tạo'
          header-class='w-10rem'>
          <template #body='{data: {createdTime}}'>
            <div class='flex justify-content-center'>
              {{ createdTime ? moment(createdTime).format('DD-MM-YYYY') : '' }}
            </div>
          </template>
        </Column>

        <Column header-class='w-1rem'>
          <template #body='{data}'>
            <ButtonIcon
              class='btn-create'
              icon='more_vert'
              outlined
              rounded
              text
              @click='toggleActionMenu({ event: $event, data: data })'/>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
  </Menu>

  <TrainingPropose
    v-if='visibleTrainingFor'
    :id='selectedPropose?.id'
    :visible='visibleTrainingFor'
    @hide-dialog='closeDialog'/>
</template>

<script setup lang='ts'>
import { cloneDeep } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { deletePropose, searchPropose } from '@/apps/hrm/api/graphql/propose';
import { getProposeStatusLabel, type Propose } from '@/apps/hrm/model/propose';
import TrainingPropose from '@/apps/hrm/views/training/TrainingPropose.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const { moment } = useMoment();
const { t } = useI18n();
const hasPermission = usePermissionStore().hasPermission;
const totalAll = ref(0);
const totalDraft = ref(0);
const totalPending = ref(0);
const selectedPropose = ref<Propose>({} as Propose);
const visibleTrainingFor = ref(false);
const tab = ref();
const trainings = ref<Propose[]>([] as Propose[]);

const {
  load,
  onResult,
  refetch
} = searchPropose();
onResult((res) => {
  trainings.value = res.data.searchPropose;
});

load(undefined, {
  keyword: null,
  proposeType: 'ALL'
});

const optionCreate = [
  {
    label: 'Đề xuất đào tạo',
    command: () => {
      visibleTrainingFor.value = true;
    }
  },
  {
    label: 'Đề xuất chia sẻ',
    command: () => {
    }
  }
];
const tabMenu = computed(() => [
  {
    label: 'Tất cả',
    key: 'ALL',
    count: totalAll.value,
    color: '#0D99FF',
    command: () => null
  },
  {
    label: 'Đề xuất đào tạo',
    key: 'PROPOSE_TRAINING',
    count: totalDraft.value,
    color: '#888888',
    command: () => null
  },
  {
    label: 'Đề xuất chia sẻ',
    key: 'PROPOSE_SHARE',
    count: totalPending.value,
    color: '#F0BC8B',
    command: () => null
  }
]);

function changeTab(tb: string) {
  tab.value = tb;
}

function closeDialog() {
  visibleTrainingFor.value = false;
  refetch();
  selectedPropose.value = {} as Propose;
}

const confirm = useConfirm();
const menuAction = ref();

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: Propose;
}) {
  menuAction.value.toggle(event);
  selectedPropose.value = cloneDeep(data);
  // decision.value = cloneDeep(data);
  // selectedDecision.value = decision.value;
}

const menuActions = [
  // {
  //   label: t('common.detail'),
  //   icon: 'info',
  //   command: () => {
  //   },
  // },
  {
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    visible: hasPermission('/HRM/HRM_DEVELOPMENT/HRM_TRAINING/UPDATE'),
    command: () => {
      visibleTrainingFor.value = true;
    }
  },
  {
    label: t('common.delete'),
    icon: 'pi pi-trash',
    visible: hasPermission('/HRM/HRM_DEVELOPMENT/HRM_TRAINING/DELETE'),
    command: () => {
      confirm.require({
        message: `Bạn có chắc chắn muốn xóa đề xuất ${selectedPropose.value.proposeName} này không?`,
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        accept: () => {
          deletePropose().mutate({ id: selectedPropose.value.id }).then(() => {
            toastSuccess({ message: 'Bạn đã xóa đề xuất thành công.' });
            refetch();
          });
        }
      });
    },
  },
];

const menus = computed(() => tabMenu.value);
</script>

<style scoped>
:deep(.p-splitbutton-menubutton) {
  border-radius: 0
}
</style>
