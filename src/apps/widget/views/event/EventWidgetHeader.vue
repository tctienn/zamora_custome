<template>
  <div class='flex flex-column px-2 row-gap-2'>
    <div class='align-items-center flex flex-row justify-content-between'>
      <div
        class='align-items-center flex flex-row flex-wrap'>
        <template
          v-for='(filterHeader, index) in filterHeaders'
          :key='index'>
          <span
            class='cursor-pointer'
            :class='{"font-bold text-primary": eventType === filterHeader.value}'
            @click='filterHeader.action'>
            {{ t(filterHeader.label) }}
          </span>

          <Divider
            v-if='index < filterHeaders.length - 1'
            class='mx-3 p-0 surface-border'
            layout='vertical'/>
        </template>
      </div>

      <div class=''>
        <ButtonIcon
          icon='add_circle'
          icon-size='2'
          rounded
          text
          @click='emits("show-save-event-dialog")'/>
      </div>
    </div>

    <div class='column-gap-3 flex flex-row'>
      <div class='align-items-center column-gap-2 flex flex-1 flex-row'>
        <label for='searchName'>{{ t('widget.event.name') }}</label>
        <InputText
          id='searchName'
          v-model='searchName'
          class='p-2 w-15rem'
          @blur='emits("search-keyword", searchName, searchUser)'
          @keydown.enter.prevent='emits("search-keyword", searchName, searchUser)'/>
      </div>

      <div class='align-items-center column-gap-2 flex flex-1 flex-row'>
        <label for='searchUser'>{{ t('widget.event.participant') }}</label>
        <InputText
          id='searchUser'
          v-model='searchUser'
          class='p-2 w-15rem'
          @blur='emits("search-keyword", searchName, searchUser)'
          @keydown.enter.prevent='emits("search-keyword", searchName, searchUser)'/>
      </div>

      <div
        v-if='displayType.value === "list"'
        class='align-items-center column-gap-2 flex flex-1 flex-row'>
        <label for='searchRange'>{{ t('widget.event.time') }}</label>
        <Calendar
          v-model='range'
          class='p-2 w-15rem'
          input-class='text-sm'
          input-id='searchRange'
          :manual-input='true'
          placeholder='dd/mm/yyyy - dd/mm/yyyy'
          selection-mode='range'
          :show-button-bar='true'
          @update:model-value='emits("update-range", range)'/>
      </div>
    </div>

    <div
      v-if='displayType.value === "list"'
      class='align-items-center flex flex-row flex-wrap'>
      <template
        v-for='(rangeHeader, index) in rangeHeaders'
        :key='index'>
        <span
          class='cursor-pointer'
          :class='{"font-bold text-primary": rangeType === rangeHeader.key}'
          @click='selectRangeType(rangeHeader.key)'>
          {{ t(rangeHeader.label) }}
        </span>

        <Divider
          v-if='index < rangeHeaders.length - 1'
          class='mx-3 p-0 surface-border'
          layout='vertical'/>
      </template>

      <div class='ml-auto'>
        <SelectButton
          aria-labelledby='basic'
          :model-value='displayType'
          :options='displayTypes'
          :unselectable='true'
          @update:model-value='updateDisplayType'>
          <template #option='{option: {icon}}'>
            <AppIcon
              :name='icon'
              size='1.25'/>
          </template>
        </SelectButton>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { mapEnum } from '@/common/helpers/utils';
import { type DisplayType, EventType } from '@/common/model/widget/event';

defineProps({
  eventType: {
    type: String,
    default: ''
  },
  rangeType: {
    type: String,
    default: 'week'
  },
  displayTypes: {
    type: Array as PropType<DisplayType[]>,
    required: true
  },
  displayType: {
    type: Object as PropType<DisplayType>,
    required: true
  }
});
const emits = defineEmits(['show-save-event-dialog', 'update-event-type', 'update-range-type', 'update-range', 
  'search-keyword', 'update:displayType']);
const { t } = useI18n();

const searchName = ref('');
const searchUser = ref('');
const range = ref();

const allEventType = mapEnum(EventType).join(',');
let filterHeaders = reactive([
  {
    key: 'personal',
    label: 'widget.event.personal',
    value: EventType[EventType.PERSONAL],
    action: () => emits('update-event-type', EventType[EventType.PERSONAL])
  },
  {
    key: 'group',
    label: 'widget.event.group',
    value: EventType[EventType.GROUP],
    action: () => emits('update-event-type', EventType[EventType.GROUP])
  },
  {
    key: 'organization',
    label: 'widget.event.organization',
    value: EventType[EventType.ORGANIZATION],
    action: () => emits('update-event-type', EventType[EventType.ORGANIZATION])
  },
  {
    key: 'system',
    label: 'widget.event.system',
    value: EventType[EventType.SYSTEM],
    action: () => emits('update-event-type', EventType[EventType.SYSTEM])
  },
  {
    key: 'all',
    label: 'common.all',
    value: allEventType,
    action: () => emits('update-event-type', allEventType)
  }
]);

let rangeHeaders = reactive<{ key: 'day' | 'week' | 'month', label: string }[]>([
  {
    key: 'day',
    label: 'widget.event.day',
  },
  {
    key: 'week',
    label: 'widget.event.week',
  },
  {
    key: 'month',
    label: 'widget.event.month',
  }
]);

function selectRangeType(type: 'day' | 'week' | 'month') {
  range.value = [null, null];
  emits('update-range-type', type);
  emits('update-range', range.value);
}

function updateDisplayType(value: DisplayType) {
  emits('update:displayType', value);
}

</script>

<script lang='ts'>
export default { name: 'EventWidgetHeader' };
</script>

<style scoped lang='scss'>
:deep(.p-selectbutton) {
  display: flex;

  .p-button {
    width: 3rem;
    padding: 0.75rem 0;
    justify-content: center;
  }
}
</style>