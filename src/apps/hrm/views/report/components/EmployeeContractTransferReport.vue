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
          {{ t('hrm.report.employeeContractTransferReport') }}
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
      v-model:expandedRowGroups='expandedRowGroups'
      class='white-space-nowrap'
      group-rows-by='departmentId'
      :loading = 'isLoading'
      row-group-mode='subheader'
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
      <template #groupheader='{data: {departmentName, departmentId} }'>
        <span
          class='font-bold'
          style='margin-bottom: 20px;'>{{ departmentName }} <span class='text-color-secondary'>({{ departmentCounts[departmentId] || 0 }})</span>
        </span>
      </template>
      <ColumnGroup type='header'>
        <Row>
          <Column header='TT'/>
          <Column
            header='Mã nhân viên'/>
          <Column
            :header='t("hrm.profile.general.fullName")'/>
          <Column
            header='Đối tượng'/>
          <Column 
            header='Giới tính'/>
          <Column
            header='Ngày sinh'/>
          <Column
            header='Chức danh'/>
          <Column
            header='Bộ phận'/>
          <Column
            header='Công ty'/>
          <Column
            header='Trình độ'/>
          <Column
            header='Chuyên môn'/>
          <Column
            header='Loại chuyển diện hợp đồng'/>
          <Column
            header='Ngày chuyển diện'/>
          <Column
            header='Ghi chú'/>
        </Row>
      </ColumnGroup>
      <Column field='departmentId'></Column>
      <Column
        class='text-center'
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
        style='width: 5vw'>
      </Column>
      <Column
        field='fullName'
        style='width: 15vw'>
      </Column>
      <Column
        class='text-center'
        field='employeeType'
        style='width: 10vw'>
      </Column>
      <Column
        field='gender'
        style='width: 15vw'>
        <template #body='{ data: {gender} }'>
          {{ t(`hrm.recruitment.general.${gender}`) }}
        </template>
      </Column>
      <Column
        field='dateOfBirth'
        style='width: 17vw'>
        <template #body='{ data: {dateOfBirth} }'>
          {{ dateOfBirth && moment(dateOfBirth).format('DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        field='jobTitleName'
        style='width: 15vw'>
      </Column>
      <Column
        class='text-center'
        field='departmentName'
        style='width: 10vw'>
      </Column>

      <Column
        field='organizationName'
        style='width: 10vw'/>
      <Column
        field='educationLevel'
        style='width: 10vw'>
      </Column>
      <Column
        field='major'
        style='width: 10vw'/>
      <Column
        field='typeOfLaborContract'
        style='width: 10vw'/>
      <Column
        field='dateTransferContract'
        style='width: 10vw'>
        <template #body='{ data: {dateTransferContract} }'>
          {{ dateTransferContract && moment(dateTransferContract).format('DD/MM/YYYY') }}
        </template>
      </Column>
      <Column
        field='note'
        style='width: 10vw'>
      </Column>
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
        <FormInputDropdown
          v-model='filter.educationLevelName'
          class='col-12'
          is-multi-select
          :label="t('hrm.recruitment.general.level')"
          :options='levels'/>
        <FormInputDropdown
          v-model='filter.majorName'
          class='col-12'
          is-multi-select
          :label="t('hrm.recruitment.general.major')"
          :options='specializeds'/>
        <FormInputDropdown
          v-model='filter.birthPlace'
          class='col-6'
          label='Nơi sinh'
          option-label='label'
          option-value='value'
          :options='birthPlaces'/>
        <FormInputDropdown
          v-model='filter.gender'
          class='col-6'
          label='Giới tính'
          option-label='label'
          option-value='value'
          :options='genders'/>

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
import { cloneDeep, get, throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { searchTransferOfLaborContract } from '@/apps/hrm/api/graphql/employee-training-process';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
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
const expandedRowGroups = ref<string[]>([]);
const departmentCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const item of data.value) {
    if (!item.departmentId) {
      continue;
    }
    counts[item.departmentId] = (counts[item.departmentId] || 0) + 1;
  }
  return counts;
});
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
const levels = ref([]);
const specializeds = ref([]);
// eslint-disable-next-line max-len
const filter = ref<{organizationId?: string, birthPlace?: string, educationLevelName?: string, majorName?: string, gender?: string }>
({
  organizationId: currentUserInfo.value?.[0],
  gender: 'ALL' 
});

const searchParams = ref({
  transferOfLaborContractSearchPayload: {
    organizationId: filter.value.organizationId,
    gender: filter.value.gender,
  }, 
});
const op = ref();
const { onResult, refetch, onError } = searchTransferOfLaborContract(searchParams.value);

const { moment } = useMoment();
onResult((res) => {
  const content = cloneDeep(get(res, 'data.searchTransferOfLaborContract', [])).sort(
    (a:{departmentId?: string}, b:{departmentId?: string}) => (a.departmentId ?? '').localeCompare(b.departmentId ?? ''));

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
  refetch({ transferOfLaborContractSearchPayload: { ...filter.value }, });
  op.value.hide();
}

function clear() {
  filter.value = {};
  isLoading.value = true;
  refetch({ transferOfLaborContractSearchPayload: {}, });
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
  fetchCategoryMappingName(CATEGORY_TYPE.EDUCATION_LEVEL, levels);

  fetchCategoryMappingName(CATEGORY_TYPE.MAJOR, specializeds);

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
        searchParams.value.transferOfLaborContractSearchPayload.organizationId = levelCode.id;
      }
    }
  });

  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const genders = [
  {
    label: 'Tất cả',
    value: 'ALL' 
  },
  {
    label: 'Nam',
    value: 'MALE' 
  },
  {
    label: 'Nữ',
    value: 'FEMALE' 
  },
];

const birthPlaces = [
  {
    label: 'Hà Nội',
    value: 'Hà Nội' 
  },
  {
    label: 'Hồ Chí Minh',
    value: 'Hồ Chí Minh' 
  },
  {
    label: 'Đà Nẵng',
    value: 'Đà Nẵng' 
  },
  {
    label: 'Hải Phòng',
    value: 'Hải Phòng' 
  },
  {
    label: 'Cần Thơ',
    value: 'Cần Thơ' 
  },
  {
    label: 'An Giang',
    value: 'An Giang' 
  },
  {
    label: 'Bà Rịa - Vũng Tàu',
    value: 'Bà Rịa - Vũng Tàu' 
  },
  {
    label: 'Bắc Giang',
    value: 'Bắc Giang' 
  },
  {
    label: 'Bắc Kạn',
    value: 'Bắc Kạn' 
  },
  {
    label: 'Bạc Liêu',
    value: 'Bạc Liêu' 
  },
  {
    label: 'Bắc Ninh',
    value: 'Bắc Ninh' 
  },
  {
    label: 'Bến Tre',
    value: 'Bến Tre' 
  },
  {
    label: 'Bình Định',
    value: 'Bình Định' 
  },
  {
    label: 'Bình Dương',
    value: 'Bình Dương' 
  },
  {
    label: 'Bình Phước',
    value: 'Bình Phước' 
  },
  {
    label: 'Bình Thuận',
    value: 'Bình Thuận' 
  },
  {
    label: 'Cà Mau',
    value: 'Cà Mau' 
  },
  {
    label: 'Cao Bằng',
    value: 'Cao Bằng' 
  },
  {
    label: 'Đắk Lắk',
    value: 'Đắk Lắk' 
  },
  {
    label: 'Đắk Nông',
    value: 'Đắk Nông' 
  },
  {
    label: 'Điện Biên',
    value: 'Điện Biên' 
  },
  {
    label: 'Đồng Nai',
    value: 'Đồng Nai' 
  },
  {
    label: 'Đồng Tháp',
    value: 'Đồng Tháp' 
  },
  {
    label: 'Gia Lai',
    value: 'Gia Lai' 
  },
  {
    label: 'Hà Giang',
    value: 'Hà Giang' 
  },
  {
    label: 'Hà Nam',
    value: 'Hà Nam' 
  },
  {
    label: 'Hà Tĩnh',
    value: 'Hà Tĩnh' 
  },
  {
    label: 'Hải Dương',
    value: 'Hải Dương' 
  },
  {
    label: 'Hậu Giang',
    value: 'Hậu Giang' 
  },
  {
    label: 'Hòa Bình',
    value: 'Hòa Bình' 
  },
  {
    label: 'Hưng Yên',
    value: 'Hưng Yên' 
  },
  {
    label: 'Khánh Hòa',
    value: 'Khánh Hòa' 
  },
  {
    label: 'Kiên Giang',
    value: 'Kiên Giang' 
  },
  {
    label: 'Kon Tum',
    value: 'Kon Tum' 
  },
  {
    label: 'Lai Châu',
    value: 'Lai Châu' 
  },
  {
    label: 'Lâm Đồng',
    value: 'Lâm Đồng' 
  },
  {
    label: 'Lạng Sơn',
    value: 'Lạng Sơn' 
  },
  {
    label: 'Lào Cai',
    value: 'Lào Cai' 
  },
  {
    label: 'Long An',
    value: 'Long An' 
  },
  {
    label: 'Nam Định',
    value: 'Nam Định' 
  },
  {
    label: 'Nghệ An',
    value: 'Nghệ An' 
  },
  {
    label: 'Ninh Bình',
    value: 'Ninh Bình' 
  },
  {
    label: 'Ninh Thuận',
    value: 'Ninh Thuận' 
  },
  {
    label: 'Phú Thọ',
    value: 'Phú Thọ' 
  },
  {
    label: 'Phú Yên',
    value: 'Phú Yên' 
  },
  {
    label: 'Quảng Bình',
    value: 'Quảng Bình' 
  },
  {
    label: 'Quảng Nam',
    value: 'Quảng Nam' 
  },
  {
    label: 'Quảng Ngãi',
    value: 'Quảng Ngãi' 
  },
  {
    label: 'Quảng Ninh',
    value: 'Quảng Ninh' 
  },
  {
    label: 'Quảng Trị',
    value: 'Quảng Trị' 
  },
  {
    label: 'Sóc Trăng',
    value: 'Sóc Trăng' 
  },
  {
    label: 'Sơn La',
    value: 'Sơn La' 
  },
  {
    label: 'Tây Ninh',
    value: 'Tây Ninh' 
  },
  {
    label: 'Thái Bình',
    value: 'Thái Bình' 
  },
  {
    label: 'Thái Nguyên',
    value: 'Thái Nguyên' 
  },
  {
    label: 'Thanh Hóa',
    value: 'Thanh Hóa' 
  },
  {
    label: 'Thừa Thiên Huế',
    value: 'Thừa Thiên Huế' 
  },
  {
    label: 'Tiền Giang',
    value: 'Tiền Giang' 
  },
  {
    label: 'Trà Vinh',
    value: 'Trà Vinh' 
  },
  {
    label: 'Tuyên Quang',
    value: 'Tuyên Quang' 
  },
  {
    label: 'Vĩnh Long',
    value: 'Vĩnh Long' 
  },
  {
    label: 'Vĩnh Phúc',
    value: 'Vĩnh Phúc' 
  },
  {
    label: 'Yên Bái',
    value: 'Yên Bái' 
  }
];
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