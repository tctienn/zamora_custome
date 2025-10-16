<template>
  <PickList
    :model-value='model'
    :show-source-controls='showItemControls'
    :show-target-controls='showItemControls'
    @update:model-value='updateModelValue'>
    <template #sourceheader>
      <div class='align-items-center flex flex-row'>
        <div class='flex-grow-1'>
          {{ sourceHeader || t('common.available') }}
        </div>
        <span
          v-if='showSearch'
          class='p-input-icon-left'>
          <InputGroup>
            <IconField
              class='w-full'
              icon-position='left'>
              <InputIcon class='pi pi-search'/>
              <InputText
                v-model='searchSource'
                class='w-full'
                :placeholder="t('common.search')"
                type='text'/>
            </IconField>
          </InputGroup>
        </span>
      </div>

    </template>
    <template #targetheader>
      <div class='align-items-center flex flex-row'>
        <div class='flex-grow-1'>
          {{ targetHeader || t('common.selected') }}
        </div>
        <span
          v-if='showSearch'
          class='p-input-icon-left'>
          <InputGroup>
            <IconField
              class='w-full'
              icon-position='left'>
              <InputIcon class='pi pi-search'/>
              <InputText
                v-model='searchTarget'
                class='w-full'
                :placeholder="t('common.search')"
                type='text'/>
            </IconField>
          </InputGroup>
        </span>
      </div>
    </template>
    <template #item='{item, index}'>
      <div class='align-items-center flex flex-row'>
        <AppUser
          class='flex-grow-1'
          :class='{"p-disabled": disableItemFn(item)}'
          info-visible
          name-visible
          :user-id='item?.id'/>
        <slot
          :index='index'
          :item='item'
          name='item-action'/>
      </div>

    </template>
  </PickList>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppUser from '@/common/components/app/AppUser.vue';
import { convertAlias } from '@/common/helpers/utils';

export type ExtendUser = {
  id: string
  [key: string]: any
}

const props = defineProps({
  modelValue: {
    type: Array as PropType<ExtendUser[]>,
    required: true
  },
  selected: {
    type: Array as PropType<ExtendUser[]>,
    required: true
  },
  showItemControls: {
    type: Boolean,
    default: false
  },
  sourceHeader: {
    type: String,
    default: undefined
  },
  targetHeader: {
    type: String,
    default: undefined
  },
  showSearch: {
    type: Boolean,
    default: false
  },
  disableItemFn: {
    type: Function as PropType<(u: ExtendUser) => boolean>,
    default: (u: ExtendUser) => false
  }
});

const emits = defineEmits(['update:modelValue', 'update:selected']);

const searchSource = ref('');
const searchTarget = ref('');

const { t } = useI18n();

const model = computed((): ExtendUser[][] => {
  const filter = props.modelValue?.filter(u => !props.selected?.some(s => s.id === u.id))
    .filter(u => filterUser(u, searchSource.value));
  return [filter, props.selected.filter(u => filterUser(u, searchTarget.value))];
});

function filterUser(user: ExtendUser, keyword: string): boolean {
  const s = convertAlias(keyword);
  return !s || (!!convertAlias(user['fullName'])?.includes(s) || !!convertAlias(user['email'])?.includes(s));
}

function updateModelValue(value: ExtendUser[][]) {
  emits('update:modelValue', [...props.modelValue?.filter(u => !filterUser(u, searchSource.value)) || [], ...value[0]]);
  emits('update:selected', [...props.selected?.filter(u => !filterUser(u, searchTarget.value)) || [], ...value[1]]);
}

</script>

<script lang='ts'>
export default { name: 'PickListUser' };
</script>

<style scoped>

</style>