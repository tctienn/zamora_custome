<template>
  <div class='flex flex-column gap-2 mb-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <div class='font-bold'>
            {{ t('hrm.planning.title') }}
          </div>
        </div>
      </template>
      <template #end>
        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            v-if='hasPermission("/HRM/HRM_ORGANIZATION/HRM_ORG_PLANNING/CREATE")'
            class='btn-create focus:shadow-none font-medium p-2'
            icon='pi pi-plus'
            :label='t("common.create")'
            @click='createPlanning'>
          </Button>

          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-export'
            label='Export'
            severity='secondary'></Button>

        </div>
      </template>
    </Toolbar>
  </div>
  <div class='full-height-table-wrapper surface-0'>
    <DataTable
      v-model:selection='selectedPlan'
      class='full-height-table p-datatable-sm'
      :pt='{
        wrapper: {
          class: "h-full"
        }
      }'
      scroll-height='calc(100vh - 10rem)'
      scrollable
      selection-mode='single'
      table-style='min-width: 100%'
      :value='plans'>
      <template #empty>
        <ProgressBar
          v-if='loading'
          class='border-noround'
          mode='indeterminate'
          style='height: .25rem'></ProgressBar>
        <EmptyResult v-else/>
      </template>
      <Column
        body-style='width: 50px'
        header='STT'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        field='planingName'
        header='Tên quy hoạch'/>
      <Column
        class='text-center'
        field='classification'
        header='Phân loại'>
        <template #body='{data}'>
          <p>{{ getPlanType(data.classification) }}</p>
        </template>
      </Column>
      <Column
        class='text-center'
        field='term'
        header='Nhiệm kỳ'/>
      <Column
        class='text-center'
        field='code'
        header='Mẫu số'/>
      <Column
        class='text-center'
        field='totalEmployees'
        header='Tổng số'/>
      <Column
        class='text-center'
        field='planingDate'
        header='Ngày lập'>
        <template #body='{ data }'>
          <p>{{ formatDateTime(data.planingDate, 'DD/MM/YYYY') }}</p>
        </template>
      </Column>

      <Column
        body-class='justify-content-center'
        header='Người lập'>
        <template #body='{ data }'>
          <div class='flex gap-2 justify-content-center'>
            <AppAvatar
              :avatar='generateAvatarUrl(getUserAvt(data.creator)?.avatar || "")'
              :label='data.creator'
              size='2.5'
              @mouseenter='(e: MouseEvent) => {
                const user = getUserAvt(data.creator);
                if (user) showUserOverlay(e, user);
              }'/>
          </div>
        </template>
      </Column>

      <Column
        class='text-center'
        header='Trạng thái'>
        <template #body='{ data }'>
          <Tag
            class='border-round-sm text-sm'
            :severity='getPlanStatus(data.status)?.severity'
            style='min-width: 100px'
            :value='getPlanStatus(data.status)?.text'></Tag>

        </template>
      </Column>

      <Column body-style='width: 40px; text-align: center;'>
        <template #body='{data}'>
          <Button
            class='p-button-plain p-button-text'
            icon='pi pi-ellipsis-v'
            @click='showActionMenus($event, data)'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <CreatePlanningForm
    :is-new='isCreate'
    :loading='loading'
    :model-value='selectedData'
    :visible='visibleDialog'
    @fetch-data='refetch'
    @hide-dialog='handleCloseForm'/>
  <DetailPlan
    v-if='selectedData && Object.keys(selectedData).length > 0'
    :data-planing='selectedData'
    :loading='loading'
    :visible='visibleDialogDetail'
    @hide-dialog='handleCloseForm'/>
  <Menu
    ref='actionMenusRef'
    :model='actionMenus'
    popup></Menu>
  <UpdatePlanStatus
    v-model:visible='showUpdateStatus'
    :planing-id='selectedData.id'
    :status='selectedData.status'
    @fetch-data='refetch'/>

  <UserOverlay
    ref='userOverlayRef'
    :user='userOverlay.user'/>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import { useConfirm } from 'primevue/useconfirm';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { deleteById } from '@/apps/hrm/api/graphql/decision';
import { deletePlaningById, getDataPlaningById, getListPlaning } from '@/apps/hrm/api/graphql/planing';
import CreatePlanningForm from '@/apps/hrm/views/planning/CreatePlanning.vue';
import DetailPlan from '@/apps/hrm/views/planning/DetailPlan.vue';
import UpdatePlanStatus from '@/apps/hrm/views/planning/modal/UpdatePlanStatus.vue';
import type {
  Planing,
  PlanningInterface
} from '@/apps/hrm/views/planning/model';
import UserOverlay from '@/common/components/custom/UserOverlay.vue';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { formatDateTime } from '@/common/helpers/time-util';
import { formatDate } from '@/common/helpers/utils';

const { t } = useI18n();
const hasPermission = usePermissionStore().hasPermission;
const { allUsers } = storeToRefs(useUserMoreInfoStore());
const actionMenusRef = ref<InstanceType<typeof Menu>>();
const actionMenus = ref<any[]>([]);
const visibleDialog = ref(false);
const visibleDialogDetail = ref(false);
const selectedData = ref<PlanningInterface>({} as PlanningInterface);
const isCreate = ref(true);
const {
  result,
  loading,
  error,
  refetch
} = getListPlaning();
const plans = ref<Planing[]>([]);
const { mutate: delPlaningMutate } = deletePlaningById();
const showUpdateStatus = ref(false);
const userOverlayRef = ref();
const userOverlay = ref<{
  visible: boolean;
  user?: UserMoreInfo;
  event?: Event;
}>({ visible: false });
const confirm = useConfirm();
const selectedPlan = ref();

watchEffect(() => {
  if (result.value?.listPlaning) {
    plans.value = result.value.listPlaning;
  }
});

const getUserAvt = (id: string): UserMoreInfo | undefined => {
  return allUsers.value.find((user) => user.id === id);
};

const createPlanning = () => {
  visibleDialog.value = true;
  selectedData.value = {} as PlanningInterface;
  selectedData.value.planingDate = new Date();
};

const getPlanStatus = (value: string) => {
  switch (value) {
  case 'DRAFT':
    return {
      text: 'Chờ duyệt',
      severity: 'warning'
    };
  case 'APPROVED':
    return {
      text: 'Đã duyệt',
      severity: 'success'
    };
  default:
    return {
      text: 'Chờ duyệt',
      severity: 'warning'
    };
  }
};

const getPlanType = (value: string) => {
  switch (value) {
  case 'PARTY_COMMITTEE':
    return 'Cấp ủy';
  case 'TITLE':
    return 'Chức danh';
  default:
    return 'Tín nhiệm';
  }
};

const handleDelete = async (id?: string) => {
  if (!id) {
    return;
  }

  try {
    const res = await delPlaningMutate({ id });
    if (res?.data?.deletePlaning) {
      toastSuccess({ message: 'Bạn đã xóa quy hoạch thành công.' });
      refetch();
    }
  } catch (err) {
    toastError({ message: 'Không thể xóa dữ liệu.' });
  }
};

function showActionMenus(event: Event, data: PlanningInterface) {
  actionMenus.value = [
    {
      label: 'Xem chi tiết',
      icon: 'pi pi-info-circle',
      visible: hasPermission('/HRM/HRM_ORGANIZATION/HRM_ORG_PLANNING/VIEW'),
      command: () => {
        getDataPlaningById(data.id ?? '').onResult((res: any) => {
          selectedData.value = cloneDeep(res.data.findPlaningById);
          selectedData.value.files = selectedData.value.attachments?.map((att: any) => ({
            name: att.fileName,
            file: { ...att }
          })) ?? [];
        });
        visibleDialogDetail.value = true;
      }
    },
    {
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      visible: hasPermission('/HRM/HRM_ORGANIZATION/HRM_ORG_PLANNING/UPDATE'),
      command: () => {
        getDataPlaningById(data.id ?? '').onResult((res: any) => {
          selectedData.value = cloneDeep(res.data.findPlaningById);
          selectedData.value.planingDate = formatDate(selectedData.value.planingDate, 'DD/MM/YYYY');
          selectedData.value.expireDate = formatDate(selectedData.value.expireDate, 'DD/MM/YYYY');
          selectedData.value.effectDate = formatDate(selectedData.value.effectDate, 'DD/MM/YYYY');
          selectedData.value.files = selectedData.value.attachments?.map((att: any) => ({
            name: att.fileName,
            file: {
              name: att.name,
              size: att.size,
              id: att.id
            }
          })) ?? [];
          isCreate.value = false;
        });
        visibleDialog.value = true;

      }
    },

    {
      label: t('hrm.profile.employeeActionOptions.setStatus'),
      icon: 'pi pi-tag',
      command: () => {
        selectedData.value = {
          ...cloneDeep(data),
          id: data.id ?? '', // ép chắc chắn có
        };
        if (!selectedData.value.status) {
          selectedData.value.status = 'DRAFT';
        }
        showUpdateStatus.value = true;
      }
    },
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      visible: hasPermission('/HRM/HRM_ORGANIZATION/HRM_ORG_PLANNING/DELETE'),
      command: () => {
        confirm.require({
          message: `Bạn có chắc chắn muốn xóa quyết định ${data.planingName} này không?`,
          header: t('common.confirm'),
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: t('common.delete'),
          acceptClass: 'p-button-danger',
          accept: () => {
            handleDelete(data.id);
          }
        });
      },
    }
  ];
  actionMenusRef.value?.toggle(event);
}

function showUserOverlay(event: Event, item: UserMoreInfo) {
  EventBus.emit('user-overlay', {
    visible: true,
    user: item,
    event: event
  });
}

const handleCloseForm = () => {
  visibleDialog.value = false;
  visibleDialogDetail.value = false;
  isCreate.value = true;
  selectedData.value = {} as PlanningInterface;
};
</script>

<style lang='scss' scoped>

:deep(.p-tag.p-tag-secondary) {
  background-color: var(--surface-300);
}
</style>