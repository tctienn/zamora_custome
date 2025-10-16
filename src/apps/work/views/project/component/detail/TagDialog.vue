<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    header='Cập nhật mô tả dự án'
    @hide='emits("hide-dialog")'
    @show='showDialog'>
    <div class='flex flex-column gap-2'>
      <label class='font-semibold'>Nhãn</label>
      <MultiSelect
        v-model='selectedTags'
        class='w-full'
        :option-value='optionValue'
        :options='tags'
        placeholder='Chọn nhãn'>
        <template #value='{value}'>
          <Chip
            v-for='(label, index) in value'
            :key='index'
            class='mr-2'
            :label='label.labelTitle'
            :outlined='true'
            removable
            :style="{
              backgroundColor: 'white',
              border: '1px solid ' + label.labelColor,
              color: label.labelColor
            }"
            @remove='removeLabel($event,label)'/>
        </template>
        <template #option='{option}'>
          <span
            :style='{
              color: option?.labelColor
            }'>
            {{ option?.labelTitle }}
          </span>
        </template>
      </MultiSelect>
    </div>

    <template #footer>
      <Button
        icon='pi pi-times'
        :label="t('common.close')"
        severity='danger'
        @click="emits('hide-dialog')"/>
      <Button
        icon='pi pi-check'
        :label="t('common.save')"
        @click='saveLabels'/>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllLabelGraphql } from '@/apps/work/api/graphql/label-api';
import type { Label } from '@/apps/work/model/taskLabel';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  selectedLabels: {
    type: Array as PropType<Label[]>,
    default: () => []
  }
});
const emits = defineEmits(['hide-dialog', 'save-label']);
const visible = defineModel<boolean>('visibleDialog', { default: false });
const { t } = useI18n();
const tags = ref<Label[]>([]);
const selectedTags = ref<Label[]>(cloneDeep(props.selectedLabels));

function showDialog() {
  selectedTags.value = cloneDeep(props.selectedLabels);
}

getAllLabelGraphql().onResult((res) => {
  tags.value = res.data.getAllLabel;
});

function saveLabels() {
  emits('save-label', selectedTags.value);
}

function removeValue(id: string) {
  selectedTags.value = selectedTags.value.filter((tag: Label) => tag.id != id);
}

function optionValue(data: Label) {
  return {
    id: data.id,
    labelColor: data.labelColor,
    labelTitle: data.labelTitle
  };
}

function removeLabel(event: Event, label: Label) {
  event.stopImmediatePropagation();
  selectedTags.value = selectedTags.value.filter(value => value.id != label.id);
}
</script>

<script lang="ts">
export default { name: 'TagDialog' };
</script>

<style scoped>

</style>