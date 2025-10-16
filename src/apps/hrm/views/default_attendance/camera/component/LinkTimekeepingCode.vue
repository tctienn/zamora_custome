<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    :value='data'>
    <Column
      class='text-center'
      :header='t("common.ordinalNumber")'
      style='width: 5%'>
      <template #body='{index}'>
        {{ index + 1 }}
      </template>
    </Column>
    <Column
      field='fullName'
      :header='t("common.name")'
      style='width: 10%'>
    </Column>
    <Column
      class='text-center'
      field='code'
      :header='t("hrm.profile.general.code")'
      style='width: 10%'>
    </Column>
    <Column
      class='text-center'
      field='managerCode'
      :header='t("hrm.profile.general.managerCode")'
      style='width: 10%'>
    </Column>
    <Column
      class='text-center'
      field='birthDay'
      :header='t("hrm.profile.general.birthDay")'>
      <template #body='{ data: { birthDay } }'>
        {{ birthDay && moment(birthDay).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='gender'
      :header='t("hrm.profile.general.gender")'
      style='width: 7%'>
      <template #body='{ data: { gender } }'>
        {{ t('hrm.profile.general.genderOptions.' + camelCase(gender)) }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='birthPlace'
      :header='t("hrm.profile.general.birthPlace")'
      style='width: 20%'>
    </Column>
    <Column
      class='text-center'
      field='joinDate'
      :header='t("hrm.profile.general.joinDate")'>
      <template #body='{ data: { joinDate } }'>
        {{ joinDate && moment(joinDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      class='text-center'
      field=''
      :header="t('hrm.profile.general.timeKeepingCode')"
      style='width: 13%'>
      <template #body='{ data: rowData }'>
        <div
          v-if='rowData.aliasId'
          class='align-items-center flex justify-content-between'>
          <div></div>
          <Chip
            class='bg-teal-400 text-white'
            :label='rowData.aliasId'/>
          <AppIcon
            class='cursor-pointer'
            name='close'
            size='1.5'
            @click='deleteMap(rowData.id)'/>
        </div>
        <Dropdown
          v-else
          v-model='rowData.cameraPersonId'
          class='w-full'
          filter
          option-value='id'
          :options='listAlias'
          @change='handleSelect(rowData)'>
          <template #value='{ value }'>
            <div
              v-if='value'
              class='align-items-center flex justify-content-between'>
              <div>{{ value.aliasId }}</div>
            </div>
          </template>
          <template #option='{ option }'>
            <div class='align-items-center flex'>
              <div class='align-items-center flex gap-2'>
                <HrmAvatar
                  :avatar='generateAvatarUrl(option.avatar)'
                  class='border-round-sm cursor-pointer'
                  width='2.5rem'/>
                <div class='flex flex-column gap-2'>
                  <div>{{ option.name }}</div>
                  <div>{{ option.aliasId }}</div>
                </div>
              </div>
            </div>
          </template>
        </Dropdown>
      </template>
    </Column>

  </DataTable>
</template>

<script lang='ts' setup>

import { camelCase, get } from 'lodash';
import Column from 'primevue/column';
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteMapEmployeeCamPerson,
  getAllMapEmployeeCamPerson,
  getUnmappedCameraPersons,
  saveMapEmployeeCamPerson
} from '@/apps/hrm/api/graphql/camera';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
});
const { moment } = useMoment();
const { t } = useI18n();
const {
  onResult: getAllMapEmployeeCamPersonResult,
  refetch: getAllMapEmployeeCamPersonRefetch
} = getAllMapEmployeeCamPerson(pageable);
const data = ref<any[]>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);

getAllMapEmployeeCamPersonResult(res => {
  const { edges } = get(res, 'data.getAllMapEmployeeCamPerson', {
    totalCount: 0,
    edges: [],
  });
  if (isLoadMore.value) {
    data.value = [
      ...data.value,
      ...edges.map((edge: any) => ({ ...edge.node })),
    ];
  } else {
    data.value = edges.map((edge: any) => ({ ...edge.node, }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

const reload = () => {
  pageable.page = 0;
  getAllMapEmployeeCamPersonRefetch();
  getUnmappedCameraPersonsRefetch();
};

const {
  onResult: getUnmappedCameraPersonsResult,
  refetch: getUnmappedCameraPersonsRefetch
} = getUnmappedCameraPersons();

const listAlias = ref();

getUnmappedCameraPersonsResult((res) => {
  listAlias.value = res.data.getUnmappedCameraPersons;
});

const {
  mutate: saveMapEmployeeCamPersonMutate,
  onDone: saveMapEmployeeCamPersonDone
} =
  saveMapEmployeeCamPerson();

const handleSelect = (data: any) => {
  saveMapEmployeeCamPersonMutate({
    employeeId: data.id,
    cameraPersonId: data.cameraPersonId
  });
};

saveMapEmployeeCamPersonDone(() => {
  reload();
});

const {
  mutate: deleteMapEmployeeCamPersonMutate,
  onDone: deleteMapEmployeeCamPersonDone
} =
  deleteMapEmployeeCamPerson();

const deleteMap = (id: string) => {
  deleteMapEmployeeCamPersonMutate({ employeeId: id });
};

deleteMapEmployeeCamPersonDone(() => {
  reload();
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
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});
</script>

<style scoped>

</style>