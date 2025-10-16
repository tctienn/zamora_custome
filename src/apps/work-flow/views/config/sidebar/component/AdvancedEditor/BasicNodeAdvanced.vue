<template>
  <div class='field'>
    <div
      v-if='flowType?.statuses?.length|| -1>0'
      class='align-items-center flex justify-content-between'>
      <div class='align-items-center flex'>
        <Checkbox
          :binary='true'
          :model-value='optionsCheck'
          @update:model-value='updateStatusCheck'/>
        <label
          class='font-semibold ml-2'> {{ t('work-flow.flow.changeStatus') }} </label>
      </div>
      <Dropdown
        :model-value='currNode?.data?.status'
        :options='flowType?.statuses'
        :style="{ visibility: optionsCheck ? 'visible' : 'hidden' }"
        @update:model-value='updateStatus'>
      </Dropdown>
    </div>
  </div>
  <div class='field'>
    <div class='align-items-center flex justify-content-between'>
      <label class='font-semibold'>
        {{ t('work-flow.flow.sendRequest') }}
      </label>
      <AppIcon
        v-tooltip.top='t("work-flow.flow.addRequest")'
        class='cursor-pointer'
        :fill='false'
        name='add_circle'
        size='1.5'
        @click='addRequest'>
      </AppIcon>
    </div>
    <div class='flex flex-column gap-2'>
      <div
        v-for='(_,index) in currNode?.data?.requestList||[]'
        :key='index'>
        <InputGroup>
          <Dropdown
            class='flex-grow-0 font-semibold'
            :model-value='currNode?.data?.requestList[index]?.method'
            :options='requestOptions'
            :pt='{
              trigger: {
                style: {
                  display: "none"
                }
              }
            }'
            style='min-width: 6rem'
            @update:model-value='updateRequestListMethod($event,index)'>
            <template #value='{value}'>
              <span
                class='uppercase'
                :style='{color:methodColor[value]}'> {{ value }} </span>
            </template>
            <template #option='{option}'>
              <span
                class='font-semibold uppercase'
                :style='{color:methodColor[option]}'> {{ option }} </span>
            </template>
          </Dropdown>
          <AutoComplete
            :model-value='currNode?.data?.requestList[index]?.url'
            placeholder='URL'
            :suggestions='suggestUrls'
            @complete='searchUrl'
            @update:model-value='updateRequestListUrl($event,index)'>
            <template #empty>
              <span class='block text-600 text-center'>{{
                t('common.emptyRecords', {itemType: toLower(t('work-flow.flow.emptyUrl'))})
              }}</span>
            </template>

          </AutoComplete>
          <ButtonIcon
            v-if='currNode?.data?.requestList[index]?.method!=="get"'
            :icon='`${currNode?.data?.requestList[index]?.showMore?"keyboard_arrow_up":"keyboard_arrow_down"}`'
            @click='updateRequestListShowMore(index)'/>
        </InputGroup>
        <div
          v-if='currNode?.data?.requestList[index]?.showMore&& currNode?.data?.requestList[index]?.method!="get"'
          class='mt-1'>
          <div class='align-items-center flex flex-row gap-2'>
            <div
              class='align-items-center flex flex-row gap-1'>
              <Checkbox
                v-tooltip.top='"Send with body"'
                binary
                :model-value='currNode.data.requestList[index]?.sendWithBody'
                @update:model-value='updateRequestListSendWithBody(index)'>
              </Checkbox>
              Body:
            </div>
            <div class='relative w-full'>
              <Textarea
                auto-resize
                class='w-full'
                :model-value='currNode.data.requestList[index]?.body'
                rows='5'
                @focusout='getBeautifyJson(index)'
                @update:model-value='updateBodyRequestList($event,index)'>
            </Textarea>
              <div
                class='absolute cursor-pointer'
                style='top:2px;right:2px'>
                <a
                  class='hover:underline no-underline'
                  @click.prevent='getBeautifyJson(index)'>
                  {{ t('work-flow.flow.beautify') }}
                </a>
              </div>
              <!--              <span-->
              <!--                v-if='!isValidJson'-->
              <!--                class='absolute'-->
              <!--                style='bottom:4px;left:4px;color:red'>-->
              <!--                Invalid json-->
              <!--              </span>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if='flowType?.optionActions'
    class='field'>
    <label class='font-semibold'>
      Hành động khác
    </label>
    <div class='flex flex-column gap-2'>
      <div
        v-for='(ac) in flowType?.optionActions'
        :key='ac.name'
        class='align-items-center flex gap-2'>
        <Checkbox
          v-model='optionActions[ac.name]'
          binary
          @update:model-value='updateOptionAction(ac,$event)'/>
        {{ ac.label }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { toLower } from 'lodash';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import { inject, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Outcome } from '@/apps/work-flow/model/flow';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import { updateNodeDataByField } from '@/apps/work-flow/views/config/sidebar/UpdateNodeData';

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  storeId: {
    type: String,
    default: 'main'
  }
});
const { findNode } = useVueFlow(props.storeId);
let currNode: GraphNode | undefined;
watch(() => props.nodeId, value => {
  currNode = findNode(props.nodeId);
}, { immediate: true });
const optionActions = ref<Record<string, boolean>>({});
watch(() => currNode, (value) => {
  optionActions.value = {};
  currNode?.data?.optionActions?.forEach((e: Outcome) => {
    optionActions.value[e.name] = true;
  });
}, {
  once: true,
  immediate: true
});
const optionsCheck = ref<boolean>(!!currNode?.data?.status);
const { t } = useI18n();

function addRequest() {
  if (currNode?.data) {
    currNode.data = {
      ...currNode.data,
      requestList: [...currNode.data.requestList || [], {
        method: 'get',
        showMore: false,
        sendWithBody: false
      }]
    };
  }
}

function updateRequestListProperty(property: string, value: any, index: number) {
  updateNodeDataByField(currNode, 'requestList', value, property, index);
}

function updateStatusCheck(value: any) {
  if (!value) {
    delete currNode?.data.status;
  }
  optionsCheck.value = !optionsCheck.value;
}

function toggleRequestListProperty(property: string, index: number) {
  updateNodeDataByField(currNode, 'requestList', (node: GraphNode) => {
    return !node.data['requestList'][index][property];
  }, property, index);
}

function updateRequestListMethod(value: string, index: number) {
  updateRequestListProperty('method', value, index);
  if (value == 'get') {
    updateRequestListProperty('body', null, index);
  }
}

function updateRequestListUrl(value: string, index: number) {
  updateRequestListProperty('url', value, index);
}

function updateRequestListShowMore(index: number) {
  toggleRequestListProperty('showMore', index);
}

function updateBodyRequestList(value: string, index: number) {
  updateRequestListProperty('body', value, index);
}

function updateRequestListSendWithBody(index: number) {
  toggleRequestListProperty('sendWithBody', index);
}

function updateOptionAction(optionAction: Outcome, value: boolean) {
  updateNodeDataByField(currNode, 'optionActions', (node: GraphNode) => {
    let currData = node.data['optionActions'];
    if (value) {
      currData = [...currData || [], optionAction];
    } else {
      currData = currData.filter((e: Outcome) => e.name != optionAction.name);
      // if(currData){
      //   currData[index] = optionAction;
      // }else{
      //   currData = [optionAction];
      // }
    }

    return currData;
  });
}

function updateStatus(value: any) {
  if (currNode?.data) {
    currNode.data = {
      ...currNode.data,
      status: value
    };
  }
}

const methodColor: { [key: string]: string } = {
  get: '#6bdd9a',
  post: '#ffe47e',
  put: '#74aef6',
  delete: '#f79a8e'
};
const requestOptions = ref<string[]>([
  'get',
  'post',
  'put',
  'delete',
]);
const flowType: Ref<FlowType | undefined> = inject('flowType', {} as Ref<FlowType | undefined>);
const suggestUrls = ref<string[]>(flowType.value?.endpoint.otherUrls || []);

function searchUrl(event: AutoCompleteCompleteEvent) {
  suggestUrls.value = (flowType.value?.endpoint.otherUrls || []).filter((e: string) => e.includes(event.query));
}

const isValidJson = ref<boolean>(true);
const getBeautifyJson = (index: number) => {
  if (currNode?.data) {
    const requestList = [...currNode.data['requestList']];
    let json = requestList[index].body;
    const beautyJson: undefined | string = beautifyJson(json);
    if (beautyJson !== undefined) {
      requestList[index].body = beautyJson;
      isValidJson.value = true;
    } else {
      isValidJson.value = false;
    }
    currNode.data = {
      ...currNode.data,
      requestList: requestList
    };
  }

};

const beautifyJson = (jsonInput: string | undefined) => {
  try {
    if (!jsonInput || jsonInput.trim().length == 0) {
      return '';
    }
    const parsedJson = JSON.parse(jsonInput);
    return JSON.stringify(parsedJson, null, 2);
  } catch (e) {
    return undefined;
  }
};

</script>

<script lang="ts">
interface Request {
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  body: string,
  sendWithBody: boolean,
  showMore: boolean,
}
</script>

<style scoped>

</style>