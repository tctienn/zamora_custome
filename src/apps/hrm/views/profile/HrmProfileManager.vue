<template>
  <div class='flex flex-column gap-2'>
    <Toolbar class='p-0 px-2'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <ButtonIcon
            v-tooltip='"Ẩn/Hiện"'
            class='align-self-center p-1'
            icon='menu'
            rounded
            text
            @click='listRef?.toggleTree()'/>
          <div class='font-bold'>
            {{ t('hrm.profile.title') }}
          </div>
        </div>
      </template>
      <template #end>

        <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
          <Button
            class='btn-create focus:shadow-none font-medium p-2'
            icon='pi pi-plus'
            :label='t("common.create")'
            @click='createProfile'>
          </Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            label='Nghiệp vụ khác'
            @click='createAdditionalProfile'>
            <template #icon>
              <AppIcon
                class='mr-2'
                name='add_task'
                size='16px'/>
            </template>
          </Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-search-plus'
            label='Tìm nâng cao'
            severity='secondary'
            @click='openAdvancedSearch'></Button>
          <Button
            class='focus:shadow-none font-normal gap-2 hover:surface-200'
            :label="t('work.task.viewByType')"
            severity='secondary'
            @click='viewTypeRef?.toggle'>
            <template #icon>
              <i
                class='pi pi-list'
                style='margin-top: 1px'></i>
              <i class='flex-order-2 mt-1 pi pi-angle-down'/>
            </template>
          </Button>

          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-envelope'
            :label='t("common.email")'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-tag'
            :label='t("common.tag")'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-import'
            label='Import'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-file-export'
            label='Export'
            severity='secondary'></Button>
          <Button
            class='focus:shadow-none font-normal hover:surface-200'
            icon='pi pi-cog'
            :label='t("common.setting")'
            severity='secondary'
            @click='configFormVisible = true'></Button>
        </div>
      </template>
    </Toolbar>
    <HrmProfileListWrapper ref='listRef'/>
    <Paginator
      :class='{ hidden: !total }'
      current-page-report-template='{first}-{last}/{totalRecords}'
      :pt="{
        root: {
          class: 'border-noround-top'
        },
        paginatorwrapper: {
          class: 'custom-paginator-wrapper fix-center'
        },
      }"
      :rows='size'
      template='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport'
      :total-records='total'
      @page='onPage'/>
  </div>
  <HrmProfileFormSidebar
    :key="profileEdit?.employeeId || ''"
    v-model='profileEdit'
    v-model:visible='formVisible'/>
  <ProfileViewSidebar
    v-if='detailVisible'
    :key="profileEdit?.employeeId || ''"
    v-model='profileEdit'
    v-model:visible='detailVisible'
    :loading-data='loading'
    :menu-version-profile='viewProfileHis'
    @update:profile='(val: Employee) => profileEdit = val'/>
  <HrmConfigForm v-model:visible='configFormVisible'/>
  <Menu
    ref='viewTypeRef'
    :model='viewTypeMenu'
    popup>

    <template #item='itemProp'>
      <div class='cursor-pointer flex gap-1 p-2'>
        <AppIcon
          class='mr-2'
          name='check'
          size='1.5'
          :style='{opacity:viewType == itemProp.item.key ? 1 : 0,
                   color: viewType == itemProp.item.key ? "#0d99ff" : ""}'/>

        <div
          :style='{color: viewType == itemProp.item.key ? "#0d99ff" : ""}'>
          {{ itemProp.item.label }}
        </div>
      </div>
    </template>
  </Menu>
  <HrmAdvanceSearch v-model:visible='showAdvanceSearch'/>
  <HrmAdditionalProfile v-model:visible='additionalProfile'/>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { PageState } from 'primevue/paginator';
import { computed, onMounted, provide, reactive, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import type { HrmCategory } from '@/apps/hrm/model/category';
import { type Employee, Gender, MaritalStatus } from '@/apps/hrm/model/employee';
import ProfileViewSidebar from '@/apps/hrm/views/profile/detail/ProfileViewSidebar.vue';
import HrmAdditionalProfile from '@/apps/hrm/views/profile/dialog/HrmAdditionalProfile.vue';
import HrmAdvanceSearch from '@/apps/hrm/views/profile/dialog/HrmAdvanceSearch.vue';
import HrmConfigForm from '@/apps/hrm/views/profile/form/config/HrmConfigForm.vue';
import HrmProfileFormSidebar from '@/apps/hrm/views/profile/HrmProfileFormSidebar.vue';
import HrmProfileListWrapper from '@/apps/hrm/views/profile/list/HrmProfileListWrapper.vue';
import { vietnamProvinces } from '@/common/constants/profile';
import { useHrmProfileStore } from '@/common/store/hrm-profile';
import { useGlobalSearchStore } from '@/common/store/search';

const { setAdvancedSearch } = useGlobalSearchStore();
const formVisible = ref(false);
const detailVisible = ref(false);
const configFormVisible = ref(false);
const { t } = useI18n();
const listRef = ref<InstanceType<typeof HrmProfileListWrapper>>();

const profileEdit = ref<Employee>({} as Employee);
const needRefresh = ref(false);
const hasPermission = usePermissionStore().hasPermission;
const viewProfileHis = ref<any[]>([]);
type ViewTypeInterface = 'isParty' | 'cityFilter' | 'isMember' | 'militaryService' | 'all' | '';
const viewType = ref<ViewTypeInterface>('all');
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const { setFields } = useGlobalSearchStore();
const hrmStore = useHrmProfileStore();
const { treeUnitData } = storeToRefs(hrmStore);
const showAdvanceSearch = ref(false);
const additionalProfile = ref(false);
const bankTaxVisible = ref(false);
const viewTypeMenu = computed(() => [
  {
    label: t('Đầy đủ'),
    key: 'all',
    command: () => {
      viewType.value = 'all';
    },
  },
  {
    label: t('hrm.profile.filterOption.byCity'),
    key: 'cityFilter',
    command: () => {
      viewType.value = viewType.value === 'cityFilter' ? '' : 'cityFilter';
    },
  },
  {
    label: t('hrm.profile.filterOption.byDangvien'),
    key: 'isParty',
    command: () => {
      viewType.value = viewType.value === 'isParty' ? '' : 'isParty';
    },
  },
  {
    label: t('hrm.profile.filterOption.byArmy'),
    key: 'militaryService',
    command: () => {
      viewType.value = viewType.value === 'militaryService' ? '' : 'militaryService';
    },
  },
  {
    label: t('hrm.profile.filterOption.byDoanvien'),
    key: 'isMember',
    command: () => {
      viewType.value = viewType.value === 'isMember' ? '' : 'isMember';
    },
  }
]);

function resetData() {
  profileEdit.value = {} as Employee;
}

function createProfile() {
  resetData();
  formVisible.value = true;
}

const size = 50;
const pageable = reactive({
  page: 0,
  size
});

const total = ref(0);

function onPage(event: PageState) {
  pageable.page = event.page;
}

const genderOptions = computed(() => Object.keys(Gender).map((key) => ({
  name: t('hrm.profile.general.genderOptions.' + camelCase(key)),
  id: key
}))
);
const maritalStatusOptions = computed(() => Object.keys(MaritalStatus).map((key) => ({
  name: t('hrm.profile.general.maritalStatusOptions.' + camelCase(key)),
  id: key
})));

const homeTownOption = computed(() => vietnamProvinces);

const jobPositions = ref([]);
const educationLevels = ref([]);
const specializedJobs = ref([]);
const trainingForms = ref([]);
const majors = ref([]);
const ethnicities = ref([]);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());

const getPosition = (type: string, targetRef: Ref) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    targetRef.value = (res.data.getAllCategory as HrmCategory[]).map(c => ({
      name: c.name,
      id: c.code
    })) || [];
  });
};

const mapToOption = (type: string, targetRef: Ref) => {
  getAllCategory(userDeptRole.value, type).onResult((res) => {
    targetRef.value = (res.data.getAllCategory as HrmCategory[]).map(c => ({
      name: c.name,
      id: c.name
    })) || [];
  });
};

const createAdditionalProfile = () => {
  additionalProfile.value = true;
};

onMounted(() => {
  getPosition(CATEGORY_TYPE.JOB_POSITION, jobPositions);
  mapToOption(CATEGORY_TYPE.EDUCATION_LEVEL, educationLevels);
  getPosition(CATEGORY_TYPE.SPECIALIZED_JOB, specializedJobs);
  getPosition(CATEGORY_TYPE.TRAINING_FORM, trainingForms);
  getPosition(CATEGORY_TYPE.MAJOR, majors);
  getPosition(CATEGORY_TYPE.ETHNICITY, ethnicities);
  setFields({
    organization: {
      label: 'Chọn đơn vị',
      col: 6,
      isTreeSingleSelect: true,
      optionsTreeSelect: treeUnitData,
    },
    gender: {
      label: 'Giới tính',
      col: 6,
      type: String,
      optionsDropdown: genderOptions,
    },
    jobPositions: {
      label: 'Chức vụ',
      col: 6,
      type: String,
      isMultiSelect: true,
      optionsDropdown: jobPositions,
    },
    homeTown: {
      label: 'Quê quán',
      type: String,
      optionsDropdown: homeTownOption,
      col: 6,
    },
    highestLevel: {
      label: 'Trình độ học vấn',
      type: String,
      optionsDropdown: educationLevels,
      isMultiSelect: true,
      col: 6,
    },
    permanentResident: {
      label: 'Hộ khẩu thường trú',
      type: String,
      optionsDropdown: homeTownOption,
      col: 6,
    },
    trainingType: {
      label: 'Loại hình đào tạo',
      type: String,
      optionsDropdown: trainingForms,
      isMultiSelect: true,
      col: 6,
    },
    nation: {
      label: 'Dân tộc',
      type: String,
      optionsDropdown: ethnicities,
      isMultiSelect: true,
      col: 6,
    },
    joinDateFrom: {
      label: 'Ngày vào làm: Từ ngày',
      type: String,
      col: 3,
      isDatePicker: true,
    },
    joinDateTo: {
      label: 'Ngày vào làm: Đến ngày',
      type: String,
      col: 3,
      isDatePicker: true,
    },
    birthDayFrom: {
      label: 'Ngày sinh: Từ ngày',
      type: String,
      col: 3,
      isDatePicker: true,
    },
    birthDayTo: {
      label: 'Ngày sinh: Đến ngày',
      type: String,
      col: 3,
      isDatePicker: true,
    },
    specialized: {
      label: 'Chuyên ngành',
      type: String,
      optionsDropdown: majors,
      isMultiSelect: true,
      col: 6,
    },
    maritalStatus: {
      label: 'Tình trạng hôn nhân',
      type: String,
      optionsDropdown: maritalStatusOptions,
      col: 6,
    },
    professionalLevel: {
      label: 'Công việc chuyên môn',
      type: String,
      optionsDropdown: specializedJobs,
      isMultiSelect: true,
      col: 6,
    },
    isMember: {
      label: t('hrm.profile.general.isMember'),
      type: String,
      isCheckbox: true,
      col: 2,
    },
    isParty: {
      label: t('hrm.profile.general.isParty'),
      type: String,
      isCheckbox: true,
      col: 2,
    },
    militaryService: {
      label: t('hrm.profile.general.militaryService'),
      type: String,
      isCheckbox: true,
      col: 2,
    },

    // splitButton: {
    //   label: '',
    //   col: 3,
    //   isSplitButton: true,
    // }
  });
});

const employeeId = ref<{ id: string; snapshotId?: string }>({
  id: '',
  snapshotId: undefined
});

function setEmployeeId(val: { id: string; snapshotId?: string }) {
  employeeId.value = val;
}

provide('employeeId', {
  get: () => employeeId.value,
  set: setEmployeeId
});

provide('profileEdit', profileEdit);

provide('formVisible', formVisible);
provide('bankTaxVisible', bankTaxVisible);
provide('detailVisible', detailVisible);
provide('needRefresh', needRefresh);
provide('resetData', resetData);
provide('pageable', pageable);
provide('total', total);
provide('viewType', viewType);

const loading = ref(false);

const openAdvancedSearch = () => {
  setAdvancedSearch(true);
};
// Hiển thị loading khi profileEdit thay đổi
watch(
  () => profileEdit.value?.employeeId,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
      }, 500); // Giả lập thời gian loading, thay bằng logic thực tế nếu có
    }
  }
);
</script>

<style scoped>
:deep(.p-paginator) {
  border: unset;
  padding: unset;
}

.custom-paginator-wrapper {
  display: flex;
  height: 40px;
  position: relative;
  margin-right: 2rem;
  align-items: center;
  overflow: hidden;
}

:deep(.p-paginator-page-options) {
  display: flex;
  align-items: center;
  height: 2.5rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  height: 2rem;
  min-width: 2rem;
  border-radius: 6px;
}

.overlay-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-skeleton {
  width: 480px;
  min-height: 100vh;
  background: #fff;
  border-left: 1px solid #eee;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-header {
  height: 32px;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
  border-radius: 8px;
  animation: skeleton-loading 1.2s infinite linear;
}

.skeleton-content {
  height: 20px;
  width: 90%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
  border-radius: 6px;
  animation: skeleton-loading 1.2s infinite linear;
}

.skeleton-content.short {
  width: 50%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}
</style>
