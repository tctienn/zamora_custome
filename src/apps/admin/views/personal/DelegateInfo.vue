<template>
  <div class='grid grid-nogutter'>
    <div
      class='border-300 border-right-2 col-3 pr-3'
      style='min-height: 20rem'>
      <h5 class='mb-3'>Ủy quyền xử lý</h5>
      <div class='align-items-center create flex gap-3'>
        <h6 class='m-0'>Người nhận ủy quyền:</h6>
        <ButtonIcon
          icon='add'
          @click='() => (showDialog = true)'/>
      </div>
      <div
        class='flex flex-column gap-2 mt-2 overflow-auto'
        style='max-height: 90vh'>
        <div
          v-for='del of delegates'
          :key='del.id'
          class='align-items-center cursor-pointer flex gap-2 hover:surface-hover px-3 py-2'
          :class="del.id === selectedDelegate ? 'surface-hover' : ''"
          @click='selectedDelegate = del.id'>
          <AppUser
            avatar-size='3'
            info-visible
            :infos="['positionName', 'departments']"
            name-visible
            :user-id='del.toUser'>
            <template #name='{ user, displayInfos }'>
              <span
                class='flex font-semibold justify-content-center'
                :class="
                  del.toDate &&
                    (moment(del.toDate).toDate() < new Date() || !del.status
                      ? 'text-red-500'
                      : '')
                ">{{ user?.fullName }}</span>
              <small class='flex flex-row gap-2 opacity-80'>
                {{ displayInfos }}
              </small>
            </template>
          </AppUser>
        </div>
      </div>
    </div>
    <div class='col-9 pl-3'>
      <div v-if='selectedDelegate || delegate'>
        <h6 class='m-0'>1. Thông tin chung</h6>
        <div class='align-items-center flex gap-8 m-2'>
          <div>Người ủy quyền:</div>
          <AppUser
            avatar-size='3'
            info-visible
            :infos="['positionName', 'departments']"
            name-visible
            :user-id='delegateInfo?.toUser'/>
          <div class='align-items-center flex gap-2'>
            <InputSwitch
              v-model='delegateInfo.status'
              :disabled='isExpired'/>
            <span>{{ t('common.lockOrUnlock') }}</span>
          </div>
        </div>
        <div class='align-items-center flex gap-4 m-2'>
          <span v-required>Thời gian: Từ ngày</span>
          <Calendar
            v-model='delegateInfo.fromDate'
            :class="
              delegateInfo.toDate &&
                delegateInfo.fromDate &&
                (moment(delegateInfo.toDate).toDate() <
                  moment(delegateInfo.fromDate).toDate()
                  ? 'p-invalid'
                  : '')
            "
            date-format='yy-mm-dd'
            :disabled='isExpired'
            hour-format='24'
            icon-display='input'
            show-icon/>
          <span v-required>Đến ngày</span>
          <div class='flex flex-column'>
            <Calendar
              v-model='delegateInfo.toDate'
              :class="
                (delegateInfo.toDate &&
                  delegateInfo.fromDate &&
                  (moment(delegateInfo.toDate).toDate() <
                    moment(delegateInfo.fromDate).toDate()
                    ? 'p-invalid'
                    : '')) ||
                  (!delegateInfo.toDate && 'p-invalid')
              "
              date-format='yy-mm-dd'
              :disabled='isExpired'
              hour-format='24'
              icon-display='input'
              show-icon/>
            <small
              v-if='!delegateInfo.toDate'
              class='p-error'>
              {{ t(`admin.user.validToDate`) }}
            </small>
          </div>
        </div>
        <div class='text-center w-full'>
          <small
            v-if='
              delegateInfo.toDate &&
                delegateInfo.fromDate &&
                moment(delegateInfo.toDate).toDate() <
                moment(delegateInfo.fromDate).toDate()
            '
            class='p-error'>
            {{ t(`admin.user.validDate`) }}
          </small>
        </div>

        <h6 class='m-0 mb-2 mt-4'>2. Nội dung thực hiện</h6>
        <DataTable :value='menuRoles'>
          <Column
            header='Vai trò'
            style='width: 35%'>
            <template #body='{ data }'>
              <div class='align-items-center flex'>
                <Checkbox
                  binary
                  :disabled='isExpired'
                  :model-value='getIsSelected(data.value)'
                  @update:model-value='
                    (value: any) => setIsSelected(data.value, value)
                  '/>
                <label class='ml-2'>{{ data.label }}</label>
              </div>
            </template>
          </Column>

          <Column header='Quản lý văn bản'>
            <template #body='{ data }'>
              <div v-if='getIsSelected(data.value)'>
                <div
                  v-for='(item, index) in DocumentManager'
                  :key='index'
                  class='align-items-center flex pb-1'>
                  <Checkbox
                    binary
                    :disabled='!checkCurrentPermissions(item.code) || isExpired'
                    :model-value='getAppPermission(data.value, item.code)'
                    @change='setAppPermission(data.value, item.code)'/>
                  <label class='ml-2'>{{ item.label }}</label>
                </div>
              </div>
            </template>
          </Column>

          <Column header='Quản lý lịch họp'>
            <template #body='{ data }'>
              <div v-if='getIsSelected(data.value)'>
                <div
                  v-for='(item, index) in MeetingManager'
                  :key='index'
                  class='align-items-center flex pb-1'>
                  <Checkbox
                    binary
                    :disabled='isExpired'
                    :model-value='getAppPermission(data.value, item.code)'
                    @change='setAppPermission(data.value, item.code)'/>
                  <label class='ml-2'>{{ item.label }}</label>
                </div>
              </div>
            </template>
          </Column>

          <Column header='Quản lý công việc'>
            <template #body='{ data }'>
              <div v-if='getIsSelected(data.value)'>
                <div
                  v-for='(item, index) in WorkManager'
                  :key='index'
                  class='align-items-center flex pb-1'>
                  <Checkbox
                    binary
                    :model-value='getAppPermission(data.value, item.code)'
                    @change='setAppPermission(data.value, item.code)'/>
                  <label class='ml-2'>{{ item.label }}</label>
                </div>
              </div>
            </template>
          </Column>
        </DataTable>

        <div class='flex justify-content-center mt-3 w-full'>
          <Button
            icon='pi pi-save'
            :label="t('common.save')"
            @click='submit'/>
        </div>
      </div>
    </div>
  </div>

  <SelectUserDialog
    v-model:visible='showDialog'
    @update:model-value='delegate = [$event]'></SelectUserDialog>
</template>

<script setup lang='ts'>
import { cloneDeep, trimEnd } from 'lodash';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  findDelegateInfoById,
  getAllDelegatesByFromUser,
  saveDelegateInfo,
} from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { DelegateInfoInterface } from '@/apps/admin/model/delegateInfo';
import type { UserOrganizationRole } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import AppUser from '@/common/components/app/AppUser.vue';
import SelectUserDialog from '@/common/components/dialog/user/SelectUserDialog.vue';
import { DateTimeFormat } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n() || {};
const selectedDelegate = ref();
const delegates = ref();
const showDialog = ref(false);
const { user } = useUserStore();
const delegate = ref();
const delegateInfo = ref<DelegateInfoInterface>({});
const { moment } = useMoment();
const {
  mutate: saveDelegateInfoMutate,
  onDone: saveDelegateInfoOnDone
} =
  saveDelegateInfo();
const {
  administrativeRoles,
  documentRoles,
  currentPermissions
} = storeToRefs(
  useDocumentRolesStore(),
);

const menuRoles = ref<{ label: string; value: string }[]>(
  [...administrativeRoles.value, ...documentRoles.value].map((role) => ({
    label: buildRoleLabel(role),
    value: buildRoleCode(role),
  })),
);

function buildRoleLabel(orgRole: UserOrganizationRole) {
  return trimEnd(
    orgRole.role?.name + ' - ' + orgRole.organization?.name,
    ' - ',
  );
}

function checkCurrentPermissions(prefix: string) {
  return currentPermissions.value.some((permission: string) =>
    permission.startsWith(prefix),
  );
}

function buildRoleCode(orgRole: UserOrganizationRole) {
  return trimEnd(orgRole.role?.code + '-' + orgRole.organization?.id, '-');
}

watch(delegate, (newVal) => {
  dataInput.value = initData();
  selectedDelegate.value = null;
  delegateInfo.value = {
    fromUser: user.id,
    toUser: newVal[0][0],
    fromDate: new Date(),
    status: true,
    delegateObjectType: [],
  };
});

saveDelegateInfoOnDone(() => {
  toastSuccess({ message: t('Lưu thành công.') });
  getAllDelegatesByFromUserRefetch()?.then(() => {
    findDelegateInfoByIdRefetch({ id: delegates.value[0].id });
  });
});

function submit() {
  if (
    delegateInfo.value.toDate
    && delegateInfo.value.fromDate
    && moment(delegateInfo.value.toDate).toDate()
    < moment(delegateInfo.value.fromDate).toDate()
    || !delegateInfo.value.toDate
  ) {
    return;
  }
  saveDelegateInfoMutate({
    delegateInfo: {
      ...delegateInfo.value,
      fromDate: delegateInfo.value.fromDate
        ? moment(delegateInfo.value.fromDate).format(
          DateTimeFormat.ISO_LOCAL_DATE,
        )
        : null,
      toDate: delegateInfo.value.toDate
        ? moment(delegateInfo.value.toDate).format(
          DateTimeFormat.ISO_LOCAL_DATE,
        )
        : null,
      delegateObjectType: dataInput.value.filter((item) => item.isSelected),
    },
  });
}

const {
  onResult: getAllDelegatesByFromUserResult,
  refetch: getAllDelegatesByFromUserRefetch,
} = getAllDelegatesByFromUser(user.id || '');

getAllDelegatesByFromUserResult((res) => {
  delegates.value = res.data.getAllDelegatesByFromUser;
});

const {
  onResult: findDelegateInfoByIdResult,
  refetch: findDelegateInfoByIdRefetch,
} = findDelegateInfoById('');

const isExpired = ref();

findDelegateInfoByIdResult((res) => {
  delegateInfo.value = cloneDeep(res.data.findDelegateInfoById);

  isExpired.value = moment(delegateInfo.value.toDate).toDate() < new Date();

  delegateInfo.value.delegateObjectType?.forEach((role: any) => {
    const rowValue = role.roleCode + '-' + role.deptId;

    const data = dataInput.value.find((data) => data.rowValue === rowValue);
    if (data) {
      data.appPermission = [...role.appPermission];
      data.isSelected = true;
    }
  });
});

watch(selectedDelegate, (newVal) => {
  findDelegateInfoByIdRefetch({ id: newVal });
  dataInput.value = initData();
  isExpired.value = false;
});

const DocumentManager = ref([
  {
    label: 'Văn bản đến',
    code: '/DOCUMENT/DOCUMENT_DOC-IN',
  },
  {
    label: 'Văn bản đi',
    code: '/DOCUMENT/DOCUMENT_DOC-OUT',
  },
  {
    label: 'Tờ trình',
    code: '/DOCUMENT/DOCUMENT_SUBMIT',
  },
]);

const MeetingManager = ref([
  {
    label: 'Phê duyệt lịch',
    code: 'APPROVE_SCHEDULE',
  },
]);

const WorkManager = ref([
  {
    label: 'Giao việc',
    code: 'ASSIGN_WORK',
  },
]);

type DataInput = {
  roleCode: string;
  roleName: string;
  deptId: string;
  appPermission: string[];
  allAppPermission: string[];
  isSelected: boolean;
  rowValue: string;
};

function initData(): DataInput[] {
  return [...administrativeRoles.value, ...documentRoles.value].map(
    (role: UserOrganizationRole) => ({
      roleCode: role.role?.code,
      roleName: role.role?.name,
      deptId: role.organization.id,
      appPermission: [],
      allAppPermission: role.role.permissions,
      isSelected: false,
      rowValue: buildRoleCode(role),
    }),
  );
}

const dataInput = ref<DataInput[]>(initData());

const getIsSelected = (rowValue: string) =>
  dataInput.value.find((item) => item.rowValue === rowValue)?.isSelected
  || false;

const setIsSelected = (rowValue: string, value: boolean) => {
  const item = dataInput.value.find((item) => item.rowValue === rowValue);
  if (item) {
    item.isSelected = value;
    if (!value) {
      item.appPermission = [];
    }
  }
};

const getAppPermission = (rowValue: string, permission: string) =>
  dataInput.value
    .find((item) => item.rowValue === rowValue)
    ?.appPermission.includes(permission) || false;

const setAppPermission = (rowValue: string, newPermission: string) => {
  const item = dataInput.value.find((input) => input.rowValue === rowValue);
  if (item) {
    if (getAppPermission(rowValue, newPermission)) {
      item.appPermission = item.appPermission.filter(
        (s) => !s.includes(newPermission),
      );
    } else {
      item.appPermission = [
        ...item.appPermission,
        newPermission,
        ...item.allAppPermission.filter((s) => s.includes(newPermission)),
      ];
    }
  }
};
</script>

<style lang='scss' scoped>
.create {
  :deep(.p-button) {
    padding: 0.25rem;
  }
}
</style>
