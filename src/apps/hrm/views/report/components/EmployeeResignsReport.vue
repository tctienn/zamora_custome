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
    style='width:95vw'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          {{ t('hrm.report.employeeResignsReport') }}
        </div>
        <div class='flex gap-2'>
          <Button
            class='button-style focus:shadow-none font-normal hover:surface-200 surface-overlay'

            icon='pi pi-filter'
            label='Điều kiện lập'
            severity='secondary'
            @click='togglePanel'/>
          <Button
            class='button-style focus:shadow-none font-normal hover:surface-200 surface-overlay'
            icon='pi pi-file-export'
            label='Kết xuất'
            severity='secondary'/>
          <Button
            class='button-style focus:shadow-none font-normal hover:surface-200 surface-overlay'
            icon='pi pi-print'
            label='In'
            severity='secondary'/>
          <Button
            class='button-style focus:shadow-none font-normal hover:surface-200 surface-overlay'
            icon='pi pi-refresh'
            severity='secondary'
            @click='clear'/>
        </div>
      </div>
    </template>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      class='white-space-nowrap'
      :loading = 'isLoading'
      row-hover
      scroll-direction='both'
      scroll-height='flex'
      scrollable
      :show-gridlines='true'
      :value='data'>
      <template #empty>
        <div class='text-center text-color-secondary text-sm'>
          <span>Không có dữ liệu</span>
        </div>
      </template>
      <template #loading>
        <div class='align-items-center flex flex-column justify-content-center p-4'>
          <i class='mb-3 pi pi-spin pi-sync text-4xl text-primary'></i>
          <span>Đang tải dữ liệu, vui lòng chờ...</span>
        </div>
      </template>
      <ColumnGroup type='header'>
        <Row>
          <Column
            frozen
            header='TT' />
          <Column
            frozen 
            :header='t("hrm.profile.general.code")'/>
          <Column
            frozen 
            :header='t("hrm.profile.general.fullName")'/>
          <Column
            :header='t("hrm.profile.general.birthDay")'/>
          <Column header='Giới tính'/>
          <Column
            header='Số CCCD'/>
          <Column
            :header='t("hrm.certificate.issuingPlace")'/>
          <Column
            header='Ngày cấp'/>
          <Column
            header='Nơi cấp'/>
          <Column
            header='Số điện thoại'/>
          <Column
            header='Email'/>
          <Column
            header='Trình độ học vấn'/>
          <Column
            header='Chuyên ngành'/>
          <Column
            header='Nơi đào tạo'/>
          <Column
            header='Mã số thuế'/>
          <Column
            header='Số sổ bảo hiểm'/>
          <Column
            header='Số hợp đồng'/>
          <Column
            header='Loại nhân sự'/>
          <Column
            header='Chức vụ'/>
          <Column
            header='Nơi ở hiện tại'/>
          <Column
            header='Ngày vào'/>
          <Column
            header='Ngày nghỉ'/>
          <Column
            header='Lý do'/>
        </Row>
      </ColumnGroup>
      <Column
        class='text-center'
        frozen 
        style='width: 2vw'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column
        class='text-center' 
        field='employeeCode'
        frozen
        style='width: 5vw'>
      </Column>
      <Column
        field='fullName' 
        frozen
        style='width: 15vw'>
      </Column>
      <Column
        class='text-center'
        field='dateOfBirth'
        style='width: 10vw'>
        <template #body='{ data: {dateOfBirth} }'>
          {{ dateOfBirth && moment(dateOfBirth).format('DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        field='gender'
        style='width: 15vw'>
        <template #body='{ data: {gender} }'>
          {{ t(`hrm.recruitment.general.${gender}`) }}
        </template>
      </Column>
      <Column
        field='citizenIdentificationNumber'
        style='width: 17vw'>
      </Column>
      <Column
        field='issueDate'
        style='width: 15vw'>
        <template #body='{ data: {issueDate} }'>
          {{ issueDate && moment(issueDate).format('DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        class='text-center'
        field='issuePlace'
        style='width: 10vw'>
      </Column>

      <Column
        field='phoneNumber'
        style='width: 10vw'/>
      <Column
        style='width: 10vw'>
      </Column>
      <Column
        field='email'
        style='width: 10vw'/>
      <Column
        field='professionalLevel'
        style='width: 10vw'/>
      <Column
        field='major'
        style='width: 10vw'/>
      <Column
        field='issuingPlace'
        style='width: 10vw'>
      </Column>
      <Column
        field='taxCode'
        style='width: 10vw'/>
      <Column
        field='codeBHXH'
        style='width: 10vw'/>
      <Column
        field='contractNumber'
        style='width: 10vw'/>
      <Column
        field='employeeType'
        style='width: 10vw'>
      </Column>
      <Column
        field='employeePosition'
        style='width: 10vw'/>
      <Column
        field='address'
        style='width: 10vw'/>
      <Column
        field='joinDate'
        style='width: 10vw'>
        <template #body='{ data: {joinDate} }'>
          {{ joinDate && moment(joinDate).format('DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        field='resignDate'
        style='width: 10vw'>
        <template #body='{ data: {resignDate} }'>
          {{ resignDate && moment(resignDate).format('DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        field='reason'
        style='width: 10vw'/>
    </DataTable>
    <OverlayPanel
      ref='op'
      class='w-30rem'
      unstyled>
      <div class ='border-1 border-round formgrid grid mt-2 mx-0 overflow-auto py-3 search-popup shadow-4 surface-border surface-card'>
        <div class='col-12 field'>
          <label> Đơn vị </label>
          <Dropdown
            v-model='filter.organizationId'
            class='w-full'
            option-label='name'
            option-value='id'
            :options='organizations'
            show-clear>
            <template #option='{ option }'>
              <div
                class='flex gap-2 items-center relative'
                :class="{ 'text-blue font-semibold': option.id === filter.organizationId }">
                <AppIcon
                  v-if='option.id === filter.organizationId'
                  class='absolute'
                  name='check'
                  size='1.3'/>
                <span class='ml-4'>{{ option.name }}</span>
              </div>
            </template>
          </Dropdown>
        </div>
        <FormInputCalendar
          v-model='filter.fromDate'
          class='col-6'
          label='Từ ngày'/>
        <FormInputCalendar
          v-model='filter.toDate'
          class='col-6'
          label='Đến ngày'/>

        <div class='col-12 flex gap-2 justify-content-end'>
          <Button
            icon='pi pi-filter-slash'
            label='Xoá điều kiện'
            outlined
            @click='clear'/>
          <Button
            icon='pi pi-check'
            label='Thực hiện'
            severity='primary'
            @click='submit'/>
        </div>
      </div>
    </OverlayPanel>
  </Sidebar>
</template>

<script setup lang='ts'>
import { get, throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { searchEmployeesHasResignedReport } from '@/apps/hrm/api/graphql/employee-training-process';
import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const visible = defineModel('visible', { type: Boolean });
const hideForm = () => {
  emits('hide-dialog');
};
const data = ref<any>([]);
const pageable = reactive<Pageable>({
  page: 0,
  size: 50
});

const { user } = storeToRefs(useUserStore());
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
store.fetchAllUsers();
const currentUserInfo = computed(() => {
  return user.value?.id ? usersMoreInfo.value[user.value.id]?.departments.map(d => d.id) : undefined;
});
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const isLoading = ref(true);
const organizations = ref<OrganizationInterface[]>([]);
const filter = ref<{organizationId?: string, fromDate?: Date, toDate?: Date}>({ organizationId: currentUserInfo.value?.[0] });

const searchParams = ref({ employeesHasResignedSearchPayload: { organizationId: filter.value.organizationId }, });
const op = ref();
const { onResult, refetch, onError } = searchEmployeesHasResignedReport(searchParams.value);

const { moment } = useMoment();
onResult((res) => {
  const content = get(res, 'data.searchEmployeesHasResignedReport', []);

  if (isLoadMore.value) {
    data.value = [
      ...data.value,
      ...content
    ];
  } else {
    data.value = content;
  }
  canLoadMore.value = content.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
  isLoading.value = false;
});

function togglePanel(event :MouseEvent) {
  op.value.toggle(event);
}

function submit() {
  isLoading.value = true;
  refetch({
    employeesHasResignedSearchPayload: {
      organizationId: filter.value.organizationId,
      fromDate: filter.value.fromDate ? moment(filter.value.fromDate).format(DateTimeFormat.ISO_LOCAL_DATE) : undefined,
      toDate: filter.value.toDate ? moment(filter.value.toDate).format(DateTimeFormat.ISO_LOCAL_DATE) : undefined,
    }
  });
  op.value.hide();
}

function clear() {
  filter.value = {};
  isLoading.value = true;
  refetch({ employeesHasResignedSearchPayload: {}, });
}

onError(() => {
  isLoading.value = false;
});

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scrollend', throttle(scrollEvent, 1000));
  }
}

function findLevelCode(userOrgId: string, orgs: OrganizationInterface[]) {
  if (!userOrgId || !orgs?.length) {
    return null;
  }
  let current = orgs.find(o => o.id === userOrgId);
  let parent = orgs.find(o => o.code === current?.parentCode);
  if (!parent) {
    return current;
  }
  while (parent && parent.parentCode && parent.parentCode.trim() !== '') {
    const nextParent = orgs.find(o => o.code === parent?.parentCode);
    if (!nextParent || nextParent?.parentCode === '') {
      break;
    }
    parent = nextParent;
  }
  const isParentLevel1 = !parent.parentCode || parent.parentCode.trim() === '';
  return isParentLevel1 ? current : parent;
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });

  getAllOrganizationGraphql().onResult((res) => {
    const orgs:OrganizationInterface[] = res.data?.allOrganizationPublic || [];
    const rootOrgs = orgs.filter((org) => !org.parentCode);
    const rootCodes = rootOrgs.map((r) => r.code);
    organizations.value = orgs.filter((org) =>org.parentCode !== null && rootCodes.includes(org.parentCode));
    const userOrgId = currentUserInfo.value?.[0];
    if (userOrgId) {
      const levelCode = findLevelCode(userOrgId, orgs);
      if (levelCode) {
        filter.value.organizationId = levelCode.id;
        searchParams.value.employeesHasResignedSearchPayload.organizationId = levelCode.id;
      }
    }
  });
});
</script>

<style scoped>
.white-space-nowrap {
  white-space: nowrap;
}

.text-blue {
  color: #0d99ff;
}

.button-style {
   border: 1px solid transparent;
}

.button-style:hover {
   border: 1px solid #C6C6C6;
}
</style>;