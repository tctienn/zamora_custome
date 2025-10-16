<template>
  <div class='h-full surface-0'>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      v-model:selection='selectedRow'
      row-hover
      selection-mode='single'
      :value='quickSurveys'>
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
        class='text-center'
        field='code'
        header='Mã số'>
      </Column>

      <Column
        field='questionContent'
        header='Nội dung câu hỏi'
        style='min-width: 15rem'>
      </Column>

      <Column
        class='text-center'
        field='createdDate'
        :header='t(`vehicle.bookingCar.createdDate`)'>
        <template #body='{ data: { createdDate } }'>
          {{ createdDate && moment(createdDate).format('DD/MM/YYYY') }}
        </template>
      </Column>

      <Column
        class='text-center'
        field='deadlineReply'
        header='Hạn trả lời'>
        <template #body='{ data: { deadlineReply } }'>
          {{ deadlineReply && moment(deadlineReply).format('DD/MM/YYYY HH:mm') }}
        </template>
      </Column>

      <Column
        class='text-center'
        field='highlight'
        header='Nổi bật'>
        <template #body='{ data: { highlight } }'>
          <AppIcon
            v-if='highlight'
            name='check'
            size='1.7'/>
        </template>
      </Column>

      <Column
        class='text-center'
        header='Số thành viên'>
        <template #body='{ data: { participants } }'>
          {{ participants.length }}
        </template>
      </Column>

      <Column
        body-class='text-center'
        :header='t("hrm.contract.general.status")'
        style='min-width: 10rem'>
        <template #body='{data}'>
          <Badge
            class='border-round-sm'
            :severity='data["status"] === "APPROVED" ? "success" : "secondary"'
            :value="t(`media.survey.statusOptions.${camelcase(data['status'])}`)"></Badge>
        </template>
      </Column>

      <Column
        class='text-right'>
        <template #body='{ data }'>
          <ButtonIcon
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_vert'
            icon-size='1.7'
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
  </Menu>

  <QuickSurveyForm
    v-if='showForm'
    :id='selectedRow?.id'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>

import camelcase from 'camelcase';
import { get } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteQuickSurvey, searchQuickSurvey } from '@/apps/media/graphql/survey';
import type { QuickSurvey } from '@/apps/media/model/survey';
import QuickSurveyForm from '@/apps/media/views/survey/components/QuickSurveyForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  showQuickSurveyForm: {
    type: Boolean,
    default: false,
  },
});

watch(() => props.showQuickSurveyForm, () => {
  showForm.value = true;
});

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

const pageable = reactive({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'createdTime',
      direction: 'DESC',
    },
  ],
});

const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  pageable.page = 0;
  quickSurveys.value = [];
  searchQuickSurveyRefetch(searchParams);
});

const { moment } = useMoment();
const showForm = ref(false);
const quickSurveys = ref<QuickSurvey[]>([]);
const selectedRow = ref<any>();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const menuRef = ref();

const menuActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      if (selectedRow.value.deadlineReply && new Date(selectedRow.value.deadlineReply) < new Date()) {
        toastError({ message: 'Đã hết hạn trả lời không thể chỉnh sửa' });
      } else {
        showForm.value = true;
      }
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      confirmDeleteQuickSurvey();
    },
  },
];

const {
  onResult: searchQuickSurveyResult,
  refetch: searchQuickSurveyRefetch
} =
  searchQuickSurvey(searchParams);

function reload() {
  searchParams.pageable.page = 0;
  searchQuickSurveyRefetch(searchParams);
}

searchQuickSurveyResult((res) => {
  const { edges } = get(res, 'data.searchQuickSurvey', { edges: [], });
  if (isLoadMore.value) {
    quickSurveys.value = [
      ...quickSurveys.value,
      ...edges.map((edge: any) => ({ ...edge.node })),
    ];
  } else {
    quickSurveys.value = edges.map((edge: any) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

function toggleActionMenu(event: Event, data: any) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

const hideDialogFn = () => {
  showForm.value = false;
  selectedRow.value = undefined;
  reload();
};

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    searchParams.pageable.page += 1;
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
const confirm = useConfirm();
const {
  mutate: deleteQuickSurveyMutate,
  onDone: deleteQuickSurveyOnDone
} =
  deleteQuickSurvey();

const confirmDeleteQuickSurvey = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.questionContent, }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteQuickSurvey();
    },
  });
};

const handleDeleteQuickSurvey = () => {
  deleteQuickSurveyMutate({ id: selectedRow.value?.id });
};

deleteQuickSurveyOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});
</script>

<style scoped>

</style>