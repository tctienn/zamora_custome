<template>
  <Dialog
    v-if='group'
    v-model:visible='visible'
    :header='t("ecm.group.userAuthorization")'
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide='emits("hide-dialog")'>
    <DataTable
      data-key='id'
      lazy
      :loading='loadingUser'
      table-style='min-width: 40rem'
      :total-records='totalRecords'
      :value='listUser'>
      <template #header>
        <div class='align-items-center flex flex-wrap justify-content-between'>
          <span class='font-bold ml-2 text-primary text-white text-xl'>{{ t('admin.user.tableTitle') }}</span>

          <span class='block p-input-icon-left'>
            <i class='pi pi-search'/>
            <InputText
              v-model='searchKeyword'
              :placeholder='t("common.search")'/>
          </span>
        </div>
      </template>
      <Column
        :header='t("common.fullName")'>
        <template #body='{data}'>
          <AppUser
            name-visible
            :user-id='data?.id?.userId'/>
        </template>
      </Column>
      <Column
        :field='item => (item as FileFolderPermission)?.info?.email || ""'
        :header='t("admin.userGroup.email")'></Column>
      <Column
        :field='item => (item as FileFolderPermission)?.info?.employeeId || ""'
        :header='t("admin.employee.id")'/>
      <Column
        :field='item => (item as FileFolderPermission)?.info?.positionName.join(", ") || ""'
        :header='t("admin.employee.positionName")'/>
      <Column
        :field='item => (item as FileFolderPermission)?.info?.departments.map(d=> d.name).join(", ") || ""'
        :header='t("admin.employee.department")'/>
      <Column
        field='permission'
        :header='t("admin.userGroup.permission.title")'>
        <template #body='{data, index}'>
          <Dropdown
            :disabled='!hasPermission("/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/DECENTRALIZATION")'
            :model-value='data["permission"]'
            option-label='label'
            option-value='value'
            :options='permission'
            :placeholder='t("common.select")'
            @change='changeUserPermission($event,index)'/>
        </template>
      </Column>

    </DataTable>
    <template #footer>
      <div class='flex flex-row justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          @click='emits("hide-dialog")'/>
        <Button
          v-if="hasPermission('/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/DECENTRALIZATION')"
          icon='pi pi-check'
          :label='t("common.save")'
          @click='addUserInUserGroup'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { cloneDeep, get, pick, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import Dropdown from 'primevue/dropdown';
import { computed, type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserNotAdminGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserEdge } from '@/apps/admin/model/User';
import { Permission } from '@/apps/admin/model/userGroup';
import { hasPermission } from '@/apps/admin/services/permission';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findByGroupId, save } from '@/apps/ecm/api/graphql/file-folder-permission-graphql-api';
import type { FileFolderPermission } from '@/apps/ecm/model/permission';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DIALOG_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { convertAlias, mapEnum } from '@/common/helpers/utils';
import type { Group } from '@/common/model/group';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    required: true
  },
  group: {
    type: Object as PropType<Group>,
    required: true
  }
});
const emits = defineEmits(['hide-dialog', 'reload']);
const visible = ref(props.visibleDialog);
const { t } = useI18n() || {};
const userStore = ref<FileFolderPermission[]>([]);
const usersWithInfo = computed(() => userStore.value.map(p => ({
  ...p,
  info: usersMoreInfo.value[p.id.userId]
})));

const listUser = computed(() => usersWithInfo.value.filter(p => !searchKeyword.value
  || (convertAlias(p.info?.fullName || '').includes(convertAlias(searchKeyword.value))
    || convertAlias(p.info?.email || '').includes(convertAlias(searchKeyword.value)))
));
const totalRecords = ref(0);
const user = ref([]);
const loadingUser = ref();
const searchKeyword = ref('');
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [{
    property: 'server',
    direction: Direction.ASC
  }]
});
const searchParams = reactive(
  {
    keyword: '',
    organization: '',
    pageable: pageable
  }
);

const infoStore = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(infoStore);

const { onResult: findByGroupIdAndPathResult } = findByGroupId(props.group.id);
findByGroupIdAndPathResult((res) => {
  userStore.value = cloneDeep(res.data.findByGroupId as FileFolderPermission[]);
});

const { onResult: getAllUserResult, } = getAllUserNotAdminGraphql(searchParams);
getAllUserResult((response) => {
  const {
    totalCount,
    edges
  } = get(response, 'data.getAllUserNotAdmin', {
    totalCount: 0,
    edges: []
  });
  totalRecords.value = totalCount;
  user.value = edges.map((edge: UserEdge, index: number) => ({
    ...edge.node,
    ordinalNumber: pageable.page * pageable.size + index + 1
  }));
  loadingUser.value = false;
});

function changeUserPermission(event: DropdownChangeEvent, index: number) {
  userStore.value[index].permission = event.value;
}

const permission = mapEnum(Permission).map((type) => ({
  label: t(`admin.userGroup.permission.${toLower(type)}`),
  value: type
}));

const {
  mutate: saveMutation,
  onDone: saveOnDone
} = save();

function addUserInUserGroup() {
  saveMutation({ inputData: userStore.value.map(p => pick(p, ['id', 'permission'])) });
}

saveOnDone(() => {
  toastSuccess();
  // emits('reload');
  // emits('hide-dialog');
});

</script>

<script lang='ts'>
export default { name: 'FormDecentralization' };
</script>

<style scoped>

</style>
