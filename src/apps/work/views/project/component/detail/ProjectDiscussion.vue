<template>
  <div class='w-full'>
    <TabView
      class='w-full'
      :pt="{
        navContainer:{
          class:'static',
        },
        panelContainer:{
          class:['p-0'],
          style:{maxHeight:'70vh'}
        }
      }">
      <TabPanel>
        <template #header>
          <div class='align-items-center flex gap-1'>
            <AppIcon
              name='chat'
              size='1.2'></AppIcon>
            Thảo luận
          </div>
        </template>
        <div
          class='flex flex-column relative'
          style='height:75vh'>
          <AppChat
            class='flex-grow-1'
            :messages='messages'
            :number-message='totalMessage'
            @load-more='loadMoreMessage'/>
        </div>
      </TabPanel>
      <TabPanel>
        <template #header>
          <span class='font-semibold'>Tệp</span>
        </template>
        <TabView
          :lazy='true'
          :pt="{navContainer:{
            class:['static']
          }}">
          <TabPanel header='Files'>
            <div class='flex justify-content-center overflow-auto p-0'>
              <FilesDiscussion :files-on-date='filesByDate'/>
            </div>
          </TabPanel>
          <TabPanel header='Ảnh/Video'>
            <div class='flex justify-content-center overflow-auto p-0'>
              <FilesDiscussion :files-on-date='filesByDateOnlyImg'/>
            </div>
          </TabPanel>
        </TabView>
      </TabPanel>

    </TabView>
  </div>

  <!--  <div-->
  <!--    class='flex'>-->
  <!--    <div-->
  <!--      class='col-9 flex flex-column relative'-->
  <!--      style='height: 78vh'>-->

  <!--    </div>-->
  <!--    <div class='col'>-->
  <!--      <TabView :lazy='true'>-->
  <!--        <TabPanel header='Files'>-->
  <!--          <div class='card flex justify-content-center overflow-auto p-0'>-->
  <!--            <FilesDiscussion :files-on-date='filesByDate'/>-->
  <!--          </div>-->
  <!--        </TabPanel>-->
  <!--        <TabPanel header='Ảnh/Video'>-->
  <!--          <div class='card flex justify-content-center overflow-auto p-0'>-->
  <!--            <FilesDiscussion :files-on-date='filesByDateOnlyImg'/>-->
  <!--          </div>-->
  <!--        </TabPanel>-->
  <!--      </TabView>-->
  <!--    </div>-->
  <!--  </div>-->
</template>

<script lang="ts" setup>

import { get } from 'lodash';
import { onMounted, onUnmounted, provide, reactive, ref, watch } from 'vue';

import { getMessage } from '@/apps/work/api/graphql/project-discussion-api';
import { getListFileOfDiscussion } from '@/apps/work/api/graphql/work-attachment';
import {
  createProjectDiscussion,
  deleteComment,
  getDiscussionByProjectId,
  sendMessage,
  uploadFiles
} from '@/apps/work/api/rest/project-discussion';
import { type WorkAttachmentByDate } from '@/apps/work/data/WorkAttachment';
import type { ProjectDiscussion } from '@/apps/work/model/projectDiscussion';
import FilesDiscussion from '@/apps/work/views/project/component/detail/FilesDiscussion.vue';
import AppChat from '@/common/components/app/AppChat.vue';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import type { Connection } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
});

const refetchListFile = ref(false);
const filesByDate = ref<WorkAttachmentByDate[]>([] as WorkAttachmentByDate[]);
const filesByDateOnlyImg = ref<WorkAttachmentByDate[]>([] as WorkAttachmentByDate[]);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [{
    property: 'createdTime',
    direction: Direction.DESC
  }]
});

const {
  onResult: messageResult,
  load: messageLoad,
  restart: messageRestart,
  refetch: messageRefetch
} = getMessage(props.projectId, pageable);

const { onResult: filesOnResult, refetch: filesRefetch } = getListFileOfDiscussion(props.projectId, false);
const { onResult: filesImgOnResult, refetch: filesImgRefetch } = getListFileOfDiscussion(props.projectId, true);

const isSend = ref(false);
const totalMessage = ref(0);

onMounted(() => {
  EventBus.on('send-message', send);
  messageLoad(undefined, {
    projectId: props.projectId,
    pageable: pageable
  });
});

onUnmounted(() => {
  EventBus.off('send-message', send);
});

function send(messageEmit: any) {
  isSend.value = true;
  messageEmit = {
    ...messageEmit,
    projectId: props.projectId
  };
  sendMessage(messageEmit).finally(() => {
    messages.value = [];
    if (pageable.page == 0) {
      messageRestart();
    } else {
      pageable.page = 0;
    }

    refetchListFile.value = true;
    filesRefetch();
    filesImgRefetch();
  });
}

function loadMoreMessage() {
  if (!isSend.value) {
    pageable.page++;
  } else {
    isSend.value = false;
    pageable.size = 10;
  }
}

const messages = ref<ProjectDiscussion[]>([] as ProjectDiscussion[]);

messageResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.getMessage', {
    totalCount: 0,
    edges: []
  }) as Connection<ProjectDiscussion>;
  totalMessage.value = totalCount;
  messages.value = [
    ...messages.value,
    ...edges.map(e => e.node)
  ];
});

filesOnResult((res) => {
  filesByDate.value = res.data.getListFileOfDiscussion;
});

filesImgOnResult((res) => {
  filesByDateOnlyImg.value = res.data.getListFileOfDiscussion;
});

provide('saveComment', createProjectDiscussion);
provide('replyCommentsByRepliedCommentId', getDiscussionByProjectId);
provide('deleteComment', deleteComment);
provide('uploadFiles', uploadFiles);
watch(() => props.projectId, projectId => {
  const variables = {
    projectId: projectId,
    pageable: pageable
  };
  messageLoad(undefined, variables) || messageRefetch(variables);
});

</script>

<script lang="ts">
export default { name: 'ProjectDiscussion' };
</script>

<style scoped>
</style>