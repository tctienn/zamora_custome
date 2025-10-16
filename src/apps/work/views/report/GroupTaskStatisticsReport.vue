<template>
  <div ref='tableHeader'>
    <DataTable
      :pt='{
        tbody: {
          class: "hidden"
        },
        wrapper: {
          class: "overflow-hidden"
        }
      }'
      show-gridlines>
      <Column
        class='text-center'
        frozen
        header='TT'
        style='min-width: 3vw'>
      </Column>
      <Column
        frozen
        :header='t(`work.report.name`)'
        style='min-width: 18vw'></Column>
      <Column
        :header='t(`work.report.projectName`)'
        style='min-width: 10vw'></Column>
      <Column
        :header='t(`work.report.assignerName`)'
        style='min-width: 8vw'>
      </Column>
      <Column
        :header='t(`work.report.follower`)'
        style='min-width: 15vw'>
      </Column>
      <Column
        :header='t(`work.report.description`)'
        style='min-width: 15vw'>
      </Column>
      <Column
        class='text-center'
        :header='t(`work.report.startTime`)'
        style='min-width: 8vw'>
      </Column>
      <Column
        class='text-center'
        :header='t(`work.report.dueTime`)'
        style='min-width: 8vw'>
      </Column>
      <Column
        body-class='percent'
        class='text-center'
        :header='t(`work.report.percent`)'
        style='min-width: 6vw'>
      </Column>
      <Column
        body-class='statusName'
        class='text-center'
        :header='t(`work.report.statusName`)'
        style='min-width: 8vw'></Column>
      <Column
        class='text-center'
        :header='t(`work.report.createdTime`)'
        style='min-width: 8vw'>
      </Column>
    </DataTable>
  </div>
  <div ref='tableBody'>
    <DataTable
      v-model:expandedRows='expandedOrganizations'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      data-key='organizationName'
      expandable-rows
      :pt='{
        headerrow: {
          class: "hidden"
        },
        rowexpansioncell: {
          class: "p-0"
        }
      }'
      :row-hover='false'
      scroll-height='calc(100vh - 13rem + 8px)'
      :value='groupedByOrganization'>
      <Column
        body-class='font-bold py-3'
        field='organizationName'
        style='background: rgb(207, 226, 243);'/>

      <template #expansion='orgSlot'>
        <DataTable
          v-model:expandedRows='expandedParticipants'
          data-key='groupName'
          expandable-rows
          :pt='{
            headerrow: {
              class: "hidden"
            },
            rowexpansioncell: {
              class: "p-0"
            }
          }'
          show-gridlines
          :value='orgSlot.data.tasks'>

          <Column
            body-class='font-bold'
            field='groupName'>
            <template #body='{ data: { groupName }, index }'>
              {{ index + 1 }}. {{ groupName }}
            </template>
          </Column>

          <template #expansion='partSlot'>
            <DataTable
              :pt='{
                headerrow: {
                  class: "hidden"
                },
              }'
              :row-hover='true'
              :value='partSlot.data.reports'>
              <Column
                class='text-center'
                frozen
                header='TT'
                style='min-width: 3vw'>
                <template #body='slotProps'>
                  <div
                    class='align-items-center flex items-center justify-content-center'>
                    {{ slotProps.index + 1 }}
                  </div>
                </template>
              </Column>
              <Column
                field='name'
                frozen
                :header='t(`work.report.name`)'
                style='min-width: 18vw'></Column>

              <Column
                field='projectName'
                :header='t(`work.report.projectName`)'
                style='min-width: 10vw'></Column>

              <Column
                field='assignerName'
                :header='t(`work.report.assignerName`)'
                style='min-width: 8vw'>
              </Column>

              <Column
                field='follower'
                :header='t(`work.report.follower`)'
                style='min-width: 15vw'>
                <template #body='{ data: { follower } }'>
                  {{
                    follower
                      ?.split(',')
                      .map((user: string) => usersMoreInfo[user]?.fullName)
                      .join(', ')
                  }}
                </template>
              </Column>

              <Column
                field='description'
                :header='t(`work.report.description`)'
                style='min-width: 15vw'>
                <template #body='{ data: { description } }'>
                  {{
                    description &&
                      parser.parseFromString(description, 'text/html').body.textContent
                  }}
                </template>
              </Column>

              <Column
                class='text-center'
                field='startTime'
                :header='t(`work.report.startTime`)'
                style='min-width: 8vw'>
                <template #body='{ data: { startTime } }'>
                  {{ moment(startTime).format('DD/MM/YYYY') }}
                </template>
              </Column>
              <Column
                class='text-center'
                field='dueTime'
                :header='t(`work.report.dueTime`)'
                style='min-width: 8vw'>
                <template #body='{ data: { dueTime } }'>
                  {{ dueTime && moment(dueTime).format('DD/MM/YYYY') }}
                </template>
              </Column>

              <Column
                body-class='percent'
                class='text-center'
                field='percent'
                :header='t(`work.report.percent`)'
                style='min-width: 6vw'>
                <template #body='{ data: { percent } }'>
                  <div v-if='percent'>{{ percent }}%</div>
                </template>
              </Column>
              <Column
                body-class='statusName'
                class='text-center'
                field='statusName'
                :header='t(`work.report.statusName`)'
                style='min-width: 8vw'></Column>

              <Column
                class='text-center'
                field='createdTime'
                :header='t(`work.report.createdTime`)'
                style='min-width: 8vw'>
                <template #body='{ data: { createdTime } }'>
                  {{ createdTime && moment(createdTime).format('DD/MM/YYYY') }}
                </template>
              </Column>
            </DataTable>
          </template>
        </DataTable>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findAllTaskWithGroupType } from '@/apps/work/api/graphql/report';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const parser = new DOMParser();
const { moment } = useMoment();
const { t } = useI18n();
const pageable = reactive({
  page: 0,
  size: 50,
  sort: [
    {
      property: 'createdTime',
      direction: 'ASC',
    },
  ],
});
const expandedOrganizations = ref();
const expandedParticipants = ref();
const data = ref<any[]>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const organizations = ref([]);
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  organizations.value = response.data.allOrganizationPublic;
});

const {
  onResult: findAllTaskWithGroupTypeResult,
  refetch: findAllTaskWithGroupTypeRefetch
} =
  findAllTaskWithGroupType({ pageable });

const groupedByOrganization = computed(() =>
  groupData(data.value, organizations.value)
);

findAllTaskWithGroupTypeResult((res) => {
  const { edges } = get(res, 'data.findAllTaskWithGroupType', { edges: [], });
  if (isLoadMore.value) {
    data.value = [
      ...data.value,
      ...edges.map((edge: any) => ({ ...edge.node })),
    ];
  } else {
    data.value = edges.map((edge: any) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= 50;
  isLoadMore.value = false;
});

watch(groupedByOrganization, (newVal) => {
  expandedOrganizations.value = newVal.reduce((acc: any, org: any) => {
    acc[org.organizationName] = true;
    return acc;
  }, {});

  expandedParticipants.value = newVal.reduce((acc: any, org: any) => {
    org.tasks.forEach((participant: any) => {
      acc[participant.groupName] = true;
    });
    return acc;
  }, {});
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

function groupData(tasks: any[], organizations: any[]): any {
  const result: any = [];

  organizations?.forEach((org: any) => {
    const userMap = Object.fromEntries((org.users || []).map((u: any) => [u.id, u.fullName]));

    const orgTasks = tasks.filter((task: any) => userMap[task.participantId]);

    if (orgTasks.length === 0) {
      return;
    }

    const groupedParticipants = Object.values(
      orgTasks.reduce((acc: any, task: any) => {
        const name = task.groupName;
        if (!acc[name]) {
          acc[name] = {
            groupName: name,
            reports: []
          };
        }
        acc[name].reports.push(task);
        return acc;
      }, {})
    );

    result.push({
      organizationName: org.name,
      tasks: groupedParticipants
    });
  });

  return result;
}

const tableHeader = ref<HTMLElement | null>();
const tableBody = ref<HTMLElement | null>();
onMounted(() => {
  const headerWrapper = tableHeader.value?.querySelector('.p-datatable-wrapper') as HTMLElement;
  const bodyWrapper = tableBody.value?.querySelector('.p-datatable-wrapper') as HTMLElement;
  if (headerWrapper && bodyWrapper) {
    bodyWrapper.addEventListener('scroll', () => {
      headerWrapper.scrollLeft = bodyWrapper.scrollLeft;
    });
  }
});
</script>

<style scoped>
:deep(.numDayExtend) {
  background: #FFF5F5;
}

:deep(.percent) {
  background: #EFFAFE;
}

:deep(.statusName) {
  background: #F0FBF7;
}
</style>